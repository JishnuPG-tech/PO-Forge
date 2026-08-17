import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/network/poforge_api_client.dart';
import 'features/poforge/views/poforge_login_page.dart';
import 'features/poforge/views/poforge_main_shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Dark System UI Chrome
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF000000),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(
    const ProviderScope(
      child: HermesApp(),
    ),
  );
}

class HermesApp extends StatelessWidget {
  const HermesApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Hermes',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF000000),
        primaryColor: const Color(0xFFFF7A1A),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFFF7A1A),
          secondary: Color(0xFFFF7A1A),
          surface: Color(0xFF0D0D0D),
          error: Color(0xFFEF4444),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF000000),
          elevation: 0,
          scrolledUnderElevation: 0,
        ),
      ),
      home: const AuthGateScreen(),
    );
  }
}

class AuthGateScreen extends StatefulWidget {
  const AuthGateScreen({super.key});

  @override
  State<AuthGateScreen> createState() => _AuthGateScreenState();
}

class _AuthGateScreenState extends State<AuthGateScreen> {
  String _statusMessage = 'Initializing Hermes...';
  bool _showRetry = false;

  @override
  void initState() {
    super.initState();
    _startInitialization();
  }

  Future<void> _startInitialization() async {
    // Small delay to ensure the UI renders the first frame
    await Future.delayed(const Duration(milliseconds: 500));
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    if (!mounted) return;
    setState(() {
      _showRetry = false;
      _statusMessage = 'Connecting to backend...';
    });

    try {
      final apiClient = PoforgeApiClient();

      setState(() => _statusMessage = 'Checking session...');
      final token = await apiClient.getToken();
      
      if (!mounted) return;

      if (token != null && token.isNotEmpty) {
        setState(() => _statusMessage = 'Waking up backend coach...');
        // Verify token is still valid against backend
        final isValid = await apiClient.validateToken();

        if (!mounted) return;

        if (isValid) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const PoforgeMainShell()),
          );
          return;
        } else {
          // Token expired or invalid, clear it
          await apiClient.clearAuth();
        }
      }

      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const PoforgeLoginPage()),
      );
    } catch (e) {
      if (mounted) {
        setState(() {
          _statusMessage = 'Backend unreachable. (Check your internet)';
          _showRetry = true;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF000000),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Safe fallback for image: if it fails, it just shows a placeholder circle
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFFF7A1A), width: 2),
                color: const Color(0xFF0D0D0D),
              ),
              child: ClipOval(
                child: Image.asset(
                  'assets/images/hermes_logo.png',
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return const Center(
                      child: Icon(Icons.psychology, color: Color(0xFFFF7A1A), size: 40),
                    );
                  },
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'HERMES',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.w900,
                letterSpacing: 4,
              ),
            ),
            const SizedBox(height: 32),
            if (!_showRetry)
              const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFFF7A1A)),
                ),
              ),
            const SizedBox(height: 20),
            Text(
              _statusMessage,
              style: const TextStyle(
                color: Color(0xFF737373),
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
            if (_showRetry) ...[
              const SizedBox(height: 24),
              TextButton(
                onPressed: _checkAuth,
                child: const Text(
                  'RETRY CONNECTION',
                  style: TextStyle(color: Color(0xFFFF7A1A), fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
