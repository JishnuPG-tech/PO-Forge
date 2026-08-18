import 'package:flutter/material.dart';
import '../../models/poforge_models.dart';

class MistakeReviewItem {
  final String questionId;
  final String subject;
  final String topic;
  final String questionText;
  final String userAnswer;
  final String correctAnswer;
  final String errorType; // 'CONCEPTUAL', 'CALCULATION', 'TIME_PRESSURE'
  final String explanation;

  const MistakeReviewItem({
    required this.questionId,
    required this.subject,
    required this.topic,
    required this.questionText,
    required this.userAnswer,
    required this.correctAnswer,
    required this.errorType,
    required this.explanation,
  });
}

class MistakeReviewCard extends StatefulWidget {
  final List<MistakeReviewItem> mistakes;
  final void Function(MistakeReviewItem item)? onRetry;

  const MistakeReviewCard({
    super.key,
    required this.mistakes,
    this.onRetry,
  });

  @override
  State<MistakeReviewCard> createState() => _MistakeReviewCardState();
}

class _MistakeReviewCardState extends State<MistakeReviewCard> {
  int _selectedIndex = 0;
  bool _showExplanation = false;

  Color _getErrorTypeColor(String type) {
    switch (type.toUpperCase()) {
      case 'CONCEPTUAL':
        return const Color(0xFFEF4444);
      case 'CALCULATION':
        return const Color(0xFFF59E0B);
      case 'TIME_PRESSURE':
        return const Color(0xFF8B5CF6);
      default:
        return const Color(0xFFFF7A1A);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.mistakes.isEmpty) {
      return const SizedBox.shrink();
    }

    final item = widget.mistakes[_selectedIndex];
    final errorColor = _getErrorTypeColor(item.errorType);

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
          // Header: Mistake count & tag
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.history_toggle_off, color: Color(0xFFEF4444), size: 16),
                  const SizedBox(width: 6),
                  Text(
                    'MISTAKE BOOK (${_selectedIndex + 1}/${widget.mistakes.length})',
                    style: const TextStyle(
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
                  color: errorColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: errorColor.withOpacity(0.4)),
                ),
                child: Text(
                  item.errorType,
                  style: TextStyle(
                    color: errorColor,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Subject & Topic Badge
          Text(
            '${item.subject} • ${item.topic}',
            style: const TextStyle(
              color: Color(0xFFFF7A1A),
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          // Question text
          Text(
            item.questionText,
            style: const TextStyle(
              color: Color(0xFFEDEDED),
              fontSize: 13,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          // Comparison: User vs Correct
          Container(
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
                      const Text(
                        'Your Answer',
                        style: TextStyle(color: Color(0xFF737373), fontSize: 10),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item.userAnswer,
                        style: const TextStyle(
                          color: Color(0xFFEF4444),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(width: 1, height: 28, color: const Color(0xFF262626)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Correct Answer',
                        style: TextStyle(color: Color(0xFF737373), fontSize: 10),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item.correctAnswer,
                        style: const TextStyle(
                          color: Color(0xFF22C55E),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if (_showExplanation) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF1A140F),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFFF7A1A).withOpacity(0.3)),
              ),
              child: Text(
                '💡 Concept: ${item.explanation}',
                style: const TextStyle(
                  color: Color(0xFFEDEDED),
                  fontSize: 12,
                  height: 1.3,
                ),
              ),
            ),
          ],
          const SizedBox(height: 12),
          // Actions: Explanation toggle, Retry button, Prev/Next
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton(
                onPressed: () => setState(() => _showExplanation = !_showExplanation),
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: const Size(50, 30),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  _showExplanation ? 'Hide Concept' : 'Show Concept',
                  style: const TextStyle(color: Color(0xFFFF7A1A), fontSize: 11),
                ),
              ),
              Row(
                children: [
                  if (widget.mistakes.length > 1) ...[
                    IconButton(
                      icon: const Icon(Icons.chevron_left, color: Color(0xFFA3A3A3), size: 20),
                      onPressed: _selectedIndex > 0
                          ? () => setState(() {
                                _selectedIndex--;
                                _showExplanation = false;
                              })
                          : null,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.chevron_right, color: Color(0xFFA3A3A3), size: 20),
                      onPressed: _selectedIndex < widget.mistakes.length - 1
                          ? () => setState(() {
                                _selectedIndex++;
                                _showExplanation = false;
                              })
                          : null,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                    const SizedBox(width: 8),
                  ],
                  ElevatedButton(
                    onPressed: () => widget.onRetry?.call(item),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFF7A1A),
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      minimumSize: const Size(60, 30),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Retry',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
