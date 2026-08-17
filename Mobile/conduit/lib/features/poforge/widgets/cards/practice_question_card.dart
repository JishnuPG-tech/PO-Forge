import 'package:flutter/material.dart';
import '../../models/poforge_models.dart';

class PracticeQuestionCard extends StatefulWidget {
  final PoforgeQuestion question;
  final Function(int selectedIndex, bool isCorrect)? onAnswerSelected;

  const PracticeQuestionCard({
    super.key,
    required this.question,
    this.onAnswerSelected,
  });

  @override
  State<PracticeQuestionCard> createState() => _PracticeQuestionCardState();
}

class _PracticeQuestionCardState extends State<PracticeQuestionCard> {
  int? _selectedIndex;
  bool _submitted = false;

  void _selectOption(int index) {
    if (_submitted) return;
    setState(() {
      _selectedIndex = index;
      _submitted = true;
    });
    final isCorrect = (index == widget.question.correctOptionIndex);
    widget.onAnswerSelected?.call(index, isCorrect);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final q = widget.question;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF161616),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF262626)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF2E1A0E),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFE58038).withOpacity(0.3)),
                ),
                child: Text(
                  '${q.subjectCode} • ${q.topicCode}',
                  style: const TextStyle(
                    color: Color(0xFFE58038),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Text(
                q.questionId,
                style: const TextStyle(
                  color: Color(0xFF737373),
                  fontSize: 10,
                  fontFamily: 'monospace',
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Question Stem
          Text(
            q.text,
            style: const TextStyle(
              color: Color(0xFFEDEDED),
              fontSize: 14,
              fontWeight: FontWeight.w500,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),

          // Options List
          ...List.generate(q.options.length, (idx) {
            final opt = q.options[idx];
            final isSelected = _selectedIndex == idx;
            final isCorrectOption = idx == q.correctOptionIndex;

            Color borderColor = const Color(0xFF262626);
            Color bgColor = const Color(0xFF1E1E1E);
            Color textColor = const Color(0xFFEDEDED);

            if (_submitted) {
              if (isCorrectOption) {
                borderColor = const Color(0xFF22C55E);
                bgColor = const Color(0xFF0D2818);
                textColor = const Color(0xFF4ADE80);
              } else if (isSelected && !isCorrectOption) {
                borderColor = const Color(0xFFEF4444);
                bgColor = const Color(0xFF2D1214);
                textColor = const Color(0xFFF87171);
              }
            } else if (isSelected) {
              borderColor = const Color(0xFFE58038);
              bgColor = const Color(0xFF2E1A0E);
            }

            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: InkWell(
                onTap: () => _selectOption(idx),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: bgColor,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: borderColor),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 24,
                        height: 24,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isSelected ? const Color(0xFFE58038) : const Color(0xFF262626),
                        ),
                        child: Text(
                          String.fromCharCode(65 + idx),
                          style: TextStyle(
                            color: isSelected ? Colors.black : const Color(0xFFA3A3A3),
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          opt,
                          style: TextStyle(
                            color: textColor,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }),

          // Solution / Explanation Reveal
          if (_submitted && (q.explanation != null || q.shortcut != null)) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A1A),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFF333333)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (q.shortcut != null) ...[
                    Row(
                      children: const [
                        Icon(Icons.bolt, color: Color(0xFFE58038), size: 16),
                        SizedBox(width: 4),
                        Text(
                          'Exam Shortcut (Speed Trick)',
                          style: TextStyle(
                            color: Color(0xFFE58038),
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      q.shortcut!,
                      style: const TextStyle(color: Color(0xFFD4D4D4), fontSize: 12),
                    ),
                    const SizedBox(height: 8),
                  ],
                  if (q.explanation != null) ...[
                    const Text(
                      'Detailed Derivation:',
                      style: TextStyle(
                        color: Color(0xFFA3A3A3),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      q.explanation!,
                      style: const TextStyle(color: Color(0xFF737373), fontSize: 12),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
