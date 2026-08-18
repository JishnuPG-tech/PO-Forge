import 'package:flutter/material.dart';
import '../../../core/network/poforge_api_client.dart';
import 'poforge_login_page.dart';

class NativeSettingsDialog extends StatefulWidget {
  const NativeSettingsDialog({super.key});

  @override
  State<NativeSettingsDialog> createState() => _NativeSettingsDialogState();
}

class _NativeSettingsDialogState extends State<NativeSettingsDialog> {
  final PoforgeApiClient _apiClient = PoforgeApiClient();
  int _dailyTarget = 90;
  bool _dailyBriefingNotification = true;
  String _selectedEngine = 'Hermes Banking Engine v1';

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: Color(0xFF0D0D0D),
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFF262626),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'HERMES COACH SETTINGS',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Color(0xFFA3A3A3), size: 20),
                  onPressed: () => Navigator.of(context).pop(),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
            const SizedBox(height: 20),
            // Daily Target
            const Text(
              'Daily Question Target',
              style: TextStyle(color: Color(0xFFA3A3A3), fontSize: 12),
            ),
            const SizedBox(height: 8),
            Row(
              children: [30, 60, 90, 120].map((count) {
                final isSelected = _dailyTarget == count;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: InkWell(
                      onTap: () => setState(() => _dailyTarget = count),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF2E1A0E) : const Color(0xFF141414),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isSelected ? const Color(0xFFFF7A1A) : const Color(0xFF262626),
                          ),
                        ),
                        child: Text(
                          '$count Q',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: isSelected ? const Color(0xFFFF7A1A) : const Color(0xFFEDEDED),
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
            // Morning Briefing Toggle
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF141414),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF202020)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Proactive Morning Briefing',
                        style: TextStyle(color: Color(0xFFEDEDED), fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Wake-up mission prompt at 07:00 AM',
                        style: TextStyle(color: Color(0xFF737373), fontSize: 11),
                      ),
                    ],
                  ),
                  Switch(
                    value: _dailyBriefingNotification,
                    activeColor: const Color(0xFFFF7A1A),
                    onChanged: (val) => setState(() => _dailyBriefingNotification = val),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            // Theme confirmation
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF141414),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF202020)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text(
                    'Visual Theme',
                    style: TextStyle(color: Color(0xFFEDEDED), fontSize: 13),
                  ),
                  Text(
                    'Pitch Black (AMOLED)',
                    style: TextStyle(color: Color(0xFFFF7A1A), fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Logout button
            SizedBox(
              width: double.infinity,
              height: 46,
              child: OutlinedButton.icon(
                onPressed: () async {
                  await _apiClient.clearAuth();
                  if (context.mounted) {
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(builder: (_) => const PoforgeLoginPage()),
                      (route) => false,
                    );
                  }
                },
                icon: const Icon(Icons.logout, color: Color(0xFFEF4444), size: 18),
                label: const Text(
                  'LOG OUT',
                  style: TextStyle(color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFF2D1214)),
                  backgroundColor: const Color(0xFF1A0A0B),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
