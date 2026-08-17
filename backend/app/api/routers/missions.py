from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from backend.app.api.deps import get_current_user, UserTokenPayload
from backend.app.core.database import SessionLocal
from backend.app.models.content import Question, QuestionOption, Subject, Topic
from backend.app.models.enums import PublicationStatus
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

    # Pull real published questions from live database across all active subjects
    db = SessionLocal()
    published_pool = []
    try:
        db_questions = db.query(Question).filter(
            Question.publication_status == PublicationStatus.PUBLISHED,
            Question.is_deleted == False
        ).order_by(Question.created_at.desc()).limit(500).all()
        for q in db_questions:
            opts = db.query(QuestionOption).filter(QuestionOption.question_id == q.id).order_by(QuestionOption.option_index).all()
            published_pool.append({
                "question_id": q.id,
                "subject_code": q.subject.code if q.subject else "QUANT",
                "topic_code": q.topic.code if q.topic else "SIMPLIFICATION",
                "text": q.text,
                "options": [f"{o.option_label} {o.text}" for o in opts],
                "correct_option_index": q.correct_option_index or 0
            })
    finally:
        db.close()

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
    
    # Initialize active mission state with live questions pool
    db = SessionLocal()
    published_pool = []
    try:
        db_questions = db.query(Question).filter(
            Question.publication_status == PublicationStatus.PUBLISHED,
            Question.is_deleted == False
        ).limit(100).all()
        for q in db_questions:
            opts = db.query(QuestionOption).filter(QuestionOption.question_id == q.id).order_by(QuestionOption.option_index).all()
            published_pool.append({
                "question_id": q.id,
                "subject_code": q.subject.code if q.subject else "QUANT",
                "topic_code": q.topic.code if q.topic else "SIMPLIFICATION",
                "text": q.text,
                "options": [f"{o.option_label} {o.text}" for o in opts],
                "correct_option_index": q.correct_option_index or 0
            })
    finally:
        db.close()

    enabled_subjects = ["QUANT", "REASONING"]
    enabled_topics_map = {"QUANT": [{"code": "SIMPLIFICATION", "state": "AVAILABLE"}]}
    state = manager.start_daily_mission(current_user.user_id, enabled_subjects, enabled_topics_map, [], published_pool)

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
    MISSION_CONFIG_STORE[req.subject_code] = req.target_count

    return {
        "status": "SUCCESS",
        "subject_code": req.subject_code,
        "new_target_count": req.target_count,
        "message": f"Updated {req.subject_code} target to {req.target_count} questions."
    }
