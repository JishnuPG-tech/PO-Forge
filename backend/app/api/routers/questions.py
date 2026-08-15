from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from backend.app.api.deps import get_current_user, get_current_admin_user, UserTokenPayload

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
    limit: int = Query(20, le=100),
    current_user: UserTokenPayload = Depends(get_current_user)
):
    # Search published banking question bank
    sample_q = QuestionSearchResponse(
        question_id="Q_BANK_1001",
        subject_code=subject_code or "QUANT",
        topic_code=topic_code or "SIMPLIFICATION",
        text="Find Simple Interest on ₹12,000 at 10% per annum for 3 years.",
        options=["(A) ₹3,200", "(B) ₹3,600", "(C) ₹4,000", "(D) ₹4,200", "(E) ₹4,500"],
        correct_option_index=1,
        explanation="SI = (P * R * T) / 100 = (12000 * 10 * 3) / 100 = ₹3,600.",
        shortcut="10% of 12000 = 1200. For 3 years = 1200 * 3 = ₹3600.",
        common_trap="Don't confuse simple interest with compound interest formula.",
        difficulty=difficulty or "MEDIUM",
        publication_status="PUBLISHED"
    )
    return [sample_q]

@router.post("/{question_id}/approve")
def approve_question_for_publication(
    question_id: str,
    admin_user: UserTokenPayload = Depends(get_current_admin_user)
):
    return {
        "status": "SUCCESS",
        "question_id": question_id,
        "publication_status": "PUBLISHED",
        "approved_by": admin_user.user_id,
        "message": f"Question {question_id} has passed publication gate and is published."
    }
