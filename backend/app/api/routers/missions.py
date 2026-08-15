from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from backend.app.api.deps import get_current_user, UserTokenPayload
from backend.app.services.mission_engine.mission_lifecycle import DailyMissionLifecycleManager
from backend.app.services.mission_engine.schemas import DailyMissionState, MissionReport, MissionStatus

router = APIRouter(prefix="/missions", tags=["Daily Missions"])

class SubmitQuestionRequest(BaseModel):
    section_index: int
    question_index: int
    selected_option_index: Optional[int]
    is_skipped: bool = False
    response_time_ms: int = 30000

MISSION_CONFIG_STORE = {
    "QUANT": 25,
    "REASONING": 25,
    "ENGLISH": 20,
    "GA_BANKING": 20
}

@router.post("/start", response_model=DailyMissionState)
def start_today_mission(current_user: UserTokenPayload = Depends(get_current_user)):
    manager = DailyMissionLifecycleManager()
    
    enabled_subjects = ["QUANT", "REASONING", "ENGLISH", "GA_BANKING"]
    enabled_topics_map = {
        "QUANT": [{"code": "SIMPLIFICATION", "state": "AVAILABLE"}],
        "REASONING": [{"code": "SYLLOGISM", "state": "AVAILABLE"}],
        "ENGLISH": [{"code": "READING_COMPREHENSION", "state": "AVAILABLE"}],
        "GA_BANKING": [{"code": "BANKING_AWARENESS", "state": "AVAILABLE"}]
    }

    published_pool = [
        {"question_id": "Q_101", "subject_code": "QUANT", "topic_code": "SIMPLIFICATION", "text": "What is 25 * 4?", "options": ["(A) 100", "(B) 120"], "correct_option_index": 0},
        {"question_id": "Q_102", "subject_code": "REASONING", "topic_code": "SYLLOGISM", "text": "All A are B.", "options": ["(A) Conclusion I", "(B) Conclusion II"], "correct_option_index": 0}
    ]

    total_target = sum(MISSION_CONFIG_STORE.values())

    state = manager.start_daily_mission(
        user_id=current_user.user_id,
        enabled_subjects=enabled_subjects,
        enabled_topics_map=enabled_topics_map,
        due_revision_question_ids=[],
        published_questions_pool=published_pool,
        target_question_count=total_target
    )

    # Apply stored custom subject targets
    for sec in state.sections:
        if sec.subject_code in MISSION_CONFIG_STORE:
            sec.target_count = MISSION_CONFIG_STORE[sec.subject_code]
    state.target_question_count = sum(s.target_count for s in state.sections)

    return state

@router.post("/submit-question")
def submit_question_attempt(
    req: SubmitQuestionRequest,
    current_user: UserTokenPayload = Depends(get_current_user)
):
    manager = DailyMissionLifecycleManager()
    
    # Initialize sample active mission state
    enabled_subjects = ["QUANT", "REASONING"]
    enabled_topics_map = {"QUANT": [{"code": "SIMPLIFICATION", "state": "AVAILABLE"}]}
    state = manager.start_daily_mission(current_user.user_id, enabled_subjects, enabled_topics_map, [], [])

    updated_state, q_item = manager.submit_mission_question(
        state=state,
        section_index=req.section_index,
        question_index=req.question_index,
        selected_option_index=req.selected_option_index,
        is_skipped=req.is_skipped,
        response_time_ms=req.response_time_ms
    )

    return {
        "status": "SUCCESS",
        "question_id": q_item.question_id,
        "is_correct": q_item.is_correct,
        "completed_count": updated_state.completed_question_count,
        "target_count": updated_state.target_question_count
    }

class UpdateMissionConfigRequest(BaseModel):
    subject_code: str = "QUANT"
    target_count: int = 40

@router.post("/update-config")
def update_mission_config(
    req: UpdateMissionConfigRequest,
    current_user: UserTokenPayload = Depends(get_current_user)
):
    # Store requested custom subject target
    MISSION_CONFIG_STORE[req.subject_code] = req.target_count

    return {
        "status": "SUCCESS",
        "subject_code": req.subject_code,
        "new_target_count": req.target_count,
        "message": f"Updated {req.subject_code} target to {req.target_count} questions."
    }
