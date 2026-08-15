import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from backend.app.services.performance_engine.schemas import AttemptRecord, DetailedMistakeCategory

def classify_attempt_mistake(
    is_correct: bool,
    response_time_ms: int,
    confidence_level: str = "HIGH",
    is_skipped: bool = False
) -> Optional[DetailedMistakeCategory]:
    
    if is_correct or is_skipped:
        return None

    resp_sec = response_time_ms / 1000.0

    if confidence_level == "LOW":
        return DetailedMistakeCategory.GUESSING
    elif resp_sec < 15.0:
        return DetailedMistakeCategory.CARELESS_ERROR
    elif resp_sec > 90.0:
        return DetailedMistakeCategory.TIME_PRESSURE
    else:
        return DetailedMistakeCategory.CALCULATION_ERROR

def create_attempt_record(
    user_id: str,
    question_id: str,
    subject_code: str,
    topic_code: str,
    correct_option_index: int,
    selected_option_index: Optional[int],
    response_time_ms: int,
    question_difficulty: str = "MEDIUM",
    subtopic_code: Optional[str] = None,
    concept_id: Optional[str] = None,
    confidence_level: str = "HIGH",
    is_skipped: bool = False
) -> AttemptRecord:
    
    is_correct = False if (is_skipped or selected_option_index is None) else (selected_option_index == correct_option_index)
    
    mistake_cat = classify_attempt_mistake(
        is_correct=is_correct,
        response_time_ms=response_time_ms,
        confidence_level=confidence_level,
        is_skipped=is_skipped
    )

    return AttemptRecord(
        attempt_id=f"ATT_{uuid.uuid4().hex[:8]}",
        user_id=user_id,
        question_id=question_id,
        subject_code=subject_code,
        topic_code=topic_code,
        subtopic_code=subtopic_code,
        concept_id=concept_id,
        question_difficulty=question_difficulty,
        is_correct=is_correct,
        is_skipped=is_skipped,
        selected_option_index=selected_option_index,
        correct_option_index=correct_option_index,
        response_time_ms=response_time_ms,
        confidence_level=confidence_level,
        mistake_category=mistake_cat,
        attempted_at=datetime.now(timezone.utc).isoformat()
    )
