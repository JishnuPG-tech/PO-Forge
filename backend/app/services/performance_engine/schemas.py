from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class DetailedMistakeCategory(str, Enum):
    CARELESS_ERROR = "CARELESS_ERROR"
    CALCULATION_ERROR = "CALCULATION_ERROR"
    CONCEPT_ERROR = "CONCEPT_ERROR"
    TIME_PRESSURE = "TIME_PRESSURE"
    MISREAD_QUESTION = "MISREAD_QUESTION"
    GUESSING = "GUESSING"

class AttemptRecord(BaseModel):
    attempt_id: str
    user_id: str
    question_id: str
    subject_code: str
    topic_code: str
    subtopic_code: Optional[str] = None
    concept_id: Optional[str] = None
    question_difficulty: str
    is_correct: bool
    is_skipped: bool = False
    selected_option_index: Optional[int] = None
    correct_option_index: int
    response_time_ms: int
    confidence_level: str = "HIGH"
    mistake_category: Optional[DetailedMistakeCategory] = None
    attempted_at: str

class SubjectPerformanceSummary(BaseModel):
    subject_code: str
    subject_name: str
    total_questions: int
    attempted_count: int
    correct_count: int
    incorrect_count: int
    skipped_count: int
    total_score: float
    accuracy_percentage: float
    average_speed_seconds: float
    difficulty_breakdown: Dict[str, Dict[str, Any]] # EASY, MEDIUM, HARD
    topic_breakdown: Dict[str, Dict[str, Any]]

class IncorrectQuestionDiagnostic(BaseModel):
    question_id: str
    subject_code: str
    topic_code: str
    question_text: str
    user_selected_option_text: str
    correct_option_text: str
    why_user_answer_was_wrong: str
    correct_concept_summary: str
    step_by_step_solution: str
    shortcut_tip: Optional[str] = None
    common_trap_warning: Optional[str] = None
    similar_question_ids: List[str] = []
    revision_status: Dict[str, Any]

class ComprehensivePerformanceReport(BaseModel):
    user_id: str
    session_id: str
    total_score: float
    overall_accuracy_percentage: float
    average_speed_seconds_per_q: float
    historical_trend_diff: float # e.g. +4.5% improvement vs last 5 sessions
    strongest_topics: List[Dict[str, Any]]
    weakest_topics: List[Dict[str, Any]]
    time_loss_questions: List[Dict[str, Any]] # Questions taking > 1.5x est time
    question_selection_behavior: Dict[str, Any]
    revision_health_percentage: float
    subject_summaries: List[SubjectPerformanceSummary]
    incorrect_diagnostics: List[IncorrectQuestionDiagnostic]
