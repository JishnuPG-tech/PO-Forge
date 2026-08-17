import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../features/poforge/models/poforge_models.dart';

class PoforgeApiClient {
  final String baseUrl;
  final Dio _dio;
  final FlutterSecureStorage _storage;

  static const String _tokenKey = 'poforge_jwt_token';
  static const String _userIdKey = 'poforge_user_id';

  PoforgeApiClient({
    String? baseUrl,
    Dio? dio,
    FlutterSecureStorage? storage,
  })  : baseUrl = baseUrl ?? 'https://po-forge.onrender.com/api/v1',
        _dio = dio ?? Dio(),
        _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(
                encryptedSharedPreferences: true,
                sharedPreferencesName: 'poforge_secure_prefs',
              ),
            ) {
    _dio.options.baseUrl = this.baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 60); // 60s for Render cold starts
    _dio.options.receiveTimeout = const Duration(seconds: 60);
    _dio.options.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Hermes-Mobile-Coach/1.0',
    };

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            await clearAuth();
          }
          return handler.next(error);
        },
      ),
    );
  }

  Future<String?> getToken() async {
    // Try secure storage first (preferred)
    try {
      final token = await _storage.read(key: _tokenKey);
      if (token != null && token.isNotEmpty) return token;
    } catch (_) {}

    // Fallback to shared_prefs for migration/legacy
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(_tokenKey);
    } catch (_) {
      return null;
    }
  }

  Future<void> saveToken(String token, String userId) async {
    try {
      await _storage.write(key: _tokenKey, value: token);
      await _storage.write(key: _userIdKey, value: userId);
    } catch (_) {}

    // Also sync to shared_prefs for now (safe fallback)
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_tokenKey, token);
      await prefs.setString(_userIdKey, userId);
    } catch (_) {}
  }

  Future<void> clearAuth() async {
    try {
      await _storage.delete(key: _tokenKey);
      await _storage.delete(key: _userIdKey);
    } catch (_) {}

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_tokenKey);
      await prefs.remove(_userIdKey);
    } catch (_) {}
  }

  Future<bool> validateToken() async {
    try {
      final response = await _dio.get('/auth/profile');
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<String?> login([String email = 'student@poforge.dev', String password = 'demo_password']) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      final data = response.data as Map<String, dynamic>;
      if (data.containsKey('access_token')) {
        final token = data['access_token'] as String;
        await saveToken(token, data['user_id'] as String? ?? 'STUDENT_DEV_001');
        return token;
      }
    } catch (e) {
      // Don't use fake token fallback - let UI show error
      rethrow;
    }
    return null;
  }

  Future<HermesChatResponse?> chatWithHermes(String message) async {
    try {
      final response = await _dio.post('/hermes/chat', data: {
        'user_message': message,
        'task_category': 'TUTORING',
      });
      if (response.data != null) {
        return HermesChatResponse.fromJson(response.data as Map<String, dynamic>);
      }
    } catch (_) {}
    return null;
  }

  Future<List<PoforgeQuestion>> searchQuestions({
    String? query,
    String? subject,
    String? topic,
    int limit = 10,
  }) async {
    try {
      final response = await _dio.get(
        '/questions/search',
        queryParameters: {
          if (query != null) 'query': query,
          if (subject != null) 'subject': subject,
          if (topic != null) 'topic': topic,
          'limit': limit,
        },
      );

      final data = response.data;
      if (data is List) {
        return data.map((json) => PoforgeQuestion.fromJson(json as Map<String, dynamic>)).toList();
      } else if (data is Map && data.containsKey('items')) {
        final items = data['items'] as List;
        return items.map((json) => PoforgeQuestion.fromJson(json as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return [];
  }
}
