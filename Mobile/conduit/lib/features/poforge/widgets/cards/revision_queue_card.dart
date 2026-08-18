import 'package:flutter/material.dart';

class RevisionQueueItem {
  final String topic;
  final String subject;
  final int questionsDue;
  final String interval; // e.g. 'Day 3', 'Day 7'
  final double currentRetention; // 0.0 - 1.0

  const RevisionQueueItem({
    required this.topic,
    required this.subject,
    required this.questionsDue,
    required this.interval,
    required this.currentRetention,
  });
}

class RevisionQueueCard extends StatelessWidget {
  final List<RevisionQueueItem> items;
  final void Function(RevisionQueueItem item)? onStartDrill;

  const RevisionQueueCard({
    super.key,
    required this.items,
    this.onStartDrill,
  });

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return Container(
        margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF0D0D0D),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFF262626)),
        ),
        child: Row(
          children: const [
            Icon(Icons.check_circle, color: Color(0xFF22C55E), size: 18),
            SizedBox(width: 8),
            Text(
              'No items due for spaced revision today! 🎉',
              style: TextStyle(color: Color(0xFFEDEDED), fontSize: 12),
            ),
          ],
        ),
      );
    }

    final totalDue = items.fold<int>(0, (sum, i) => sum + i.questionsDue);

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
                  Icon(Icons.cached, color: Color(0xFFFF7A1A), size: 16),
                  SizedBox(width: 6),
                  Text(
                    'SPACED REVISION QUEUE',
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
                  color: const Color(0xFF2E1A0E),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFFF7A1A).withOpacity(0.4)),
                ),
                child: Text(
                  '$totalDue DUE TODAY',
                  style: const TextStyle(
                    color: Color(0xFFFF7A1A),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...items.map((item) {
            final retentionPct = (item.currentRetention * 100).toInt();
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
                              item.topic,
                              style: const TextStyle(
                                color: Color(0xFFEDEDED),
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                              decoration: BoxDecoration(
                                color: const Color(0xFF262626),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                item.interval,
                                style: const TextStyle(color: Color(0xFFA3A3A3), fontSize: 9),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${item.subject} • ${item.questionsDue} Questions • $retentionPct% estimated memory retention',
                          style: const TextStyle(color: Color(0xFF737373), fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () => onStartDrill?.call(item),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1F1F1F),
                      foregroundColor: const Color(0xFFFF7A1A),
                      side: const BorderSide(color: Color(0xFFFF7A1A), width: 1),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      minimumSize: const Size(50, 28),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Drill',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ],
      ),
    );
  }
}
