import 'package:flutter/material.dart';

class MockSessionCard extends StatelessWidget {
  final String title;
  final int totalQuestions;
  final int timeLimitMinutes;
  final VoidCallback? onStart;

  const MockSessionCard({
    super.key,
    required this.title,
    this.totalQuestions = 80,
    this.timeLimitMinutes = 45,
    this.onStart,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF141414),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF262626)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.assignment_outlined, color: Color(0xFFE58038), size: 18),
              SizedBox(width: 8),
              Text(
                'FULL LENGTH MOCK EXAM',
                style: TextStyle(
                  color: Color(0xFFE58038),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            title,
            style: const TextStyle(
              color: Color(0xFFEDEDED),
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '$totalQuestions Q • $timeLimitMinutes min',
                style: const TextStyle(
                  color: Color(0xFFA3A3A3),
                  fontSize: 12,
                  fontFamily: 'monospace',
                ),
              ),
              ElevatedButton(
                onPressed: onStart,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE58038),
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'START →',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
