import uuid
import re
from typing import List, Dict, Any, Optional
from backend.app.services.rag_engine.schemas import RAGChunk, RAGChunkMetadata, ContentType

def extract_section_name(text: str) -> Optional[str]:
    match = re.search(r'^(?:#+|\bSection|\bChapter|\bTopic)\s*([\w\d\.\s]+?)(?=\.\s+[A-Z]|\n|$)', text, re.MULTILINE | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return None

def chunk_page_text(
    document_id: str,
    document_title: str,
    page_number: int,
    page_text: str,
    subject_code: str = "QUANT",
    topic_code: Optional[str] = None,
    subtopic_code: Optional[str] = None,
    content_type: ContentType = ContentType.STUDY_NOTE,
    is_approved: bool = True,
    chunk_size_words: int = 250,
    overlap_words: int = 50
) -> List[RAGChunk]:
    
    # Security Gate: Reject unapproved documents from indexing
    if not is_approved:
        return []

    words = page_text.split()
    if not words:
        return []

    chunks = []
    start = 0
    section_name = extract_section_name(page_text) or f"Page {page_number}"

    while start < len(words):
        end = min(start + chunk_size_words, len(words))
        chunk_words = words[start:end]
        chunk_content = " ".join(chunk_words)

        chunk_id = f"CHK_{document_id[:6]}_P{page_number:03d}_{start:04d}"
        
        meta = RAGChunkMetadata(
            document_id=document_id,
            document_title=document_title,
            page_number=page_number,
            section_name=section_name,
            subject_code=subject_code,
            topic_code=topic_code,
            subtopic_code=subtopic_code,
            content_type=content_type,
            is_approved=is_approved
        )

        chunks.append(RAGChunk(
            chunk_id=chunk_id,
            content=chunk_content,
            metadata=meta
        ))

        if end == len(words):
            break
        start += (chunk_size_words - overlap_words)

    return chunks
