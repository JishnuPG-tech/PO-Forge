from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.services.rag_engine.schemas import AdaptiveRAGRequest, RAGSearchResult, RAGChunk, SourceAttribution
from backend.app.services.rag_engine.hybrid_retriever import HybridRetriever
from backend.app.services.rag_engine.reranker import apply_reciprocal_rank_fusion, assemble_rag_context_with_sources
from backend.app.models.learning import UserMastery, Mistake, UserTopicState

class AdaptiveRAGEngine:

    def __init__(self, db_session: Optional[Session] = None):
        self.db = db_session
        self.retriever = HybridRetriever(db_session=db_session)

    def execute_adaptive_rag(
        self,
        request: AdaptiveRAGRequest,
        in_memory_chunks: Optional[List[RAGChunk]] = None
    ) -> Dict[str, Any]:
        
        # 1. Fetch learner model state (mastery, weak topics, recent mistakes) without leaking PII
        learner_context = {}
        if self.db:
            m = self.db.query(UserMastery).filter_by(user_id=request.user_id).first()
            if m:
                learner_context["overall_mastery"] = m.overall_mastery_percentage
                learner_context["readiness_state"] = m.readiness_state.value
                
            recent_mistakes = self.db.query(Mistake).filter_by(user_id=request.user_id).limit(3).all()
            learner_context["recent_mistake_categories"] = [m.mistake_category.value for m in recent_mistakes]
        else:
            learner_context = {"overall_mastery": 68.0, "readiness_state": "DEVELOPING", "recent_mistake_categories": ["CALCULATION_ERROR"]}

        # 2. Execute Hybrid Retrieval with metadata filters
        dense_results = self.retriever.search(
            query=request.user_query,
            subject_code=request.subject_code,
            topic_code=request.topic_code,
            selected_doc_ids=request.selected_document_ids,
            limit=request.top_k,
            in_memory_chunks=in_memory_chunks
        )

        sparse_results = self.retriever.search(
            query=request.user_query,
            subject_code=request.subject_code,
            topic_code=request.topic_code,
            selected_doc_ids=request.selected_document_ids,
            limit=request.top_k,
            in_memory_chunks=in_memory_chunks
        )

        # 3. Apply Reciprocal Rank Fusion (RRF)
        reranked_results = apply_reciprocal_rank_fusion(dense_results, sparse_results)
        top_results = reranked_results[:request.top_k]

        # 4. Context Assembly & Source Citation
        assembled_context, attributions = assemble_rag_context_with_sources(top_results)

        # 5. Adapt prompt based on intent
        adapted_prompt = f"Intent: {request.query_intent}\nLearner Profile: Mastery {learner_context.get('overall_mastery')}%, Weak Category: {learner_context.get('recent_mistake_categories')}\n\n{assembled_context}"

        return {
            "user_id": request.user_id,
            "intent": request.query_intent,
            "assembled_context": assembled_context,
            "adapted_prompt": adapted_prompt,
            "sources": [a.model_dump() for a in attributions],
            "results_count": len(top_results),
            "learner_context": learner_context
        }
