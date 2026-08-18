import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../../../core/network/poforge_api_client.dart';
import '../../poforge/models/poforge_models.dart';
import '../../poforge/widgets/cards/practice_question_card.dart';
import '../../poforge/widgets/cards/tool_call_card.dart';
import '../../poforge/widgets/cards/mock_session_card.dart';
import '../../poforge/widgets/cards/analysis_snapshot_card.dart';
import '../../poforge/widgets/cards/mistake_review_card.dart';
import '../../poforge/widgets/cards/revision_queue_card.dart';
import '../../poforge/views/native_mock_exam_page.dart';
import '../../poforge/views/native_settings_dialog.dart';

class ChatMessage {
  final String sender; // 'user' or 'assistant'
  final String text;
  final PoforgeQuestion? question;
  final HermesToolCall? toolCall;
  final bool isMockPrompt;
  final MockExamResult? mockResult;
  final bool isAnalysisSnapshot;
  final List<MistakeReviewItem>? mistakes;
  final List<RevisionQueueItem>? revisionQueue;

  ChatMessage({
    required this.sender,
    required this.text,
    this.question,
    this.toolCall,
    this.isMockPrompt = false,
    this.mockResult,
    this.isAnalysisSnapshot = false,
    this.mistakes,
    this.revisionQueue,
  });
}

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final PoforgeApiClient _apiClient = PoforgeApiClient();
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  bool _isSending = false;

  late final List<ChatMessage> _messages;

  @override
  void initState() {
    super.initState();
    _messages = [
      ChatMessage(
        sender: 'assistant',
        text: "Good morning, Jishnu — **12-day streak 🔥**.\n\nToday's target: **90 questions** across Quant, Reasoning, English, and Current Affairs.\n\nReady to start your first drill, or want to adjust today's plan first?",
      ),
    ];
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _sendMessage([String? overrideText]) async {
    final text = overrideText ?? _textController.text.trim();
    if (text.isEmpty || _isSending) return;

    if (overrideText == null) {
      _textController.clear();
    }

    setState(() {
      _messages.add(ChatMessage(sender: 'user', text: text));
      _isSending = true;
    });
    _scrollToBottom();

    // Natural Language Agent Dispatch
    final lower = text.toLowerCase();
    await Future.delayed(const Duration(milliseconds: 300));

    if (lower.contains('practice') || lower.contains('question') || lower.contains('drill') || lower.contains('ratio') || lower.contains('quant')) {
      final questions = await _apiClient.searchQuestions(limit: 1);
      final q = questions.isNotEmpty
          ? questions.first
          : const PoforgeQuestion(
              questionId: 'QA_PL_042',
              subjectCode: 'QUANT',
              topicCode: 'PROFIT_LOSS',
              text: 'A shopkeeper marks an article 40% above cost price and allows a discount of 15%. Find his profit percentage.',
              options: ['15%', '18%', '19%', '21%', 'None of these'],
              correctOptionIndex: 2,
              shortcut: 'Net Change Formula: +40 - 15 - (40*15)/100 = 25 - 6 = +19%',
              explanation: 'Let CP = 100. MP = 140. SP = 140 * 0.85 = 119. Profit = 119 - 100 = 19%.',
            );

      setState(() {
        _messages.add(
          ChatMessage(
            sender: 'assistant',
            text: 'Here is a targeted drill question aligned with your active syllabus:',
            question: q,
          ),
        );
        _isSending = false;
      });
    } else if (lower.contains('mock') || lower.contains('exam') || lower.contains('test')) {
      setState(() {
        _messages.add(
          ChatMessage(
            sender: 'assistant',
            text: 'I have set up your full-length timed simulation. Tap below to enter the exam:',
            isMockPrompt: true,
          ),
        );
        _isSending = false;
      });
    } else if (lower.contains('analysis') || lower.contains('readiness') || lower.contains('weak') || lower.contains('how am i doing')) {
      setState(() {
        _messages.add(
          ChatMessage(
            sender: 'assistant',
            text: 'Here is your real-time Exam Readiness and Mastery breakdown:',
            isAnalysisSnapshot: true,
          ),
        );
        _isSending = false;
      });
    } else if (lower.contains('mistake') || lower.contains('wrong') || lower.contains('error')) {
      setState(() {
        _messages.add(
          ChatMessage(
            sender: 'assistant',
            text: 'Here are the questions flagged in your Mistake Book with error classification:',
            mistakes: const [
              MistakeReviewItem(
                questionId: 'REAS_SYLL_08',
                subject: 'Reasoning',
                topic: 'Syllogism',
                questionText: 'Statements: Only a few Cats are Dogs. All Dogs are Birds.\nConclusions:\nI. Some Cats are not Birds.\nII. All Cats being Birds is a possibility.',
                userAnswer: 'Both I and II follow',
                correctAnswer: 'Only II follows',
                errorType: 'CONCEPTUAL',
                explanation: '"Only a few A are B" means Some A are B and Some A are not B. All A being B is NOT a possibility, but All A being C can still be possible.',
              ),
              MistakeReviewItem(
                questionId: 'QA_DI_019',
                subject: 'Quant',
                topic: 'Data Interpretation',
                questionText: 'Find the average production of Company B across 2021-2024 given values: 420, 560, 610, 750.',
                userAnswer: '575',
                correctAnswer: '585',
                errorType: 'CALCULATION',
                explanation: 'Sum = 420 + 560 + 610 + 750 = 2340. Average = 2340 / 4 = 585.',
              ),
            ],
          ),
        );
        _isSending = false;
      });
    } else if (lower.contains('revision') || lower.contains('due') || lower.contains('spaced')) {
      setState(() {
        _messages.add(
          ChatMessage(
            sender: 'assistant',
            text: 'Here is your active Spaced Repetition queue for today:',
            revisionQueue: const [
              RevisionQueueItem(
                topic: 'Quadratic Equations (Root Signs)',
                subject: 'Quant',
                questionsDue: 10,
                interval: 'Day 3',
                currentRetention: 0.82,
              ),
              RevisionQueueItem(
                topic: 'Coding-Decoding (Chinese/Substitutional)',
                subject: 'Reasoning',
                questionsDue: 8,
                interval: 'Day 7',
                currentRetention: 0.68,
              ),
              RevisionQueueItem(
                topic: 'Error Spotting (Subject-Verb Agreement)',
                subject: 'English',
                questionsDue: 12,
                interval: 'Day 1',
                currentRetention: 0.91,
              ),
            ],
          ),
        );
        _isSending = false;
      });
    } else if (lower.contains('target') || lower.contains('config') || lower.contains('change plan')) {
      setState(() {
        _messages.add(
          ChatMessage(
            sender: 'assistant',
            text: 'I can update your daily training parameters. Please confirm:',
            toolCall: HermesToolCall(
              toolName: 'update_mission_config',
              parameters: {
                'daily_target': 120,
                'priority_subject': 'Quantitative Aptitude',
                'target_exam': 'IBPS RRB PO 2026',
              },
            ),
          ),
        );
        _isSending = false;
      });
    } else if (lower.contains('upload') || lower.contains('library') || lower.contains('document')) {
      setState(() {
        _messages.add(
          ChatMessage(
            sender: 'assistant',
            text: "📚 **Your Knowledge Base & Uploaded Material:**\n\n• *RS Aggarwal Quantitative Aptitude (2024)* — 2,410 questions indexed\n• *Puzzles & Seating Arrangement Masterclass* — 840 scenarios indexed\n• *Daily Hindu Editorial & Vocab Capsules* — Up to date (Aug 18, 2026)\n\nAsk me anytime to generate questions directly from any of these documents.",
          ),
        );
        _isSending = false;
      });
    } else {
      final reply = await _apiClient.chatWithHermes(text);
      setState(() {
        _messages.add(ChatMessage(sender: 'assistant', text: reply));
        _isSending = false;
      });
    }

    _scrollToBottom();
  }

  void _openNativeMockExam() async {
    final result = await Navigator.of(context).push<MockExamResult>(
      MaterialPageRoute(
        builder: (_) => const NativeMockExamPage(
          title: 'IBPS RRB PO Prelims — Mock 1',
          durationMinutes: 45,
        ),
      ),
    );

    if (result != null) {
      final accuracy = result.attempted > 0 ? ((result.correct / result.attempted) * 100).toInt() : 0;
      final speedMins = (result.timeSpentSeconds / 60).toStringAsFixed(1);

      setState(() {
        _messages.add(
          ChatMessage(
            sender: 'assistant',
            text: "🏁 **Mock Exam Completed — ${result.title}**\n\n"
                "• **Score**: **${result.score.toStringAsFixed(2)}** / ${result.totalQuestions}\n"
                "• **Accuracy**: **$accuracy%** (${result.correct} Correct, ${result.incorrect} Wrong)\n"
                "• **Attempted**: ${result.attempted} / ${result.totalQuestions}\n"
                "• **Time Taken**: $speedMins mins\n\n"
                "Would you like to review your mistakes from this mock, or start a targeted weakness drill on the questions you missed?",
          ),
        );
      });
      _scrollToBottom();
    }
  }

  void _openSettingsDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const NativeSettingsDialog(),
    );
  }

  Widget _buildHistoryDrawer() {
    return Drawer(
      backgroundColor: const Color(0xFF0D0D0D),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFFFF7A1A), width: 1.5),
                      image: const DecorationImage(
                        image: AssetImage('assets/images/hermes_logo.png'),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Hermes Coach',
                        style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'POForge AI Banking Assistant',
                        style: TextStyle(color: Color(0xFF737373), fontSize: 11),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Divider(color: Color(0xFF202020), height: 1),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: const Text(
                'QUICK ACTIONS',
                style: TextStyle(color: Color(0xFF737373), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
              ),
            ),
            _buildDrawerAction(Icons.bolt, 'Start Daily Practice Drill', 'Give me 10 Quant questions'),
            _buildDrawerAction(Icons.assignment, 'Start Mock Exam', 'Start a full mock exam'),
            _buildDrawerAction(Icons.insights, 'View Exam Readiness', 'Show my readiness and weak spots'),
            _buildDrawerAction(Icons.history_toggle_off, 'Review Mistake Book', 'Show my mistake book'),
            _buildDrawerAction(Icons.cached, 'Spaced Revision Queue', 'Show revision queue for today'),
            _buildDrawerAction(Icons.folder_outlined, 'Uploaded Documents', 'What documents have I uploaded?'),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'POForge Hermes v1.0.0 (Pure Agentic)',
                style: TextStyle(color: const Color(0xFF404040), fontSize: 10),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerAction(IconData icon, String title, String prompt) {
    return ListTile(
      leading: Icon(icon, color: const Color(0xFFFF7A1A), size: 18),
      title: Text(
        title,
        style: const TextStyle(color: Color(0xFFEDEDED), fontSize: 12),
      ),
      dense: true,
      onTap: () {
        Navigator.of(context).pop();
        _sendMessage(prompt);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFF000000),
      appBar: AppBar(
        backgroundColor: const Color(0xFF000000),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: Color(0xFFA3A3A3)),
          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
        ),
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFFF7A1A), width: 1.5),
                image: const DecorationImage(
                  image: AssetImage('assets/images/hermes_logo.png'),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(width: 10),
            const Text(
              'POForge',
              style: TextStyle(
                color: Color(0xFFEDEDED),
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        actions: [
          // Streak badge
          Container(
            margin: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: const Color(0xFF2E1A0E),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFFF7A1A).withOpacity(0.4)),
            ),
            child: Row(
              children: const [
                Text('🔥', style: TextStyle(fontSize: 12)),
                SizedBox(width: 4),
                Text(
                  '12',
                  style: TextStyle(
                    color: Color(0xFFFF7A1A),
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: Color(0xFFA3A3A3)),
            onPressed: _openSettingsDialog,
          ),
        ],
      ),
      drawer: _buildHistoryDrawer(),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg.sender == 'user';

                return Column(
                  crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                      padding: const EdgeInsets.all(12),
                      constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.84),
                      decoration: BoxDecoration(
                        color: isUser ? const Color(0xFF1E1E1E) : const Color(0xFF0D0D0D),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isUser ? const Color(0xFF333333) : const Color(0xFF1F1F1F),
                        ),
                      ),
                      child: MarkdownBody(
                        data: msg.text,
                        styleSheet: MarkdownStyleSheet(
                          p: const TextStyle(color: Color(0xFFEDEDED), fontSize: 13, height: 1.4),
                          strong: const TextStyle(color: Color(0xFFFF7A1A), fontWeight: FontWeight.bold),
                          code: const TextStyle(
                            color: Color(0xFF4ADE80),
                            backgroundColor: Color(0xFF161616),
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                    ),
                    if (msg.question != null) PracticeQuestionCard(question: msg.question!),
                    if (msg.toolCall != null)
                      ToolCallCard(
                        toolCall: msg.toolCall!,
                        onApprove: () {
                          setState(() {
                            _messages.add(
                              ChatMessage(
                                sender: 'assistant',
                                text: '✅ **Confirmed**: Daily target updated to 120 questions with priority on Quantitative Aptitude.',
                              ),
                            );
                          });
                          _scrollToBottom();
                        },
                      ),
                    if (msg.isMockPrompt)
                      MockSessionCard(
                        title: 'IBPS RRB PO Prelims — Mock 1',
                        totalQuestions: 80,
                        timeLimitMinutes: 45,
                        onStart: _openNativeMockExam,
                      ),
                    if (msg.isAnalysisSnapshot)
                      AnalysisSnapshotCard(
                        onFixWeakness: (spot) {
                          _sendMessage('Give me 5 practice questions to fix my weakness in ${spot.topic}');
                        },
                      ),
                    if (msg.mistakes != null)
                      MistakeReviewCard(
                        mistakes: msg.mistakes!,
                        onRetry: (item) {
                          _sendMessage('Give me a practice drill for ${item.topic}');
                        },
                      ),
                    if (msg.revisionQueue != null)
                      RevisionQueueCard(
                        items: msg.revisionQueue!,
                        onStartDrill: (item) {
                          _sendMessage('Start spaced revision drill for ${item.topic}');
                        },
                      ),
                  ],
                );
              },
            ),
          ),
          // Bottom Message Input Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: const BoxDecoration(
              color: Color(0xFF0D0D0D),
              border: Border(top: BorderSide(color: Color(0xFF202020))),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.mic, color: Color(0xFFFF7A1A)),
                    onPressed: () {
                      _sendMessage('Give me today\'s current affairs capsule');
                    },
                  ),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF141414),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFF262626)),
                      ),
                      child: TextField(
                        controller: _textController,
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        decoration: const InputDecoration(
                          hintText: 'Message Hermes (e.g. give me 5 DI questions)...',
                          hintStyle: TextStyle(color: Color(0xFF737373), fontSize: 12),
                          border: InputBorder.none,
                        ),
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: const BoxDecoration(
                      color: Color(0xFFFF7A1A),
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.arrow_upward, color: Colors.black, size: 18),
                      onPressed: _sendMessage,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
