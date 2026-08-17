import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class PoforgeApiClient {
  static const String defaultBaseUrl = 'https://po-forge.onrender.com/api/v1';
  final String baseUrl;
  final Dio _dio;
  final FlutterSecureStorage _storage;

  static const String _tokenKey = 'poforge_jwt_token';
  static const String _userIdKey = 'poforge_user_id';

  PoforgeApiClient({
    String? baseUrl,
    Dio? dio,
    FlutterSecureStorage? storage,
  })  : baseUrl = baseUrl ?? defaultBaseUrl,
        _dio = dio ?? Dio(),
        _storage = storage ?? const FlutterSecureStorage() {
    _dio.options.baseUrl = this.baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 30);
    _dio.options.receiveTimeout = const Duration(seconds: 30);
    _dio.options.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'POForge-Mobile-Coach/1.0',
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
    try {
      return await _storage.read(key: _tokenKey);
    } catch (_) {
      return null;
    }
  }

  Future<void> saveToken(String token, String userId) async {
    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _userIdKey, value: userId);
  }

  Future<void> clearAuth() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _userIdKey);
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    final data = response.data as Map<String, dynamic>;
    if (data.containsKey('access_token')) {
      await saveToken(data['access_token'] as String, data['user_id'] as String? ?? 'STUDENT');
    }
    return data;
  }

  Future<Map<String, dynamic>> getMe() async {
    final response = await _dio.get('/auth/me');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> startDailyMission() async {
    final response = await _dio.post('/missions/start');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getPerformanceAnalytics() async {
    final response = await _dio.get('/analytics/performance');
    return response.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> searchQuestions({
    String? subjectCode,
    String? topicCode,
    int limit = 50,
  }) async {
    final Map<String, dynamic> params = {'limit': limit};
    if (subjectCode != null) params['subject_code'] = subjectCode;
    if (topicCode != null) params['topic_code'] = topicCode;

    final response = await _dio.get('/questions/search', queryParameters: params);
    return response.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> sendHermesChat({
    required String userMessage,
    String taskCategory = 'TUTORING',
  }) async {
    final response = await _dio.post('/hermes/chat', data: {
      'user_message': userMessage,
      'task_category': taskCategory,
    });
    return response.data as Map<String, dynamic>;
  }
}
