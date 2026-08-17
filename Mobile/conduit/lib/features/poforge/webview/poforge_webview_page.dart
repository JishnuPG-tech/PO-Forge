import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../../core/network/poforge_api_client.dart';

class PoforgeWebViewPage extends StatefulWidget {
  final String path;
  final String title;

  const PoforgeWebViewPage({
    super.key,
    required this.path,
    required this.title,
  });

  @override
  State<PoforgeWebViewPage> createState() => _PoforgeWebViewPageState();
}

class _PoforgeWebViewPageState extends State<PoforgeWebViewPage> {
  late final WebViewController _controller;
  double _progress = 0;
  bool _loading = true;
  final PoforgeApiClient _apiClient = PoforgeApiClient();

  String get _targetUrl {
    final cleanPath = widget.path.startsWith('/') ? widget.path : '/${widget.path}';
    return 'https://po-forge.vercel.app$cleanPath';
  }

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            if (mounted) {
              setState(() {
                _progress = progress / 100;
              });
            }
          },
          onPageStarted: (String url) {
            if (mounted) {
              setState(() => _loading = true);
            }
          },
          onPageFinished: (String url) async {
            if (mounted) {
              setState(() => _loading = false);
            }
            await _injectAuthScript();
          },
          onWebResourceError: (WebResourceError error) {
            if (mounted) {
              setState(() => _loading = false);
            }
          },
        ),
      )
      ..loadRequest(Uri.parse(_targetUrl));
  }

  Future<void> _injectAuthScript() async {
    try {
      final token = await _apiClient.getToken();
      if (token != null && token.isNotEmpty) {
        final script = '''
          try {
            localStorage.setItem('poforge_jwt_token', ${jsonEncode(token)});
            localStorage.setItem('poforge_user_id', 'STUDENT_DEV_001');
          } catch (e) {}
        ''';
        await _controller.runJavaScript(script);
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF000000),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D0D),
        elevation: 0,
        title: Text(
          widget.title,
          style: const TextStyle(
            color: Color(0xFFEDEDED),
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFFA3A3A3)),
            onPressed: () => _controller.reload(),
          ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_loading && _progress < 1.0)
            LinearProgressIndicator(
              value: _progress,
              backgroundColor: Colors.transparent,
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFFF7A1A)),
              minHeight: 2,
            ),
        ],
      ),
    );
  }
}
