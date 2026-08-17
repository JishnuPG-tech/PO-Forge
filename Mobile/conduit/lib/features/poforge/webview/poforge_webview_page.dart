import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
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
  InAppWebViewController? _webViewController;
  double _progress = 0;
  bool _loading = true;
  final PoforgeApiClient _apiClient = PoforgeApiClient();

  String get _targetUrl {
    final cleanPath = widget.path.startsWith('/') ? widget.path : '/${widget.path}';
    return 'https://po-forge.vercel.app$cleanPath';
  }

  Future<void> _injectAuthScript(InAppWebViewController controller) async {
    final token = await _apiClient.getToken();
    if (token != null && token.isNotEmpty) {
      final script = '''
        try {
          localStorage.setItem('poforge_jwt_token', ${jsonEncode(token)});
          localStorage.setItem('poforge_user_id', 'STUDENT_DEV_001');
          console.log('[POForge Mobile] JWT injected successfully into WebView localStorage');
        } catch (e) {
          console.error('[POForge Mobile] Error injecting JWT:', e);
        }
      ''';
      await controller.evaluateJavascript(source: script);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0C0C0C),
      appBar: AppBar(
        backgroundColor: const Color(0xFF141414),
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
            onPressed: () => _webViewController?.reload(),
          ),
        ],
      ),
      body: Stack(
        children: [
          InAppWebView(
            initialUrlRequest: URLRequest(url: WebUri(_targetUrl)),
            initialSettings: InAppWebViewSettings(
              isInspectable: true,
              transparentBackground: true,
              supportZoom: false,
              javaScriptEnabled: true,
              domStorageEnabled: true,
              cacheEnabled: true,
            ),
            onWebViewCreated: (controller) {
              _webViewController = controller;
            },
            onLoadStart: (controller, url) async {
              setState(() => _loading = true);
              await _injectAuthScript(controller);
            },
            onLoadStop: (controller, url) async {
              setState(() => _loading = false);
              await _injectAuthScript(controller);
            },
            onProgressChanged: (controller, progress) {
              setState(() {
                _progress = progress / 100;
              });
            },
          ),
          if (_loading && _progress < 1.0)
            LinearProgressIndicator(
              value: _progress,
              backgroundColor: Colors.transparent,
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFE58038)),
              minHeight: 2,
            ),
        ],
      ),
    );
  }
}
