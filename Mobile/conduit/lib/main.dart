import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/network/poforge_api_client.dart';
import 'features/poforge/views/poforge_login_page.dart';
import 'features/poforge/views/poforge_main_shell.dart';

void main() async {
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

  final apiClient = PoforgeApiClient();
  final token = await apiClient.getToken();
  final initialHome = (token != null && token.isNotEmpty)
      ? const PoforgeMainShell()
      : const PoforgeLoginPage();

  runApp(
    ProviderScope(
      child: PoforgeApp(initialHome: initialHome),
    ),
  );
}

class PoforgeApp extends StatelessWidget {
  final Widget initialHome;

  const PoforgeApp({super.key, required this.initialHome});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'POForge',
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
      home: initialHome,
    );
  }
}
