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
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF000000),
        primaryColor: const Color(0xFFFF7A1A),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFFF7A1A),
          secondary: Color(0xFFFF7A1A),
          surface: Color(0xFF0D0D0D),
          background: Color(0xFF000000),
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
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkAuth();
    });
  }

  Future<void> _checkAuth() async {
    try {
      final apiClient = PoforgeApiClient();
      final token = await apiClient.getToken();
      
      if (!mounted) return;

      if (token != null && token.isNotEmpty) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const PoforgeMainShell()),
        );
      } else {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const PoforgeLoginPage()),
        );
      }
    } catch (_) {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const PoforgeLoginPage()),
        );
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
            Container(
              width: 96,
              height: 96,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFFF7A1A), width: 2),
                image: const DecorationImage(
                  image: AssetImage('assets/images/hermes_logo.png'),
                  fit: BoxFit.cover,
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
            const SizedBox(height: 8),
            const Text(
              'AI Banking Coach',
              style: TextStyle(
                color: Color(0xFF737373),
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 32),
            const SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFFF7A1A)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
