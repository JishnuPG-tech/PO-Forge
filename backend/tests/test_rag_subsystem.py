import pytest
from typing import List
from backend.app.services.rag_engine import (
    chunk_page_text, HybridRetriever, apply_reciprocal_rank_fusion,
    assemble_rag_context_with_sources, AdaptiveRAGEngine, AdaptiveRAGRequest,
    ContentType, RAGChunk
)

def create_sample_study_chunks() -> List[RAGChunk]:
    page1 = "Chapter 1: Simple Interest & Compound Interest. Formula for Simple Interest SI = (P * R * T) / 100. P is principal, R is rate per annum, T is time in years."
    page2 = "Chapter 2: Compound Interest. Formula CI = P * ((1 + R/100)^T - 1). For half-yearly compounding, rate becomes R/2 and time becomes 2T."
    page3 = "REJECTED UNAPPROVED DOC: Secret leaked answers."

    c1 = chunk_page_text("DOC_QUANT_01", "Quantitative Aptitude Notes.pdf", 1, page1, subject_code="QUANT", topic_code="SIMPLIFICATION", content_type=ContentType.FORMULA_SHEET, is_approved=True)
    c2 = chunk_page_text("DOC_QUANT_01", "Quantitative Aptitude Notes.pdf", 2, page2, subject_code="QUANT", topic_code="SIMPLIFICATION", content_type=ContentType.FORMULA_SHEET, is_approved=True)
    c3 = chunk_page_text("DOC_UNAPPROVED", "Unapproved Document.pdf", 1, page3, subject_code="QUANT", topic_code="SIMPLIFICATION", content_type=ContentType.STUDY_NOTE, is_approved=False)

    return c1 + c2 + c3

def test_page_aware_chunking_and_metadata_preservation():
    text = "Section 3.1 BODMAS Rules and Simplification. Always evaluate brackets first, then order, division, multiplication, addition, and subtraction."
    chunks = chunk_page_text("DOC_001", "Quant Guide.pdf", 5, text, subject_code="QUANT", topic_code="SIMPLIFICATION", is_approved=True)
    
    assert len(chunks) == 1
    chk = chunks[0]
    assert chk.metadata.document_id == "DOC_001"
    assert chk.metadata.page_number == 5
    assert "3.1 BODMAS Rules and Simplification" in chk.metadata.section_name

def test_security_rejection_filter_gate():
    # Unapproved documents must return 0 chunks
    unapproved_chunks = chunk_page_text("DOC_BAD", "Bad.pdf", 1, "Unapproved content", is_approved=False)
    assert len(unapproved_chunks) == 0

def test_hybrid_retrieval_and_rrf_reranking():
    chunks = create_sample_study_chunks()
    retriever = HybridRetriever()

    results = retriever.search(
        query="Simple Interest formula P R T",
        subject_code="QUANT",
        limit=5,
        in_memory_chunks=chunks
    )

    assert len(results) >= 1
    top_res = results[0]
    assert "Simple Interest" in top_res.content
    assert top_res.metadata.document_id == "DOC_QUANT_01"
    assert top_res.attribution.page_number == 1
    assert "Source: Quantitative Aptitude Notes.pdf, Page 1" in top_res.attribution.citation_text

def test_context_assembly_and_citations():
    chunks = create_sample_study_chunks()
    retriever = HybridRetriever()
    results = retriever.search(query="Compound Interest", limit=2, in_memory_chunks=chunks)

    assembled_text, attributions = assemble_rag_context_with_sources(results)
    
    assert "Quantitative Aptitude Notes.pdf" in assembled_text
    assert len(attributions) == len(results)

def test_adaptive_rag_engine_intents():
    chunks = create_sample_study_chunks()
    engine = AdaptiveRAGEngine()

    req = AdaptiveRAGRequest(
        user_id="STUDENT_101",
        user_query="Explain simple interest formula and how to solve it",
        query_intent="EXPLAIN_CONCEPT",
        subject_code="QUANT",
        top_k=3
    )

    rag_out = engine.execute_adaptive_rag(req, in_memory_chunks=chunks)
    
    assert rag_out["user_id"] == "STUDENT_101"
    assert rag_out["intent"] == "EXPLAIN_CONCEPT"
    assert "assembled_context" in rag_out
    assert len(rag_out["sources"]) > 0

def test_retrieval_quality_precision_evaluation():
    chunks = create_sample_study_chunks()
    retriever = HybridRetriever()

    test_cases = [
        {"query": "Simple interest formula", "expected_doc": "DOC_QUANT_01", "expected_page": 1},
        {"query": "Compound interest half-yearly rate", "expected_doc": "DOC_QUANT_01", "expected_page": 2}
    ]

    hits = 0
    for tc in test_cases:
        res = retriever.search(query=tc["query"], limit=1, in_memory_chunks=chunks)
        if res and res[0].metadata.document_id == tc["expected_doc"] and res[0].metadata.page_number == tc["expected_page"]:
            hits += 1

    precision_at_1 = hits / len(test_cases)
    assert precision_at_1 == 1.0  # 100% precision@1 on benchmark test queries

if __name__ == "__main__":
    pytest.main(["-v", __file__])
