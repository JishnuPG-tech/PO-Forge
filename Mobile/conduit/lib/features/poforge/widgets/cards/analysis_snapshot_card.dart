import 'package:flutter/material.dart';

class AnalysisSnapshotCard extends StatelessWidget {
  final String readiness;
  final int mastery;
  final int accuracy;
  final int speed;
  final VoidCallback? onFullAnalysis;

  const AnalysisSnapshotCard({
    super.key,
    this.readiness = 'COMPETITIVE',
    this.mastery = 76,
    this.accuracy = 84,
    this.speed = 72,
    this.onFullAnalysis,
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'EXAM READINESS SNAPSHOT',
                style: TextStyle(
                  color: Color(0xFFA3A3A3),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF0D2818),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: const Color(0xFF22C55E).withOpacity(0.4)),
                ),
                child: Text(
                  readiness,
                  style: const TextStyle(
                    color: Color(0xFF4ADE80),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildMetric('Mastery', '$mastery%'),
              _buildMetric('Accuracy', '$accuracy%'),
              _buildMetric('Speed', '$speed%'),
            ],
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: onFullAnalysis,
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF333333)),
                foregroundColor: const Color(0xFFE58038),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                padding: const EdgeInsets.symmetric(vertical: 10),
              ),
              child: const Text(
                'FULL ANALYSIS →',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetric(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: Color(0xFFEDEDED),
            fontSize: 16,
            fontWeight: FontWeight.bold,
            fontFamily: 'monospace',
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF737373),
            fontSize: 11,
          ),
        ),
      ],
    );
  }
}
