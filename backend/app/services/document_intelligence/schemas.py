from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class ExtractionStatus(str, Enum):
    SUCCESS = "SUCCESS"
    PARTIAL = "PARTIAL"
    FAILED = "FAILED"

class StructureStatus(str, Enum):
    COMPLETE = "COMPLETE"
    PAGE_CONTINUED = "PAGE_CONTINUED"
    MALFORMED = "MALFORMED"

class OptionStatus(str, Enum):
    VALID_4 = "VALID_4"
    VALID_5 = "VALID_5"
    MISSING_OPTIONS = "MISSING_OPTIONS"
    DUPLICATE_OPTIONS = "DUPLICATE_OPTIONS"
    INVALID_COUNT = "INVALID_COUNT"

class AnswerStatus(str, Enum):
    FOUND = "FOUND"
    INFERRED = "INFERRED"
    MISSING = "MISSING"
    OUT_OF_BOUNDS = "OUT_OF_BOUNDS"

class AnomalyStatus(str, Enum):
    NONE = "NONE"
    LOW_SEVERITY = "LOW_SEVERITY"
    MEDIUM_SEVERITY = "MEDIUM_SEVERITY"
    CRITICAL_SEVERITY = "CRITICAL_SEVERITY"

class VerificationStatus(str, Enum):
    VERIFIED_MATH = "VERIFIED_MATH"
    VERIFIED_KEY = "VERIFIED_KEY"
    DISCREPANCY_FLAGGED = "DISCREPANCY_FLAGGED"
    UNVERIFIED = "UNVERIFIED"

class BoundingBox(BaseModel):
    x0: float
    y0: float
    x1: float
    y1: float

class ExtractedOption(BaseModel):
    index: int
    label: str  # (A), (B), (C), (D), (E)
    text: str
    is_correct: bool = False
    bounding_box: Optional[BoundingBox] = None

class ExtractedSourceLocation(BaseModel):
    document_id: Optional[str] = None
    page_number: int
    original_question_number: Optional[str] = None
    bounding_box: Optional[BoundingBox] = None

class QuestionCandidate(BaseModel):
    candidate_id: str
    raw_text: str
    normalized_text: str
    structured_text: str = ""
    source: str = "DOCUMENT_INGESTED"
    di_set_id: Optional[str] = None
    di_context_text: Optional[str] = None
    
    options: List[ExtractedOption] = []
    option_count: int = 0
    correct_option_index: Optional[int] = None
    
    explanation_text: Optional[str] = None
    shortcut_text: Optional[str] = None
    
    subject_code: Optional[str] = "QUANT"
    topic_code: Optional[str] = "SIMPLIFICATION"
    subtopic_code: Optional[str] = "BODMAS_RULES"
    difficulty: str = "MEDIUM"
    est_time_seconds: int = 60
    target_time_seconds: Optional[int] = None
    
    has_table: bool = False
    has_diagram: bool = False
    has_equations: bool = False
    
    extraction_status: ExtractionStatus = ExtractionStatus.SUCCESS
    structure_status: StructureStatus = StructureStatus.COMPLETE
    option_status: OptionStatus = OptionStatus.VALID_5
    answer_status: AnswerStatus = AnswerStatus.FOUND
    anomaly_status: AnomalyStatus = AnomalyStatus.NONE
    verification_status: VerificationStatus = VerificationStatus.UNVERIFIED
    
    confidence_score: float = 1.0
    anomalies_detected: List[str] = []
    source_location: Optional[ExtractedSourceLocation] = None

class DocumentForensicsReport(BaseModel):
    file_name: str
    file_hash: str
    file_size_bytes: int
    doc_type: str
    page_count: int
    is_encrypted: bool = False
    has_scanned_pages: bool = False
    font_metadata: List[str] = []
    security_passed: bool = True

class ProcessingReport(BaseModel):
    document_id: str
    file_name: str
    total_pages_processed: int
    total_raw_text_length: int
    total_questions_extracted: int
    valid_published_candidates: int
    review_required_candidates: int
    rejected_candidates: int
    anomalies_summary: Dict[str, int] = {}
    ocr_pages_count: int = 0
    di_sets_found: int = 0
    processing_time_seconds: float = 0.0
    quality_gate_passed: bool = True
