import pytest
from backend.app.services.mission_engine import (
    DailyMissionLifecycleManager, MissionStatus, generate_daily_mission_blueprint, generate_post_mission_report
)

def create_sample_published_questions():
    return [
        {"question_id": "Q_QUANT_01", "subject_code": "QUANT", "topic_code": "SIMPLIFICATION", "text": "What is 25 * 4?", "options": ["(A) 100", "(B) 120", "(C) 140", "(D) 160"], "correct_option_index": 0},
        {"question_id": "Q_REASONING_01", "subject_code": "REASONING", "topic_code": "SYLLOGISM", "text": "All A are B. Some B are C.", "options": ["(A) Conclusion I", "(B) Conclusion II"], "correct_option_index": 0},
        {"question_id": "Q_ENGLISH_01", "subject_code": "ENGLISH", "topic_code": "READING_COMPREHENSION", "text": "Select synonym for resilient.", "options": ["(A) Tough", "(B) Weak"], "correct_option_index": 0},
        {"question_id": "Q_GA_01", "subject_code": "GA_BANKING", "topic_code": "BANKING_AWARENESS", "text": "What is current Repo Rate?", "options": ["(A) 6.5%", "(B) 6.0%"], "correct_option_index": 0}
    ]

def test_daily_mission_sequence_and_eligibility():
    user_id = "STUDENT_MISSION_101"
    enabled_subjects = ["QUANT", "REASONING", "ENGLISH", "GA_BANKING"]
    
    enabled_topics_map = {
        "QUANT": [{"code": "SIMPLIFICATION", "state": "AVAILABLE"}, {"code": "LOCKED_TOPIC", "state": "LOCKED"}],
        "REASONING": [{"code": "SYLLOGISM", "state": "AVAILABLE"}],
        "ENGLISH": [{"code": "READING_COMPREHENSION", "state": "AVAILABLE"}],
        "GA_BANKING": [{"code": "BANKING_AWARENESS", "state": "AVAILABLE"}]
    }

    pool = create_sample_published_questions()
    
    sections, audits = generate_daily_mission_blueprint(
        user_id=user_id,
        enabled_subjects=enabled_subjects,
        enabled_topics_map=enabled_topics_map,
        due_revision_question_ids=[],
        published_questions_pool=pool,
        target_question_count=20
    )

    # 1. Verify sequence order: QUANT -> REASONING -> ENGLISH -> GA_BANKING
    subject_seq = [s.subject_code for s in sections]
    assert subject_seq == ["QUANT", "REASONING", "ENGLISH", "GA_BANKING"]

    # 2. Verify LOCKED topic was filtered out
    quant_sec = sections[0]
    for q in quant_sec.questions:
        assert q.topic_code != "LOCKED_TOPIC"

    # 3. Verify Auditable reason attached
    assert len(audits) == 4
    assert "Allocated" in audits[0].reason

def test_mission_lifecycle_start_pause_resume_submit():
    manager = DailyMissionLifecycleManager()
    user_id = "STUDENT_MISSION_202"
    enabled_subjects = ["QUANT", "REASONING"]
    enabled_topics_map = {"QUANT": [{"code": "SIMPLIFICATION", "state": "AVAILABLE"}], "REASONING": [{"code": "SYLLOGISM", "state": "AVAILABLE"}]}
    pool = create_sample_published_questions()

    # Step 1: Start Mission
    state = manager.start_daily_mission(
        user_id=user_id,
        enabled_subjects=enabled_subjects,
        enabled_topics_map=enabled_topics_map,
        due_revision_question_ids=[],
        published_questions_pool=pool,
        target_question_count=10
    )

    assert state.status == MissionStatus.IN_PROGRESS
    assert len(state.sections) == 2

    # Step 2: Submit Q1 (Correct option index 0)
    state, q1 = manager.submit_mission_question(
        state=state,
        section_index=0,
        question_index=0,
        selected_option_index=0,  # Correct
        is_skipped=False,
        response_time_ms=25000
    )

    assert q1.is_correct is True
    assert q1.response_time_ms == 25000
    assert state.completed_question_count == 1

    # Step 3: Pause Mission
    state = manager.pause_mission(state)
    assert state.status == MissionStatus.PAUSED

    # Step 4: Resume Mission
    state = manager.resume_mission(state)
    assert state.status == MissionStatus.IN_PROGRESS
    assert state.completed_question_count == 1  # Position retained

    # Step 5: Complete Mission
    state, report = manager.complete_mission(state)
    assert state.status == MissionStatus.COMPLETED
    assert report.total_questions == state.target_question_count
    assert len(report.next_day_recommendations) > 0

if __name__ == "__main__":
    pytest.main(["-v", __file__])
