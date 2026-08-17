import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../../../core/network/poforge_api_client.dart';
import '../../poforge/models/poforge_models.dart';
import '../../poforge/widgets/cards/practice_question_card.dart';
import '../../poforge/widgets/cards/tool_call_card.dart';
import '../../poforge/widgets/cards/mock_session_card.dart';
import '../../poforge/widgets/cards/analysis_snapshot_card.dart';

class ChatMessage {
  final String sender; // 'user' or 'assistant'
  final String text;
  final PoforgeQuestion? question;
  final HermesToolCall? toolCall;
  final bool isMockPrompt;
  final bool isAnalysisSnapshot;

  ChatMessage({
    required this.sender,
    required this.text,
    this.question,
    this.toolCall,
    this.isMockPrompt = false,
    this.isAnalysisSnapshot = false,
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

  bool _isListening = false;
  bool _isSending = false;

  final List<ChatMessage> _messages = [
    ChatMessage(
      sender: 'assistant',
      text: 'Welcome back. I am Hermes, your AI Banking Exam Coach. I have analyzed your recent Quant and Reasoning sessions. Ready to train?',
    ),
  ];

  void _sendMessage() async {
    final text = _textController.text.trim();
    if (text.isEmpty || _isSending) return;

    setState(() {
      _messages.add(ChatMessage(sender: 'user', text: text));
      _textController.clear();
      _isSending = true;
    });
    _scrollToBottom();

    // Contextual Coach Simulation / API call
    try {
      if (text.toLowerCase().contains('practice') || text.toLowerCase().contains('question')) {
        // Fetch actual question from POForge backend
        final questions = await _apiClient.searchQuestions(limit: 1);
        if (questions.isNotEmpty) {
          setState(() {
            _messages.add(
              ChatMessage(
                sender: 'assistant',
                text: 'Here is a targeted question from your active syllabus:',
                question: questions.first,
              ),
            );
          });
        } else {
          setState(() {
            _messages.add(
              ChatMessage(
                sender: 'assistant',
                text: 'Here is a recommended Profit & Loss practice question:',
                question: PoforgeQuestion(
                  questionId: 'QA_PL_042',
                  subjectCode: 'QUANT',
                  topicCode: 'PROFIT_LOSS',
                  text: 'A shopkeeper marks an article 40% above cost price and allows a discount of 15%. Find his profit percentage.',
                  options: ['15%', '18%', '19%', '21%', 'None of these'],
                  correctOptionIndex: 2,
                  shortcut: 'Net Change Formula: +40 - 15 - (40*15)/100 = 25 - 6 = +19%',
                  explanation: 'Let CP = 100. MP = 140. SP = 140 * 0.85 = 119. Profit = 119 - 100 = 19%.',
                ),
              ),
            );
          });
        }
      } else if (text.toLowerCase().contains('mock')) {
        setState(() {
          _messages.add(
            ChatMessage(
              sender: 'assistant',
              text: 'I have configured your full-length mock simulation:',
              isMockPrompt: true,
            ),
          );
        });
      } else if (text.toLowerCase().contains('analysis') || text.toLowerCase().contains('readiness')) {
        setState(() {
          _messages.add(
            ChatMessage(
              sender: 'assistant',
              text: 'Here is your current exam readiness overview:',
              isAnalysisSnapshot: true,
            ),
          );
        });
      } else {
        // Standard conversational Hermes response
        await Future.delayed(const Duration(milliseconds: 600));
        setState(() {
          _messages.add(
            ChatMessage(
              sender: 'assistant',
              text: 'Understood. Let us maintain high accuracy and pacing. Would you like a targeted **Practice Question**, a **Full Mock**, or an **Analysis Snapshot**?',
            ),
          );
        });
      }
    } catch (e) {
      setState(() {
        _messages.add(
          ChatMessage(
            sender: 'assistant',
            text: 'I am ready. Ask for a practice question, start a mock, or request an analysis breakdown.',
          ),
        );
      });
    } finally {
      setState(() => _isSending = false);
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _showSettingsDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF141414),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Color(0xFF262626)),
        ),
        title: const Text(
          'SETTINGS',
          style: TextStyle(
            color: Color(0xFFEDEDED),
            fontSize: 14,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('TARGET EXAM', style: TextStyle(color: Color(0xFF737373), fontSize: 11, fontWeight: FontWeight.bold)),
            SizedBox(height: 4),
            Text('IBPS RRB PO 2026 (Scale I)', style: TextStyle(color: Color(0xFFEDEDED), fontSize: 13)),
            SizedBox(height: 14),
            Text('DAILY TARGET', style: TextStyle(color: Color(0xFF737373), fontSize: 11, fontWeight: FontWeight.bold)),
            SizedBox(height: 4),
            Text('40 Questions / Day', style: TextStyle(color: Color(0xFFEDEDED), fontSize: 13)),
            SizedBox(height: 14),
            Text('THEME', style: TextStyle(color: Color(0xFF737373), fontSize: 11, fontWeight: FontWeight.bold)),
            SizedBox(height: 4),
            Text('POForge Pitch Black (#000000)', style: TextStyle(color: Color(0xFFFF7A1A), fontSize: 13)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CLOSE', style: TextStyle(color: Color(0xFFFF7A1A), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFF000000),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D0D),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: Color(0xFFEDEDED)),
          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
        ),
        title: Row(
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0xFFFF7A1A),
              ),
            ),
            const SizedBox(width: 8),
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
          Container(
            margin: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
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
            icon: const Icon(Icons.more_vert, color: Color(0xFFA3A3A3)),
            onPressed: _showSettingsDialog,
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
                      constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.82),
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
                    if (msg.toolCall != null) ToolCallCard(toolCall: msg.toolCall!),
                    if (msg.isMockPrompt)
                      MockSessionCard(
                        title: 'IBPS RRB PO Prelims — Mock 1',
                        totalQuestions: 80,
                        timeLimitMinutes: 45,
                        onStart: () {
                          // Hand-off to Mock WebView
                        },
                      ),
                    if (msg.isAnalysisSnapshot)
                      AnalysisSnapshotCard(
                        readiness: 'COMPETITIVE',
                        mastery: 76,
                        accuracy: 84,
                        speed: 72,
                      ),
                  ],
                );
              },
            ),
          ),
          if (_isSending)
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFFF7A1A)),
                ),
              ),
            ),
          _buildComposer(),
        ],
      ),
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
              padding: const EdgeInsets.all(16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Hermes',
                    style: TextStyle(color: Color(0xFFEDEDED), fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Color(0xFFA3A3A3)),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            const Divider(color: Color(0xFF262626), height: 1),
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: InkWell(
                onTap: () {
                  setState(() {
                    _messages.clear();
                    _messages.add(ChatMessage(
                      sender: 'assistant',
                      text: 'New session started. How can I assist your bank exam prep today?',
                    ));
                  });
                  Navigator.pop(context);
                },
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1A1A1A),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF333333)),
                  ),
                  child: Row(
                    children: const [
                      Icon(Icons.add, color: Color(0xFFFF7A1A), size: 18),
                      SizedBox(width: 8),
                      Text('+ New chat', style: TextStyle(color: Color(0xFFEDEDED), fontSize: 13, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text('RECENT', style: TextStyle(color: Color(0xFF737373), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                children: [
                  _buildHistoryTile('Analyzing IBPS RRB PO Quant...'),
                  _buildHistoryTile('Profit & Loss Discount Trap'),
                  _buildHistoryTile('Syllogism Trick Recovery'),
                  _buildHistoryTile('Current Affairs 2026 Revision'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryTile(String title) {
    return ListTile(
      dense: true,
      leading: const Icon(Icons.chat_bubble_outline, color: Color(0xFF737373), size: 16),
      title: Text(title, style: const TextStyle(color: Color(0xFFD4D4D4), fontSize: 12), overflow: TextOverflow.ellipsis),
      onTap: () => Navigator.pop(context),
    );
  }

  Widget _buildComposer() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: const BoxDecoration(
        color: Color(0xFF0D0D0D),
        border: Border(top: BorderSide(color: Color(0xFF1F1F1F))),
      ),
      child: SafeArea(
        child: Row(
          children: [
            IconButton(
              icon: Icon(
                _isListening ? Icons.mic : Icons.mic_none,
                color: _isListening ? const Color(0xFFFF7A1A) : const Color(0xFF737373),
              ),
              onPressed: () {
                setState(() => _isListening = !_isListening);
              },
            ),
            Expanded(
              child: TextField(
                controller: _textController,
                style: const TextStyle(color: Color(0xFFEDEDED), fontSize: 13),
                decoration: const InputDecoration(
                  hintText: 'Message Hermes...',
                  hintStyle: TextStyle(color: Color(0xFF525252), fontSize: 13),
                  border: InputBorder.none,
                ),
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.send, color: Color(0xFFFF7A1A)),
              onPressed: _sendMessage,
            ),
          ],
        ),
      ),
    );
  }
}
