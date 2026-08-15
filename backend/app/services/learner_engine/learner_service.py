import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.app.services.learner_engine.mastery_calculator import (
    calculate_deterministic_mastery, adapt_target_difficulty, determine_readiness_state
)
from backend.app.services.learner_engine.spaced_repetition import calculate_sm2_interval
from backend.app.services.learner_engine.topic_state_machine import is_topic_eligible_for_training, transition_topic_state
from backend.app.services.learner_engine.explainable_audit import ExplainableAuditEngine
from backend.app.services.learner_engine.schemas import RecommendationReasonType
from backend.app.models.enums import TopicState, MistakeCategory, ExamReadinessState
from backend.app.models.learning import UserMastery, TopicMastery, UserTopicState, RevisionItem, Mistake

logger = logging.getLogger("LearnerService")

class LearnerEngineService:

    def __init__(self, db_session: Optional[Session] = None):
        self.db = db_session
        self.audit = ExplainableAuditEngine()

    def process_question_attempt(
        self,
        user_id: str,
        question_id: str,
        topic_code: str,
        is_correct: bool,
        response_time_ms: int,
        selected_option_index: Optional[int] = None,
        confidence_level: str = "HIGH"
    ) -> Dict[str, Any]:
        """
        DETERMINISTIC LEARNER MODEL UPDATE PIPELINE:
        1. Calculate SM-2 quality grade (0 to 5)
        2. Update Spaced Repetition interval
        3. Recalculate Topic Mastery & Accuracy
        4. Evaluate Topic State Machine transitions
        5. Log explainable audit trail
        """
        response_sec = response_time_ms / 1000.0
        
        # 1. Map attempt result to SuperMemo quality grade (0..5)
        if is_correct:
            quality_grade = 5 if response_sec <= 45.0 else 4
        else:
            quality_grade = 1 if selected_option_index is not None else 0

        # 2. Update SuperMemo Spaced Repetition Schedule
        prev_interval, prev_ef, prev_reps, prev_lapses = 1.0, 2.5, 0, 0
        if self.db:
            rev_item = self.db.query(RevisionItem).filter_by(user_id=user_id, question_id=question_id).first()
            if rev_item:
                prev_interval = rev_item.interval_days
                prev_ef = rev_item.ease_factor
                prev_reps = rev_item.repetitions
                prev_lapses = rev_item.lapse_count

        sm2_state = calculate_sm2_interval(
            quality_grade=quality_grade,
            previous_interval_days=prev_interval,
            previous_ease_factor=prev_ef,
            previous_repetitions=prev_reps,
            previous_lapse_count=prev_lapses
        )

        # 3. Recalculate Topic Mastery
        new_mastery = calculate_deterministic_mastery(
            accuracy_percentage=100.0 if is_correct else 0.0,
            average_speed_seconds=response_sec
        )

        # 4. Evaluate Topic State Transition
        new_topic_state, state_reason = transition_topic_state(
            current_state=TopicState.AVAILABLE,
            mastery_percentage=new_mastery,
            accuracy_percentage=100.0 if is_correct else 0.0
        )

        # 5. Log audit trail
        reason_type = RecommendationReasonType.SPACED_REVISION_DUE if not is_correct else RecommendationReasonType.DAILY_MISSION_ALLOCATION
        audit_entry = self.audit.log_recommendation(
            target_type="QUESTION",
            target_id=question_id,
            reason=f"Attempt recorded (Correct={is_correct}, Time={response_sec:.1f}s). {state_reason}",
            reason_type=reason_type,
            evidence={"is_correct": is_correct, "response_time_ms": response_time_ms, "quality_grade": quality_grade},
            affected_topic_code=topic_code,
            previous_state=TopicState.AVAILABLE.value,
            new_state=new_topic_state.value
        )

        return {
            "user_id": user_id,
            "question_id": question_id,
            "is_correct": is_correct,
            "sm2_schedule": sm2_state.model_dump(),
            "new_mastery_percentage": new_mastery,
            "topic_state": new_topic_state.value,
            "audit_trail": audit_entry.model_dump()
        }

    def filter_eligible_training_topics(self, user_id: str, candidate_topics: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        STRICT USER ELIGIBILITY GATE:
        Questions from LOCKED or NOT_LEARNED topics can NEVER enter training!
        """
        eligible = []
        for top in candidate_topics:
            state_val = TopicState(top.get("state", "AVAILABLE"))
            if is_topic_eligible_for_training(state_val):
                eligible.append(top)
        return eligible
