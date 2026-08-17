from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from backend.app.api.deps import get_current_user, get_current_admin_user, UserTokenPayload
from backend.app.core.database import SessionLocal
from backend.app.models.content import Question, QuestionOption, QuestionSolution, Subject, Topic
from backend.app.models.enums import PublicationStatus

router = APIRouter(prefix="/questions", tags=["Questions & Validation"])

class QuestionSearchResponse(BaseModel):
    question_id: str
    subject_code: str
    topic_code: str
    text: str
    options: List[str]
    correct_option_index: int
    explanation: Optional[str] = None
    shortcut: Optional[str] = None
    common_trap: Optional[str] = None
    difficulty: str
    publication_status: str

@router.get("/search", response_model=List[QuestionSearchResponse])
def search_published_questions(
    subject_code: Optional[str] = Query(None),
    topic_code: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    current_user: UserTokenPayload = Depends(get_current_user)
):
    """Search real published questions from the persistent database."""
    db = SessionLocal()
    try:
        query = db.query(Question).filter(
            Question.publication_status == PublicationStatus.PUBLISHED,
            Question.is_deleted == False
        ).join(Topic, Question.topic_id == Topic.id).join(Subject, Question.subject_id == Subject.id)
        
        if subject_code:
            query = query.filter(Subject.code == subject_code.upper())
        if topic_code:
            query = query.filter(Topic.code == topic_code.upper())
            
        questions = query.limit(limit).all()
        
        results = []
        for q in questions:
            opts = db.query(QuestionOption).filter(QuestionOption.question_id == q.id).order_by(QuestionOption.option_index).all()
            sol = db.query(QuestionSolution).filter(QuestionSolution.question_id == q.id).first()
            
            diff_str = q.difficulty.value if hasattr(q.difficulty, 'value') else str(q.difficulty or 'MEDIUM')
            status_str = q.publication_status.value if hasattr(q.publication_status, 'value') else str(q.publication_status or 'PUBLISHED')
            
            results.append(QuestionSearchResponse(
                question_id=q.id,
                subject_code=q.subject.code if q.subject else (subject_code or "QUANT"),
                topic_code=q.topic.code if q.topic else (topic_code or "SIMPLIFICATION"),
                text=q.text,
                options=[f"{o.option_label} {o.text}" for o in opts],
                correct_option_index=q.correct_option_index or 0,
                explanation=sol.detailed_solution if sol else None,
                shortcut=None,
                common_trap=None,
                difficulty=diff_str,
                publication_status=status_str
            ))
            
        return results
    finally:
        db.close()

@router.post("/{question_id}/approve")
def approve_question_for_publication(
    question_id: str,
    admin_user: UserTokenPayload = Depends(get_current_admin_user)
):
    db = SessionLocal()
    try:
        q = db.query(Question).filter(Question.id == question_id).first()
        if not q:
            raise HTTPException(status_code=404, detail="Question not found")
        q.publication_status = PublicationStatus.PUBLISHED
        db.commit()
        return {
            "status": "SUCCESS",
            "question_id": question_id,
            "publication_status": "PUBLISHED",
            "approved_by": admin_user.user_id,
            "message": f"Question {question_id} has passed publication gate and is published."
        }
    finally:
        db.close()
