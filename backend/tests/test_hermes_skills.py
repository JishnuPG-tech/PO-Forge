import pytest
from backend.app.services.ai_agent.hermes_skills import HermesSkillRegistry, HermesSkill
from backend.app.services.ai_agent.hermes_engine import HermesAgentEngine
from backend.app.services.ai_agent.hermes_tools import RiskTier

def test_skills_registry_default_skills():
    registry = HermesSkillRegistry()
    skills = registry.list_skills()
    assert len(skills) >= 4
    skill_ids = [s["id"] for s in skills]
    assert "summarize_active_screen" in skill_ids
    assert "launch_and_inspect_app" in skill_ids
    assert "schedule_device_reminder" in skill_ids
    assert "compose_contact_message" in skill_ids

def test_skill_summarize_screen_with_elements():
    engine = HermesAgentEngine()
    screen_elements = [
        {"text": "Network & internet"},
        {"text": "Connected devices"},
        {"text": "Apps"},
    ]
    turn = engine.process_turn("summarize my screen", screen_elements=screen_elements)
    assert "Active Screen Summary:" in turn["response"]
    assert "Network & internet" in turn["response"]
    assert "Connected devices" in turn["response"]
    assert turn["tool_call"] is None

def test_mutating_skill_confirmation_invariant():
    """Mutating skills like reminder creation MUST enforce confirmation gates."""
    engine = HermesAgentEngine()
    turn = engine.process_turn("create reminder to call Mom at 5pm")
    assert turn["tool_call"] is not None
    assert turn["tool_call"]["tool_name"] == "create_calendar_event"
    assert turn["tool_call"]["risk_tier"] == RiskTier.MEDIUM.value
    assert turn["tool_call"]["requires_confirmation"] is True
