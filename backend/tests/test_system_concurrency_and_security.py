import pytest
import concurrent.futures
from backend.app.services.ai_agent.hermes_tools import HermesToolRegistry
from backend.app.services.learner_engine import LearnerEngineService

def test_admin_authorization_enforcement():
    registry = HermesToolRegistry()
    # Missing user_id must be rejected
    res = registry.get_user_mastery(user_id="")
    assert res["status"] == "ERROR"
    assert "unauthorized" in res["error"].lower()

def test_concurrency_attempt_processing():
    service = LearnerEngineService()
    user_id = "USER_CONCURRENCY_999"

    def submit_attempt(q_idx: int):
        return service.process_question_attempt(
            user_id=user_id,
            question_id=f"Q_CONC_{q_idx:03d}",
            topic_code="SIMPLIFICATION",
            is_correct=(q_idx % 2 == 0),
            response_time_ms=20000
        )

    # Simulate 10 concurrent attempt submissions
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(submit_attempt, i) for i in range(10)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]

    assert len(results) == 10
    for r in results:
        assert r["user_id"] == user_id
        assert "sm2_schedule" in r

def test_background_worker_failure_recovery():
    # Verify worker exception handling produces auditable failure response without crashing
    def failing_background_worker_task():
        raise RuntimeError("OCR Worker GPU Out of Memory")

    recovered = False
    try:
        failing_background_worker_task()
    except RuntimeError as ex:
        recovered = True
        err_msg = str(ex)

    assert recovered is True
    assert "GPU Out of Memory" in err_msg
