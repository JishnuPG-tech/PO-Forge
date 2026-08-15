from typing import List, Tuple
from backend.app.services.rag_engine.schemas import RAGSearchResult, SourceAttribution

def apply_reciprocal_rank_fusion(
    dense_results: List[RAGSearchResult],
    sparse_results: List[RAGSearchResult],
    k: int = 60
) -> List[RAGSearchResult]:
    """
    Combines dense and sparse search rankings using Reciprocal Rank Fusion (RRF).
    """
    scores = {}
    chunk_map = {}

    # Rank dense
    for rank, res in enumerate(dense_results, start=1):
        cid = res.chunk_id
        chunk_map[cid] = res
        scores[cid] = scores.get(cid, 0.0) + (1.0 / (k + rank))

    # Rank sparse
    for rank, res in enumerate(sparse_results, start=1):
        cid = res.chunk_id
        chunk_map[cid] = res
        scores[cid] = scores.get(cid, 0.0) + (1.0 / (k + rank))

    reranked = []
    for cid, rrf_score in sorted(scores.items(), key=lambda item: item[1], reverse=True):
        item = chunk_map[cid]
        item.score = round(rrf_score, 5)
        reranked.append(item)

    return reranked

def assemble_rag_context_with_sources(results: List[RAGSearchResult]) -> Tuple[str, List[SourceAttribution]]:
    """
    Assembles clean RAG context string with explicit source attributions.
    """
    context_blocks = []
    attributions = []

    for idx, res in enumerate(results, start=1):
        block = f"[Source #{idx}: {res.attribution.document_title}, Page {res.attribution.page_number}]\n{res.content}"
        context_blocks.append(block)
        attributions.append(res.attribution)

    assembled_context = "\n\n".join(context_blocks)
    return assembled_context, attributions
