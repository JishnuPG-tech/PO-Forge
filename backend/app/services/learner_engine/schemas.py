from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class RecommendationReasonType(str, Enum):
    SPACED_REVISION_DUE = "SPACED_REVISION_DUE"
    WEAK_TOPIC_RECOVERY = "WEAK_TOPIC_RECOVERY"
    RECURRING_MISTAKE_CORRECTION = "RECURRING_MISTAKE_CORRECTION"
    DAILY_MISSION_ALLOCATION = "DAILY_MISSION_ALLOCATION"
    NEW_TOPIC_LEARNING = "NEW_TOPIC_LEARNING"

class RecommendationExplanation(BaseModel):
    recommendation_id: str
    target_type: str  # QUESTION, TOPIC, REVISION_ITEM
    target_id: str
    reason: str
    reason_type: RecommendationReasonType
    evidence: Dict[str, Any]
    affected_topic_code: str
    previous_state: str
    new_state: str
    timestamp: str

class SuperMemoState(BaseModel):
    interval_days: float
    ease_factor: float
    repetitions: int
    lapse_count: int
    next_review_at: str

class MasteryUpdateRecord(BaseModel):
    user_id: str
    topic_code: str
    subtopic_code: Optional[str] = None
    concept_id: Optional[str] = None
    previous_mastery: float
    new_mastery: float
    accuracy_percentage: float
    average_speed_seconds: float
    readiness_state: str
    updated_at: str
