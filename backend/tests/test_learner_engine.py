import pytest
from backend.app.services.learner_engine import (
    calculate_deterministic_mastery, adapt_target_difficulty, determine_readiness_state,
    calculate_sm2_interval, is_topic_eligible_for_training, transition_topic_state,
    ExplainableAuditEngine, LearnerEngineService, RecommendationReasonType
)
from backend.app.models.enums import TopicState

def test_deterministic_mastery_calculation():
    # 100% accuracy, 30s speed (fast <= 60s), 80% retention -> Mastery = (100*0.7) + (100*0.2) + (80*0.1) = 70 + 20 + 8 = 98.0%
    m1 = calculate_deterministic_mastery(accuracy_percentage=100.0, average_speed_seconds=30.0, retention_score=80.0)
    assert m1 == 98.0

    # 0% accuracy, 120s speed (ratio 2.0 -> speed factor 60), 50% retention -> Mastery = 0 + (60*0.2) + (50*0.1) = 12 + 5 = 17.0%
    m2 = calculate_deterministic_mastery(accuracy_percentage=0.0, average_speed_seconds=120.0, retention_score=50.0)
    assert m2 == 17.0

def test_supermemo_sm2_spaced_repetition_logic():
    # 1st successful attempt (Grade 5)
    sm1 = calculate_sm2_interval(quality_grade=5, previous_interval_days=1.0, previous_ease_factor=2.5, previous_repetitions=0)
    assert sm1.repetitions == 1
    assert sm1.interval_days == 1.0
    assert sm1.ease_factor >= 2.5

    # 2nd successful attempt (Grade 5)
    sm2 = calculate_sm2_interval(quality_grade=5, previous_interval_days=sm1.interval_days, previous_ease_factor=sm1.ease_factor, previous_repetitions=sm1.repetitions)
    assert sm2.repetitions == 2
    assert sm2.interval_days == 6.0

    # 3rd attempt failure (Grade 1 - Lapse)
    sm3 = calculate_sm2_interval(quality_grade=1, previous_interval_days=sm2.interval_days, previous_ease_factor=sm2.ease_factor, previous_repetitions=sm2.repetitions, previous_lapse_count=0)
    assert sm3.repetitions == 0
    assert sm3.lapse_count == 1
    assert sm3.interval_days == 1.0

def test_difficulty_adaptation():
    # High accuracy (4 out of 5 correct = 80%, 5 out of 5 = 100%) -> HARD
    diff_hard = adapt_target_difficulty([True, True, True, True, True])
    assert diff_hard == "HARD"

    # Low accuracy (1 out of 5 correct = 20%) -> EASY
    diff_easy = adapt_target_difficulty([False, False, False, True, False])
    assert diff_easy == "EASY"

    # Moderate accuracy (3 out of 5 = 60%) -> MEDIUM
    diff_med = adapt_target_difficulty([True, False, True, False, True])
    assert diff_med == "MEDIUM"

def test_strict_topic_eligibility_gate():
    assert is_topic_eligible_for_training(TopicState.LOCKED) is False
    assert is_topic_eligible_for_training(TopicState.NOT_LEARNED) is False
    
    assert is_topic_eligible_for_training(TopicState.LEARNING) is True
    assert is_topic_eligible_for_training(TopicState.AVAILABLE) is True
    assert is_topic_eligible_for_training(TopicState.NEEDS_REVISION) is True
    assert is_topic_eligible_for_training(TopicState.MASTERED) is True

def test_explainable_audit_engine():
    audit = ExplainableAuditEngine()
    
    rec = audit.log_recommendation(
        target_type="QUESTION",
        target_id="Q_1001",
        reason="Spaced repetition review is due after 6 days interval",
        reason_type=RecommendationReasonType.SPACED_REVISION_DUE,
        evidence={"days_overdue": 2.0},
        affected_topic_code="SIMPLIFICATION",
        previous_state=TopicState.NEEDS_REVISION.value,
        new_state=TopicState.AVAILABLE.value
    )

    assert rec.target_id == "Q_1001"
    assert rec.affected_topic_code == "SIMPLIFICATION"
    assert "REC_" in rec.recommendation_id

    # Test explanation generator
    explanation = audit.explain_question_selection(
        question_id="Q_1001",
        topic_code="SIMPLIFICATION",
        reason_type=RecommendationReasonType.SPACED_REVISION_DUE,
        evidence={"days_overdue": 2.0}
    )
    assert "Q_1001 was selected for revision" in explanation
    assert "2.0 days ago" in explanation

def test_learner_service_process_attempt():
    service = LearnerEngineService()
    res = service.process_question_attempt(
        user_id="STUDENT_777",
        question_id="Q_555",
        topic_code="NUMBER_SERIES",
        is_correct=True,
        response_time_ms=35000
    )

    assert res["user_id"] == "STUDENT_777"
    assert res["is_correct"] is True
    assert res["sm2_schedule"]["repetitions"] == 1
    assert "audit_trail" in res

if __name__ == "__main__":
    pytest.main(["-v", __file__])
