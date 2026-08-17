import 'package:flutter/material.dart';
import '../../../core/network/poforge_api_client.dart';
import 'poforge_main_shell.dart';

class PoforgeLoginPage extends StatefulWidget {
  const PoforgeLoginPage({super.key});

  @override
  State<PoforgeLoginPage> createState() => _PoforgeLoginPageState();
}

class _PoforgeLoginPageState extends State<PoforgeLoginPage> {
  final PoforgeApiClient _apiClient = PoforgeApiClient();
  bool _loading = false;
  String? _errorMessage;

  Future<void> _handleLogin() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final token = await _apiClient.login('STUDENT_DEV_001');
      if (token != null && mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const PoforgeMainShell()),
        );
      } else {
        setState(() {
          _errorMessage = 'Authentication failed. Please check network connection.';
          _loading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error connecting to POForge backend.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF000000),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Spacer(),
              // POForge Logo Mark
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: const Color(0xFF141414),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFFFF7A1A).withOpacity(0.3), width: 1.5),
                ),
                child: const Center(
                  child: Icon(Icons.bolt, color: Color(0xFFFF7A1A), size: 40),
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'POForge',
                style: TextStyle(
                  color: Color(0xFFEDEDED),
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Personal AI Banking Coach',
                style: TextStyle(
                  color: Color(0xFFA3A3A3),
                  fontSize: 14,
                ),
              ),
              const Spacer(),
              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2D1214),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.3)),
                  ),
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: Color(0xFFF87171), fontSize: 12),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _loading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF7A1A),
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    elevation: 0,
                  ),
                  child: _loading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2),
                        )
                      : const Text(
                          'LOG IN',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                        ),
                ),
              ),
              const SizedBox(height: 36),
            ],
          ),
        ),
      ),
    );
  }
}
