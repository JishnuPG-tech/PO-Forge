import 'dart:async';
import 'package:flutter/material.dart';
import '../models/poforge_models.dart';

class MockExamResult {
  final String title;
  final int totalQuestions;
  final int attempted;
  final int correct;
  final int incorrect;
  final double score;
  final int timeSpentSeconds;

  const MockExamResult({
    required this.title,
    required this.totalQuestions,
    required this.attempted,
    required this.correct,
    required this.incorrect,
    required this.score,
    required this.timeSpentSeconds,
  });
}

class MockQuestionItem {
  final String id;
  final String section;
  final String text;
  final List<String> options;
  final int correctOptionIndex;
  int? selectedOptionIndex;
  bool isMarkedForReview;

  MockQuestionItem({
    required this.id,
    required this.section,
    required this.text,
    required this.options,
    required this.correctOptionIndex,
    this.selectedOptionIndex,
    this.isMarkedForReview = false,
  });
}

class NativeMockExamPage extends StatefulWidget {
  final String title;
  final int durationMinutes;

  const NativeMockExamPage({
    super.key,
    this.title = 'IBPS RRB PO Prelims — Mock 1',
    this.durationMinutes = 45,
  });

  @override
  State<NativeMockExamPage> createState() => _NativeMockExamPageState();
}

class _NativeMockExamPageState extends State<NativeMockExamPage> {
  late int _remainingSeconds;
  Timer? _timer;
  int _currentQuestionIndex = 0;
  String _currentSection = 'Reasoning Ability';
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  final List<String> _sections = [
    'Reasoning Ability',
    'Quantitative Aptitude',
    'English Language',
  ];

  late final List<MockQuestionItem> _questions;

  @override
  void initState() {
    super.initState();
    _remainingSeconds = widget.durationMinutes * 60;
    _questions = _generateMockQuestions();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        setState(() => _remainingSeconds--);
      } else {
        _timer?.cancel();
        _submitExam(autoSubmit: true);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatTimer(int totalSecs) {
    final mins = (totalSecs ~/ 60).toString().padLeft(2, '0');
    final secs = (totalSecs % 60).toString().padLeft(2, '0');
    return '$mins:$secs';
  }

  List<MockQuestionItem> _generateMockQuestions() {
    return [
      // Reasoning
      MockQuestionItem(
        id: 'MOCK_REAS_01',
        section: 'Reasoning Ability',
        text: 'Statements: Only a few Books are Pens. All Pens are Erasers. No Eraser is Scale.\n\nConclusions:\nI. Some Books are not Scales.\nII. All Books being Erasers is a possibility.',
        options: ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither I nor II follows'],
        correctOptionIndex: 2,
      ),
      MockQuestionItem(
        id: 'MOCK_REAS_02',
        section: 'Reasoning Ability',
        text: 'Eight people A, B, C, D, E, F, G and H are sitting around a circular table facing the centre. A sits third to the right of B. C sits second to the left of A. Who sits opposite to B?',
        options: ['D', 'E', 'F', 'G'],
        correctOptionIndex: 1,
      ),
      MockQuestionItem(
        id: 'MOCK_REAS_03',
        section: 'Reasoning Ability',
        text: 'In a code language: "banking exam is hard" is written as "la ka pa ra", "exam is very easy" is written as "ka pa ma ta". What is the code for "banking"?',
        options: ['la', 'ra', 'Either la or ra', 'ka'],
        correctOptionIndex: 2,
      ),
      // Quant
      MockQuestionItem(
        id: 'MOCK_QUAN_01',
        section: 'Quantitative Aptitude',
        text: 'A boat travels 36 km upstream in 4 hours and 48 km downstream in 3 hours. Find the speed of the current.',
        options: ['3 km/h', '3.5 km/h', '4 km/h', '4.5 km/h'],
        correctOptionIndex: 1,
      ),
      MockQuestionItem(
        id: 'MOCK_QUAN_02',
        section: 'Quantitative Aptitude',
        text: 'Find the missing number in the series: 12, 14, 30, 94, 380, ?',
        options: ['1904', '1906', '1896', '1910'],
        correctOptionIndex: 1,
      ),
      MockQuestionItem(
        id: 'MOCK_QUAN_03',
        section: 'Quantitative Aptitude',
        text: 'A vessel contains 80 litres of milk and water in ratio 7:1. How much water must be added to make the ratio 2:1?',
        options: ['15 litres', '20 litres', '25 litres', '30 litres'],
        correctOptionIndex: 2,
      ),
      // English
      MockQuestionItem(
        id: 'MOCK_ENG_01',
        section: 'English Language',
        text: 'Choose the most appropriate synonym for "METICULOUS":',
        options: ['Careless', 'Painstaking', 'Hasty', 'Superficial'],
        correctOptionIndex: 1,
      ),
      MockQuestionItem(
        id: 'MOCK_ENG_02',
        section: 'English Language',
        text: 'Identify the grammatically correct sentence:',
        options: [
          'Neither the manager nor the employees was present.',
          'Neither the manager nor the employees were present.',
          'Neither the manager or the employees was present.',
          'Neither the manager nor the employees is present.'
        ],
        correctOptionIndex: 1,
      ),
    ];
  }

  List<MockQuestionItem> get _sectionQuestions =>
      _questions.where((q) => q.section == _currentSection).toList();

  void _submitExam({bool autoSubmit = false}) {
    int attempted = 0;
    int correct = 0;
    int incorrect = 0;

    for (final q in _questions) {
      if (q.selectedOptionIndex != null) {
        attempted++;
        if (q.selectedOptionIndex == q.correctOptionIndex) {
          correct++;
        } else {
          incorrect++;
        }
      }
    }

    final score = (correct * 1.0) - (incorrect * 0.25);
    final timeSpent = (widget.durationMinutes * 60) - _remainingSeconds;

    final result = MockExamResult(
      title: widget.title,
      totalQuestions: _questions.length,
      attempted: attempted,
      correct: correct,
      incorrect: incorrect,
      score: score > 0 ? score : 0.0,
      timeSpentSeconds: timeSpent,
    );

    if (autoSubmit) {
      Navigator.of(context).pop(result);
    } else {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: const Color(0xFF141414),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          title: const Text(
            'Submit Mock Exam?',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
          content: Text(
            'You have answered $attempted of ${_questions.length} questions.\nTime remaining: ${_formatTimer(_remainingSeconds)}.\n\nAre you sure you want to finish?',
            style: const TextStyle(color: Color(0xFFA3A3A3), fontSize: 13),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Resume', style: TextStyle(color: Color(0xFF737373))),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                Navigator.of(context).pop(result);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFF7A1A),
                foregroundColor: Colors.black,
              ),
              child: const Text('Confirm Submit'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentList = _sectionQuestions;
    final currentQ = currentList.isNotEmpty && _currentQuestionIndex < currentList.length
        ? currentList[_currentQuestionIndex]
        : null;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFF000000),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D0D),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Color(0xFFA3A3A3)),
          onPressed: () => _submitExam(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.title,
              style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
            ),
            Row(
              children: [
                const Icon(Icons.timer_outlined, color: Color(0xFFFF7A1A), size: 12),
                const SizedBox(width: 4),
                Text(
                  _formatTimer(_remainingSeconds),
                  style: const TextStyle(
                    color: Color(0xFFFF7A1A),
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.grid_view_rounded, color: Color(0xFFFF7A1A)),
            onPressed: () => _scaffoldKey.currentState?.openEndDrawer(),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ElevatedButton(
              onPressed: () => _submitExam(),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF22C55E),
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                minimumSize: const Size(60, 32),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                elevation: 0,
              ),
              child: const Text('SUBMIT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(40),
          child: Container(
            color: const Color(0xFF141414),
            child: Row(
              children: _sections.map((sec) {
                final isSelected = sec == _currentSection;
                return Expanded(
                  child: InkWell(
                    onTap: () {
                      setState(() {
                        _currentSection = sec;
                        _currentQuestionIndex = 0;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        border: Border(
                          bottom: BorderSide(
                            color: isSelected ? const Color(0xFFFF7A1A) : Colors.transparent,
                            width: 2,
                          ),
                        ),
                      ),
                      child: Text(
                        sec.split(' ').first,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: isSelected ? const Color(0xFFFF7A1A) : const Color(0xFF737373),
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ),
      endDrawer: _buildQuestionPaletteDrawer(),
      body: currentQ == null
          ? const Center(child: Text('No questions in this section.', style: TextStyle(color: Colors.white)))
          : Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Question Number & Section header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Question ${_currentQuestionIndex + 1} of ${currentList.length}',
                        style: const TextStyle(
                          color: Color(0xFFA3A3A3),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Row(
                        children: [
                          const Text('+1.00 / -0.25', style: TextStyle(color: Color(0xFF737373), fontSize: 11, fontFamily: 'monospace')),
                          const SizedBox(width: 8),
                          IconButton(
                            icon: Icon(
                              currentQ.isMarkedForReview ? Icons.bookmark : Icons.bookmark_border,
                              color: currentQ.isMarkedForReview ? const Color(0xFFA855F7) : const Color(0xFF737373),
                              size: 20,
                            ),
                            onPressed: () {
                              setState(() {
                                currentQ.isMarkedForReview = !currentQ.isMarkedForReview;
                              });
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Expanded(
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            currentQ.text,
                            style: const TextStyle(
                              color: Color(0xFFEDEDED),
                              fontSize: 14,
                              height: 1.45,
                            ),
                          ),
                          const SizedBox(height: 20),
                          // Options list
                          ...List.generate(currentQ.options.length, (optIdx) {
                            final isOptSelected = currentQ.selectedOptionIndex == optIdx;
                            return InkWell(
                              onTap: () {
                                setState(() {
                                  currentQ.selectedOptionIndex = optIdx;
                                });
                              },
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 10),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: isOptSelected ? const Color(0xFF2E1A0E) : const Color(0xFF0D0D0D),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: isOptSelected ? const Color(0xFFFF7A1A) : const Color(0xFF262626),
                                    width: isOptSelected ? 1.5 : 1.0,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 22,
                                      height: 22,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: isOptSelected ? const Color(0xFFFF7A1A) : Colors.transparent,
                                        border: Border.all(
                                          color: isOptSelected ? const Color(0xFFFF7A1A) : const Color(0xFF737373),
                                        ),
                                      ),
                                      child: Center(
                                        child: Text(
                                          String.fromCharCode(65 + optIdx),
                                          style: TextStyle(
                                            color: isOptSelected ? Colors.black : const Color(0xFFEDEDED),
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        currentQ.options[optIdx],
                                        style: TextStyle(
                                          color: isOptSelected ? Colors.white : const Color(0xFFCCCCCC),
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                  ),
                  // Bottom controls: Clear, Mark for Review, Save & Next
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: const BoxDecoration(
                      border: Border(top: BorderSide(color: Color(0xFF1F1F1F))),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        TextButton(
                          onPressed: () {
                            setState(() {
                              currentQ.selectedOptionIndex = null;
                            });
                          },
                          child: const Text('Clear', style: TextStyle(color: Color(0xFF737373), fontSize: 12)),
                        ),
                        Row(
                          children: [
                            OutlinedButton(
                              onPressed: () {
                                setState(() {
                                  currentQ.isMarkedForReview = true;
                                  if (_currentQuestionIndex < currentList.length - 1) {
                                    _currentQuestionIndex++;
                                  }
                                });
                              },
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: Color(0xFFA855F7)),
                                foregroundColor: const Color(0xFFA855F7),
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                              ),
                              child: const Text('Mark & Next', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton(
                              onPressed: () {
                                setState(() {
                                  if (_currentQuestionIndex < currentList.length - 1) {
                                    _currentQuestionIndex++;
                                  }
                                });
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFFF7A1A),
                                foregroundColor: Colors.black,
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                              ),
                              child: const Text('Save & Next', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildQuestionPaletteDrawer() {
    return Drawer(
      backgroundColor: const Color(0xFF0D0D0D),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'QUESTION PALETTE',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1,
                ),
              ),
              const SizedBox(height: 12),
              // Legend
              Wrap(
                spacing: 12,
                runSpacing: 6,
                children: [
                  _buildLegendItem(const Color(0xFF22C55E), 'Answered'),
                  _buildLegendItem(const Color(0xFFA855F7), 'Marked'),
                  _buildLegendItem(const Color(0xFF333333), 'Not Answered'),
                ],
              ),
              const Divider(color: Color(0xFF262626), height: 24),
              Text(
                _currentSection,
                style: const TextStyle(color: Color(0xFFFF7A1A), fontSize: 12, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 5,
                    mainAxisSpacing: 8,
                    crossAxisSpacing: 8,
                  ),
                  itemCount: _sectionQuestions.length,
                  itemBuilder: (context, idx) {
                    final q = _sectionQuestions[idx];
                    Color bgColor = const Color(0xFF1E1E1E);
                    Color textColor = const Color(0xFFA3A3A3);

                    if (q.selectedOptionIndex != null) {
                      bgColor = const Color(0xFF22C55E);
                      textColor = Colors.black;
                    } else if (q.isMarkedForReview) {
                      bgColor = const Color(0xFFA855F7);
                      textColor = Colors.white;
                    }

                    final isCurrent = idx == _currentQuestionIndex;

                    return InkWell(
                      onTap: () {
                        setState(() {
                          _currentQuestionIndex = idx;
                        });
                        Navigator.of(context).pop();
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: bgColor,
                          borderRadius: BorderRadius.circular(6),
                          border: isCurrent ? Border.all(color: Colors.white, width: 2) : null,
                        ),
                        child: Center(
                          child: Text(
                            '${idx + 1}',
                            style: TextStyle(
                              color: textColor,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(color: Color(0xFF737373), fontSize: 10)),
      ],
    );
  }
}
