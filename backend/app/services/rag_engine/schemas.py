from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class ContentType(str, Enum):
    COACHING_PDF = "COACHING_PDF"
    STUDY_NOTE = "STUDY_NOTE"
    FORMULA_SHEET = "FORMULA_SHEET"
    EXPLANATION = "EXPLANATION"
    BANKING_AWARENESS = "BANKING_AWARENESS"
    CURRENT_AFFAIRS = "CURRENT_AFFAIRS"
    APPROVED_KNOWLEDGE = "APPROVED_KNOWLEDGE"

class RAGChunkMetadata(BaseModel):
    document_id: str
    document_title: str
    document_version: str = "v1.0"
    page_number: int
    section_name: Optional[str] = None
    subject_code: str = "QUANT"
    topic_code: Optional[str] = None
    subtopic_code: Optional[str] = None
    exam_code: Optional[str] = "IBPS_RRB_PO"
    content_type: ContentType = ContentType.STUDY_NOTE
    is_approved: bool = True

class RAGChunk(BaseModel):
    chunk_id: str
    content: str
    metadata: RAGChunkMetadata
    embedding: Optional[List[float]] = None

class SourceAttribution(BaseModel):
    document_title: str
    page_number: int
    section_name: Optional[str] = None
    content_snippet: str
    citation_text: str  # e.g., "Source: Quantitative Aptitude Notes, Page 14"

class RAGSearchResult(BaseModel):
    chunk_id: str
    content: str
    score: float
    dense_score: float = 0.0
    sparse_score: float = 0.0
    attribution: SourceAttribution
    metadata: RAGChunkMetadata

class AdaptiveRAGRequest(BaseModel):
    user_id: str
    user_query: str
    query_intent: str = "EXPLAIN_CONCEPT"  # EXPLAIN_CONCEPT, RETRIEVE_FORMULA, SUMMARIZE_NOTES, COMPARE_DOCS, TEACH_WEAK_CONCEPT
    subject_code: Optional[str] = None
    topic_code: Optional[str] = None
    selected_document_ids: Optional[List[str]] = None
    top_k: int = 5
