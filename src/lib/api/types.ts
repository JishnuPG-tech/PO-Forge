export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  is_admin: boolean;
}

export interface UserProfileResponse {
  user_id: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
  target_exam: string;
  target_exam_days_left: number;
  streak_days?: number;
  enabled_subjects: string[];
}

export interface QuestionResponse {
  question_id: string;
  subject_code: string;
  topic_code: string;
  text: string;
  options: string[];
  correct_option_index: number;
  explanation?: string;
  shortcut?: string;
  common_trap?: string;
  difficulty: string;
  publication_status: string;
  user_selected_option?: number | null;
  is_correct?: boolean | null;
}

export interface DailyMissionStateResponse {
  user_id: string;
  status: "not_started" | "in_progress" | "complete";
  completed_question_count: number;
  target_question_count: number;
  sections: Array<{
    subject_code: string;
    subject_name: string;
    questions: QuestionResponse[];
    completed_count: number;
  }>;
}

export interface SubmitQuestionRequest {
  section_index: number;
  question_index: number;
  selected_option_index: number | null;
  is_skipped?: boolean;
  response_time_ms?: number;
}

export interface SubmitQuestionResponse {
  status: string;
  question_id: string;
  is_correct: boolean;
  completed_count: number;
  target_count: number;
}

export interface AnalyticsResponse {
  user_id: string;
  readiness_state: string;
  readiness_score: number;
  overall_mastery_percentage: number;
  overall_accuracy_percentage: number;
  average_speed_seconds: number;
  revision_health_percentage: number;
  streak_days: number;
  target_exam_days_left: number;
  subject_mastery: Record<string, number>;
  mistake_intelligence: Record<string, number>;
  strongest_topics: string[];
  weakest_topics: string[];
  historical_trends: Array<{ day: string; accuracy: number; speed: number }>;
}

export interface HermesChatRequest {
  user_message: string;
  task_category?: "TUTORING" | "COMPLEX_REASONING" | "CLASSIFICATION";
}

export interface HermesChatResponse {
  response: string;
  model_used: string;
  tool_calls: Array<{ tool_name: string; status?: string; detail?: string; args?: Record<string, any>; result?: Record<string, any> }>;
  sources: Array<{ title: string; page?: number; snippet?: string }>;
  observability: Record<string, any>;
}

export interface DocumentResponse {
  document_id: string;
  filename: string;
  page_count: number;
  detected_questions_count: number;
  published_count: number;
  review_required_count: number;
  status: string;
  created_at: string;
}
