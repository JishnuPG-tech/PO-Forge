import 'package:flutter/material.dart';

class WeakSpotItem {
  final String topic;
  final String subject;
  final int accuracy;
  final String reason;

  const WeakSpotItem({
    required this.topic,
    required this.subject,
    required this.accuracy,
    required this.reason,
  });
}

class TopicMasteryItem {
  final String name;
  final double score; // 0.0 to 1.0

  const TopicMasteryItem({required this.name, required this.score});
}

class AnalysisSnapshotCard extends StatefulWidget {
  final String readiness;
  final int mastery;
  final int accuracy;
  final int speed;
  final List<WeakSpotItem> weakSpots;
  final List<TopicMasteryItem> subjectMastery;
  final void Function(WeakSpotItem item)? onFixWeakness;

  const AnalysisSnapshotCard({
    super.key,
    this.readiness = 'COMPETITIVE',
    this.mastery = 76,
    this.accuracy = 84,
    this.speed = 72,
    this.weakSpots = const [
      WeakSpotItem(
        topic: 'Data Interpretation (Missing DI)',
        subject: 'Quant',
        accuracy: 48,
        reason: 'Calculation speed under 45s threshold',
      ),
      WeakSpotItem(
        topic: 'Syllogism (Only A few / Possibility)',
        subject: 'Reasoning',
        accuracy: 55,
        reason: 'Venn-diagram intersection ambiguity',
      ),
      WeakSpotItem(
        topic: 'Reading Comprehension (Inference)',
        subject: 'English',
        accuracy: 62,
        reason: 'Negative phrasing misinterpretations',
      ),
    ],
    this.subjectMastery = const [
      TopicMasteryItem(name: 'Quantitative Aptitude', score: 0.78),
      TopicMasteryItem(name: 'Reasoning Ability', score: 0.85),
      TopicMasteryItem(name: 'English Language', score: 0.72),
      TopicMasteryItem(name: 'General / Banking Awareness', score: 0.69),
    ],
    this.onFixWeakness,
  });

  @override
  State<AnalysisSnapshotCard> createState() => _AnalysisSnapshotCardState();
}

class _AnalysisSnapshotCardState extends State<AnalysisSnapshotCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0D0D0D),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF262626)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.insights, color: Color(0xFFFF7A1A), size: 16),
                  SizedBox(width: 6),
                  Text(
                    'EXAM READINESS & MASTERY',
                    style: TextStyle(
                      color: Color(0xFFEDEDED),
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF0D2818),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF22C55E).withOpacity(0.4)),
                ),
                child: Text(
                  widget.readiness,
                  style: const TextStyle(
                    color: Color(0xFF4ADE80),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Main 3 Key Metrics
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildMetric('Mastery', '${widget.mastery}%', const Color(0xFFFF7A1A)),
              _buildMetric('Accuracy', '${widget.accuracy}%', const Color(0xFF22C55E)),
              _buildMetric('Speed', '${widget.speed}%', const Color(0xFF38BDF8)),
            ],
          ),
          const SizedBox(height: 14),
          // Expandable Weakness & Mastery Detail
          if (_expanded) ...[
            const Divider(color: Color(0xFF262626), height: 20),
            const Text(
              '🎯 Priority Weak Spots (Ranked):',
              style: TextStyle(
                color: Color(0xFFEDEDED),
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            ...widget.weakSpots.map((spot) {
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF141414),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF202020)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                spot.topic,
                                style: const TextStyle(
                                  color: Color(0xFFEDEDED),
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                '(${spot.accuracy}% acc)',
                                style: const TextStyle(
                                  color: Color(0xFFEF4444),
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${spot.subject} • ${spot.reason}',
                            style: const TextStyle(color: Color(0xFF737373), fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () => widget.onFixWeakness?.call(spot),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFF7A1A),
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        minimumSize: const Size(64, 28),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Fix This',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
            const SizedBox(height: 10),
            const Text(
              '📊 Subject Mastery Breakdown:',
              style: TextStyle(
                color: Color(0xFFEDEDED),
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            ...widget.subjectMastery.map((sub) {
              final pct = (sub.score * 100).toInt();
              return Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          sub.name,
                          style: const TextStyle(color: Color(0xFFA3A3A3), fontSize: 11),
                        ),
                        Text(
                          '$pct%',
                          style: const TextStyle(
                            color: Color(0xFFEDEDED),
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(2),
                      child: LinearProgressIndicator(
                        value: sub.score,
                        backgroundColor: const Color(0xFF1F1F1F),
                        valueColor: AlwaysStoppedAnimation<Color>(
                          sub.score > 0.75 ? const Color(0xFFFF7A1A) : const Color(0xFFEAB308),
                        ),
                        minHeight: 4,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ],
          const SizedBox(height: 8),
          // Toggle Detailed View
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => setState(() => _expanded = !_expanded),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF262626)),
                foregroundColor: const Color(0xFFFF7A1A),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                padding: const EdgeInsets.symmetric(vertical: 8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _expanded ? 'HIDE DETAILED BREAKDOWN' : 'VIEW DETAILED WEAKNESS BREAKDOWN',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    _expanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                    size: 16,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetric(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            color: color,
            fontSize: 18,
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
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
