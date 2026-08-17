import 'package:flutter/material.dart';
import '../../models/poforge_models.dart';

class ToolCallCard extends StatefulWidget {
  final HermesToolCall toolCall;

  const ToolCallCard({super.key, required this.toolCall});

  @override
  State<ToolCallCard> createState() => _ToolCallCardState();
}

class _ToolCallCardState extends State<ToolCallCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final t = widget.toolCall;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF141414),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF262626)),
      ),
      child: Column(
        children: [
          InkWell(
            onTap: () => setState(() => _expanded = !_expanded),
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Row(
                children: [
                  const Icon(Icons.build_circle_outlined, color: Color(0xFFE58038), size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Executed Tool: ${t.toolName}',
                      style: const TextStyle(
                        color: Color(0xFFEDEDED),
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ),
                  Icon(
                    _expanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                    color: const Color(0xFF737373),
                    size: 16,
                  ),
                ],
              ),
            ),
          ),
          if (_expanded) ...[
            const Divider(color: Color(0xFF262626), height: 1),
            Container(
              padding: const EdgeInsets.all(12),
              color: const Color(0xFF0F0F0F),
              width: double.infinity,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Parameters:',
                    style: TextStyle(color: Color(0xFFA3A3A3), fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    t.parameters.toString(),
                    style: const TextStyle(color: Color(0xFF737373), fontSize: 11, fontFamily: 'monospace'),
                  ),
                  if (t.result != null) ...[
                    const SizedBox(height: 8),
                    const Text(
                      'Result:',
                      style: TextStyle(color: Color(0xFFA3A3A3), fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      t.result.toString(),
                      style: const TextStyle(color: Color(0xFF4ADE80), fontSize: 11, fontFamily: 'monospace'),
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
