from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class MissionStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"

class MissionQuestionItem(BaseModel):
    question_id: str
    subject_code: str
    topic_code: str
    subtopic_code: Optional[str] = None
    text: str
    options: List[str]
    correct_option_index: int
    explanation: Optional[str] = None
    shortcut: Optional[str] = None
    common_trap: Optional[str] = None
    difficulty: str = "MEDIUM"
    est_time_seconds: int = 60
    is_revision_item: bool = False
    question_order: int
    
    # Progress tracking fields
    user_selected_option: Optional[int] = None
    is_correct: Optional[bool] = None
    is_skipped: bool = False
    response_time_ms: int = 0
    answered_at: Optional[str] = None

class MissionSectionSpec(BaseModel):
    subject_code: str
    subject_name: str
    section_order: int
    target_count: int
    completed_count: int = 0
    questions: List[MissionQuestionItem] = []

class MissionAllocationAudit(BaseModel):
    subject_code: str
    topic_code: str
    allocated_count: int
    revision_count: int
    reason: str

class DailyMissionState(BaseModel):
    mission_id: str
    user_id: str
    mission_date: str
    status: MissionStatus
    target_question_count: int
    completed_question_count: int = 0
    current_section_index: int = 0
    current_question_index: int = 0
    sections: List[MissionSectionSpec] = []
    audits: List[MissionAllocationAudit] = []
    created_at: str
    completed_at: Optional[str] = None

class MissionReport(BaseModel):
    mission_id: str
    user_id: str
    mission_date: str
    total_score: float
    total_questions: int
    correct_count: int
    incorrect_count: int
    skipped_count: int
    accuracy_percentage: float
    average_time_seconds_per_q: float
    total_duration_minutes: float
    subject_performance: Dict[str, Dict[str, Any]]
    topic_performance: Dict[str, Dict[str, Any]]
    mistake_categories_breakdown: Dict[str, int]
    next_day_recommendations: List[str]
