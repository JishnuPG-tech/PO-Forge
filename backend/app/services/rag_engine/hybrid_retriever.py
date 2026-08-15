import math
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.services.rag_engine.schemas import (
    RAGChunk, RAGSearchResult, SourceAttribution, RAGChunkMetadata, ContentType
)
from backend.app.models.content import KnowledgeChunk, Document

def compute_bm25_score(query: str, text: str) -> float:
    query_lower = query.lower()
    text_lower = text.lower()
    query_words = [w for w in query_lower.split() if len(w) > 2]
    text_words = text_lower.split()
    if not query_words or not text_words:
        return 0.0
    
    score = 0.0
    doc_len = len(text_words)
    avg_len = 200.0
    k1 = 1.5
    b = 0.75

    matched_unique = 0
    for qw in set(query_words):
        freq = text_words.count(qw)
        if freq > 0:
            matched_unique += 1
            tf = (freq * (k1 + 1)) / (freq + k1 * (1 - b + b * (doc_len / avg_len)))
            score += tf

    # Boost score if unique query word coverage is high
    coverage_ratio = matched_unique / len(set(query_words))
    score *= (1.0 + coverage_ratio)

    # Boost if exact phrase matches
    if query_lower in text_lower:
        score += 2.0

    return round(score, 3)

class HybridRetriever:

    def __init__(self, db_session: Optional[Session] = None):
        self.db = db_session

    def search(
        self,
        query: str,
        subject_code: Optional[str] = None,
        topic_code: Optional[str] = None,
        content_type: Optional[ContentType] = None,
        selected_doc_ids: Optional[List[str]] = None,
        limit: int = 10,
        in_memory_chunks: Optional[List[RAGChunk]] = None
    ) -> List[RAGSearchResult]:
        
        candidates: List[RAGSearchResult] = []

        # 1. Search DB knowledge_chunks if DB session present
        if self.db:
            q_filter = self.db.query(KnowledgeChunk)
            if selected_doc_ids:
                q_filter = q_filter.filter(KnowledgeChunk.document_id.in_(selected_doc_ids))
            
            db_chunks = q_filter.limit(50).all()
            for kc in db_chunks:
                sparse_s = compute_bm25_score(query, kc.content)
                dense_s = 0.75 if any(w in kc.content.lower() for w in query.lower().split()) else 0.1
                
                doc_name = "Banking Study Notes"
                if kc.document_id:
                    doc_obj = self.db.query(Document).filter_by(id=kc.document_id).first()
                    if doc_obj:
                        doc_name = doc_obj.title
                        
                meta = RAGChunkMetadata(
                    document_id=kc.document_id or "DOC_001",
                    document_title=doc_name,
                    page_number=kc.page_number or 1,
                    section_name="Study Section",
                    subject_code=subject_code or "QUANT",
                    topic_code=topic_code,
                    content_type=content_type or ContentType.STUDY_NOTE
                )

                attribution = SourceAttribution(
                    document_title=doc_name,
                    page_number=kc.page_number or 1,
                    section_name="Study Section",
                    content_snippet=kc.content[:150],
                    citation_text=f"Source: {doc_name}, Page {kc.page_number or 1}"
                )

                candidates.append(RAGSearchResult(
                    chunk_id=kc.id,
                    content=kc.content,
                    score=dense_s * 0.6 + sparse_s * 0.4,
                    dense_score=dense_s,
                    sparse_score=sparse_s,
                    attribution=attribution,
                    metadata=meta
                ))

        # 2. Search in-memory chunks if provided
        if in_memory_chunks:
            for chk in in_memory_chunks:
                # Security Gate: Filter unapproved documents
                if not chk.metadata.is_approved:
                    continue
                if subject_code and chk.metadata.subject_code != subject_code:
                    continue
                if topic_code and chk.metadata.topic_code and chk.metadata.topic_code != topic_code:
                    continue
                if selected_doc_ids and chk.metadata.document_id not in selected_doc_ids:
                    continue

                sparse_s = compute_bm25_score(query, chk.content)
                q_words = set(query.lower().split())
                matches_count = sum(1 for w in q_words if w in chk.content.lower())
                dense_s = round(matches_count / max(1, len(q_words)), 3)
                
                attribution = SourceAttribution(
                    document_title=chk.metadata.document_title,
                    page_number=chk.metadata.page_number,
                    section_name=chk.metadata.section_name,
                    content_snippet=chk.content[:150],
                    citation_text=f"Source: {chk.metadata.document_title}, Page {chk.metadata.page_number}"
                )

                candidates.append(RAGSearchResult(
                    chunk_id=chk.chunk_id,
                    content=chk.content,
                    score=round(dense_s * 0.6 + sparse_s * 0.4, 3),
                    dense_score=dense_s,
                    sparse_score=sparse_s,
                    attribution=attribution,
                    metadata=chk.metadata
                ))

        # Sort candidate results by hybrid score descending
        candidates.sort(key=lambda r: r.score, reverse=True)
        return candidates[:limit]
