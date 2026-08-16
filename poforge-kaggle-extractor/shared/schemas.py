"""
Shared Pydantic Models for Document Intelligence & Validation
Serves as the unified source of truth between Kaggle worker and production backend.
"""
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field


class SubjectCode(str, Enum):
    QUANT = "QUANT"
    REASONING = "REASONING"
    ENGLISH = "ENGLISH"
    GA_BANKING = "GA_BANKING"


class PublicationStatus(str, Enum):
    PUBLISHED = "PUBLISHED"
    REJECTED = "REJECTED"
    NEEDS_REVIEW = "NEEDS_REVIEW"


class ExtractedOption(BaseModel):
    label: str
    text: str


class QuestionCandidate(BaseModel):
    id: str = Field(description="Unique question candidate ID")
    document_id: str
    page_number: int
    subject_code: SubjectCode = SubjectCode.QUANT
    topic_code: str = "GENERAL"
    subtopic_code: Optional[str] = None
    difficulty_tier: str = "TIER_1_DRILL"
    stem_text: str
    options: List[ExtractedOption] = []
    correct_option_index: Optional[int] = None
    correct_answer_text: Optional[str] = None
    explanation_text: Optional[str] = None
    is_multi_part: bool = False
    validation_status: str = "PENDING"
    publication_status: PublicationStatus = PublicationStatus.NEEDS_REVIEW
    rejection_reasons: List[str] = []
    raw_snippet: Optional[str] = None
    metadata: Dict[str, Any] = {}


class ExtractionBatchResult(BaseModel):
    document_id: str
    document_name: str
    sha256_hash: str
    page_count: int
    raw_regex_count: int
    extracted_candidates_count: int
    published_count: int
    rejected_count: int
    needs_review_count: int
    reconciliation_gap: int
    published_questions: List[QuestionCandidate] = []
    rejected_log: List[Dict[str, Any]] = []
    needs_review_log: List[Dict[str, Any]] = []
