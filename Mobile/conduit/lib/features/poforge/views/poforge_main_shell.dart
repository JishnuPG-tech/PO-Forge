import 'package:flutter/material.dart';
import '../webview/poforge_webview_page.dart';
import '../../chat/views/chat_page.dart';

class PoforgeMainShell extends StatefulWidget {
  const PoforgeMainShell({super.key});

  @override
  State<PoforgeMainShell> createState() => _PoforgeMainShellState();
}

class _PoforgeMainShellState extends State<PoforgeMainShell> {
  int _currentIndex = 4; // Default to Coach tab (Hermes AI native chat)

  Widget _buildBody() {
    switch (_currentIndex) {
      case 0:
        return const PoforgeWebViewPage(
          key: ValueKey('tab_today'),
          path: '/',
          title: 'Daily Mission',
        );
      case 1:
        return const PoforgeWebViewPage(
          key: ValueKey('tab_practice'),
          path: '/practice',
          title: 'Practice Hub',
        );
      case 2:
        return const PoforgeWebViewPage(
          key: ValueKey('tab_mock'),
          path: '/mock',
          title: 'Mock Exams',
        );
      case 3:
        return const PoforgeWebViewPage(
          key: ValueKey('tab_analysis'),
          path: '/analysis',
          title: 'Performance Analysis',
        );
      case 4:
      default:
        return ChatPage(
          key: const ValueKey('tab_coach'),
          onNavigateToMock: () => setState(() => _currentIndex = 2),
          onNavigateToAnalysis: () => setState(() => _currentIndex = 3),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF000000),
      body: _buildBody(),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF0D0D0D),
          border: Border(top: BorderSide(color: Color(0xFF262626))),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          type: BottomNavigationBarType.fixed,
          backgroundColor: const Color(0xFF0D0D0D),
          selectedItemColor: const Color(0xFFFF7A1A),
          unselectedItemColor: const Color(0xFF737373),
          selectedFontSize: 11,
          unselectedFontSize: 11,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.today_outlined),
              activeIcon: Icon(Icons.today),
              label: 'Today',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.fitness_center_outlined),
              activeIcon: Icon(Icons.fitness_center),
              label: 'Practice',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.assignment_outlined),
              activeIcon: Icon(Icons.assignment),
              label: 'Mock',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.analytics_outlined),
              activeIcon: Icon(Icons.analytics),
              label: 'Analysis',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.psychology_outlined),
              activeIcon: Icon(Icons.psychology),
              label: 'Coach',
            ),
          ],
        ),
      ),
    );
  }
}
