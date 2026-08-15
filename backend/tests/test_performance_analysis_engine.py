import pytest
from backend.app.services.performance_engine import (
    create_attempt_record, classify_attempt_mistake, DetailedMistakeCategory,
    compute_subject_performance, extract_strongest_and_weakest_topics,
    build_incorrect_question_diagnostic
)

def test_attempt_recorder_and_mistake_classification():
    # 1. Fast incorrect response (< 15s) -> CARELESS_ERROR
    att1 = create_attempt_record(
        user_id="USER_001",
        question_id="Q_101",
        subject_code="QUANT",
        topic_code="SIMPLIFICATION",
        correct_option_index=0,
        selected_option_index=1,  # Wrong
        response_time_ms=12000
    )
    assert att1.is_correct is False
    assert att1.mistake_category == DetailedMistakeCategory.CARELESS_ERROR

    # 2. Slow incorrect response (> 90s) -> TIME_PRESSURE
    att2 = create_attempt_record(
        user_id="USER_001",
        question_id="Q_102",
        subject_code="QUANT",
        topic_code="SIMPLIFICATION",
        correct_option_index=0,
        selected_option_index=1,  # Wrong
        response_time_ms=95000
    )
    assert att2.mistake_category == DetailedMistakeCategory.TIME_PRESSURE

    # 3. Correct response -> mistake_category is None
    att3 = create_attempt_record(
        user_id="USER_001",
        question_id="Q_103",
        subject_code="QUANT",
        topic_code="SIMPLIFICATION",
        correct_option_index=0,
        selected_option_index=0,  # Correct
        response_time_ms=30000
    )
    assert att3.is_correct is True
    assert att3.mistake_category is None

def test_subject_performance_calculation():
    attempts = [
        create_attempt_record("U1", "Q1", "QUANT", "SIMPLIFICATION", 0, 0, 30000, "MEDIUM"), # Correct (+1.0)
        create_attempt_record("U1", "Q2", "QUANT", "SIMPLIFICATION", 0, 1, 40000, "MEDIUM"), # Incorrect (-0.25)
        create_attempt_record("U1", "Q3", "QUANT", "NUMBER_SERIES", 0, 0, 20000, "EASY"),     # Correct (+1.0)
    ]

    summary = compute_subject_performance(attempts, "QUANT", "Quantitative Aptitude")
    assert summary.total_questions == 3
    assert summary.correct_count == 2
    assert summary.incorrect_count == 1
    assert summary.total_score == 1.75 # 2.0 - 0.25 = 1.75
    assert summary.accuracy_percentage == 66.67 # 2/3 * 100

def test_strongest_and_weakest_topics_extraction():
    attempts = [
        create_attempt_record("U1", "Q1", "QUANT", "TOPIC_STRONG", 0, 0, 20000),
        create_attempt_record("U1", "Q2", "QUANT", "TOPIC_STRONG", 0, 0, 20000),
        create_attempt_record("U1", "Q3", "QUANT", "TOPIC_WEAK", 0, 1, 20000),
    ]

    summary = compute_subject_performance(attempts, "QUANT", "Quantitative Aptitude")
    strongest, weakest = extract_strongest_and_weakest_topics([summary])

    assert len(strongest) >= 1
    assert strongest[0]["topic_code"] == "TOPIC_STRONG"
    assert strongest[0]["accuracy"] == 100.0

    assert len(weakest) >= 1
    assert weakest[0]["topic_code"] == "TOPIC_WEAK"
    assert weakest[0]["accuracy"] == 0.0

def test_incorrect_question_diagnostic_explanation():
    attempt = create_attempt_record(
        user_id="U1",
        question_id="Q_505",
        subject_code="QUANT",
        topic_code="COMPOUND_INTEREST",
        correct_option_index=1, # (B) 10%
        selected_option_index=0, # (A) 5%
        response_time_ms=45000
    )

    question_data = {
        "text": "Find the interest rate if principal doubles in 10 years at simple interest.",
        "options": ["(A) 5%", "(B) 10%", "(C) 15%", "(D) 20%", "(E) 25%"],
        "explanation": "P doubles in 10 yrs => SI = P. Formula P = (P * R * 10)/100 => R = 10%.",
        "shortcut": "Rate = 100 / Years = 100 / 10 = 10%.",
        "common_trap": "Don't confuse simple interest with compound interest formulas."
    }

    diag = build_incorrect_question_diagnostic(attempt, question_data)

    assert diag.question_id == "Q_505"
    assert diag.user_selected_option_text == "(A) 5%"
    assert diag.correct_option_text == "(B) 10%"
    assert "(A) 5%" in diag.why_user_answer_was_wrong
    assert "Rate = 100 / Years" in diag.shortcut_tip
    assert "Don't confuse simple interest" in diag.common_trap_warning

if __name__ == "__main__":
    pytest.main(["-v", __file__])
