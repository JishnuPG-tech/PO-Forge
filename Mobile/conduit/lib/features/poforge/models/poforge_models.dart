class QuestionOptionItem {
  final int index;
  final String label;
  final String text;
  final bool isCorrect;

  QuestionOptionItem({
    required this.index,
    required this.label,
    required this.text,
    this.isCorrect = false,
  });

  factory QuestionOptionItem.fromJson(Map<String, dynamic> json) {
    return QuestionOptionItem(
      index: json['option_index'] as int? ?? 0,
      label: json['option_label'] as String? ?? '',
      text: json['text'] as String? ?? '',
      isCorrect: json['is_correct'] as bool? ?? false,
    );
  }
}

class PoforgeQuestion {
  final String questionId;
  final String subjectCode;
  final String topicCode;
  final String text;
  final List<String> options;
  final int correctOptionIndex;
  final String? explanation;
  final String? shortcut;

  PoforgeQuestion({
    required this.questionId,
    required this.subjectCode,
    required this.topicCode,
    required this.text,
    required this.options,
    required this.correctOptionIndex,
    this.explanation,
    this.shortcut,
  });

  factory PoforgeQuestion.fromJson(Map<String, dynamic> json) {
    final rawOptions = json['options'] as List<dynamic>? ?? [];
    return PoforgeQuestion(
      questionId: json['question_id'] as String? ?? '',
      subjectCode: json['subject_code'] as String? ?? 'QUANT',
      topicCode: json['topic_code'] as String? ?? 'SIMPLIFICATION',
      text: json['text'] as String? ?? '',
      options: rawOptions.map((e) => e.toString()).toList(),
      correctOptionIndex: json['correct_option_index'] as int? ?? 0,
      explanation: json['explanation'] as String?,
      shortcut: json['shortcut'] as String?,
    );
  }
}

class HermesToolCall {
  final String toolName;
  final Map<String, dynamic> parameters;
  final dynamic result;

  HermesToolCall({
    required this.toolName,
    required this.parameters,
    this.result,
  });

  factory HermesToolCall.fromJson(Map<String, dynamic> json) {
    return HermesToolCall(
      toolName: json['tool_name'] as String? ?? '',
      parameters: json['parameters'] as Map<String, dynamic>? ?? {},
      result: json['result'],
    );
  }
}

class HermesChatResponse {
  final String response;
  final String modelUsed;
  final List<HermesToolCall> toolCalls;

  HermesChatResponse({
    required this.response,
    required this.modelUsed,
    required this.toolCalls,
  });

  factory HermesChatResponse.fromJson(Map<String, dynamic> json) {
    final rawToolCalls = json['tool_calls'] as List<dynamic>? ?? [];
    return HermesChatResponse(
      response: json['response'] as String? ?? '',
      modelUsed: json['model_used'] as String? ?? 'unknown',
      toolCalls: rawToolCalls.map((e) => HermesToolCall.fromJson(e as Map<String, dynamic>)).toList(),
    );
  }
}
