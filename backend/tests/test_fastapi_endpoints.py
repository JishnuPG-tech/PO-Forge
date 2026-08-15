import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_root_health_check_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert "POForge" in data["app_name"]

def test_auth_login_and_me_endpoint():
    # Login
    login_res = client.post("/api/v1/auth/login", json={"email": "student@poforge.ai", "password": "password123"})
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Me profile
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    profile = me_res.json()
    assert profile["email"] == "student@poforge.ai"
    assert profile["target_exam_days_left"] == 43

def test_questions_search_endpoint():
    res = client.get("/api/v1/questions/search?subject_code=QUANT&limit=10")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert data[0]["subject_code"] == "QUANT"

def test_daily_mission_start_endpoint():
    res = client.post("/api/v1/missions/start")
    assert res.status_code == 200
    data = res.json()
    assert "mission_id" in data
    assert len(data["sections"]) >= 1

def test_analytics_performance_endpoint():
    res = client.get("/api/v1/analytics/performance")
    assert res.status_code == 200
    data = res.json()
    assert data["readiness_state"] == "COMPETITIVE"
    assert "subject_mastery" in data

if __name__ == "__main__":
    pytest.main(["-v", __file__])
