import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from backend.app.services.learner_engine.schemas import RecommendationExplanation, RecommendationReasonType

class ExplainableAuditEngine:

    def __init__(self):
        self._audit_log: List[RecommendationExplanation] = []

    def log_recommendation(
        self,
        target_type: str,
        target_id: str,
        reason: str,
        reason_type: RecommendationReasonType,
        evidence: Dict[str, Any],
        affected_topic_code: str,
        previous_state: str,
        new_state: str
    ) -> RecommendationExplanation:
        
        rec = RecommendationExplanation(
            recommendation_id=f"REC_{uuid.uuid4().hex[:8]}",
            target_type=target_type,
            target_id=target_id,
            reason=reason,
            reason_type=reason_type,
            evidence=evidence,
            affected_topic_code=affected_topic_code,
            previous_state=previous_state,
            new_state=new_state,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        self._audit_log.append(rec)
        return rec

    def explain_question_selection(self, question_id: str, topic_code: str, reason_type: RecommendationReasonType, evidence: Dict[str, Any]) -> str:
        if reason_type == RecommendationReasonType.SPACED_REVISION_DUE:
            days_due = evidence.get("days_overdue", 1.0)
            return f"Question {question_id} was selected for revision because your Spaced Repetition interval for topic '{topic_code}' matured {days_due} days ago. Reviewing this now protects against memory decay."
        elif reason_type == RecommendationReasonType.WEAK_TOPIC_RECOVERY:
            acc = evidence.get("topic_accuracy", 45.0)
            return f"Question {question_id} was selected because topic '{topic_code}' has accuracy {acc}% (below 60% weak threshold). Target practice is scheduled to rebuild foundation."
        elif reason_type == RecommendationReasonType.RECURRING_MISTAKE_CORRECTION:
            cat = evidence.get("mistake_category", "CALCULATION_ERROR")
            return f"Question {question_id} was selected because you recently made 2+ '{cat}' mistakes on '{topic_code}'. Focused correction reinforces accuracy."
        else:
            return f"Question {question_id} was selected as part of your balanced Daily Mission allocation for active topic '{topic_code}'."

    def explain_topic_prioritization(self, topic_code: str, priority_score: float, evidence: Dict[str, Any]) -> str:
        mastery = evidence.get("mastery_percentage", 50.0)
        due_count = evidence.get("due_revisions_count", 0)
        return f"Topic '{topic_code}' was prioritized with Priority Score {priority_score:.1f} because its current mastery is {mastery}% and it has {due_count} due revision items needing attention."

    def explain_weak_topic_status(self, topic_code: str, accuracy_percentage: float, mistake_count: int) -> str:
        return f"Topic '{topic_code}' was marked WEAK because your recent accuracy is {accuracy_percentage:.1f}% (below the 60% benchmark threshold) and {mistake_count} mistake events were recorded."
