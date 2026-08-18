import pytest
from backend.app.services.ai_agent.hermes_memory import HermesMemoryStore
from backend.app.services.ai_agent.hermes_engine import HermesAgentEngine
from backend.app.services.ai_agent.hermes_tools import RiskTier

def test_episodic_memory_log_and_query():
    store = HermesMemoryStore()
    store.log_action(
        tool_name="open_app",
        parameters={"app_name": "Settings"},
        result={"status": "SUCCESS"},
        risk_tier="LOW",
        user_confirmed=False
    )
    store.log_action(
        tool_name="perform_tap",
        parameters={"target_text": "Network & internet", "x": 148, "y": 218},
        result={"status": "SUCCESS"},
        risk_tier="MEDIUM",
        user_confirmed=True
    )

    recent = store.get_recent_actions(5)
    assert len(recent) == 2
    assert recent[0]["tool_name"] == "open_app"
    assert recent[1]["tool_name"] == "perform_tap"
    assert recent[1]["user_confirmed"] is True

    query_results = store.query_actions("tap")
    assert len(query_results) == 1
    assert query_results[0]["tool_name"] == "perform_tap"

def test_engine_episodic_query_turn():
    engine = HermesAgentEngine()
    engine.memory.log_action(
        tool_name="open_app",
        parameters={"app_name": "Settings"},
        result={"status": "SUCCESS"},
        risk_tier="LOW",
        user_confirmed=False
    )

    turn = engine.process_turn("What actions did you perform earlier?")
    assert "open_app" in turn["response"]
    assert turn["tool_call"] is None

def test_memory_cannot_loosen_mutating_confirmation_invariant():
    """
    CRITICAL INVARIANT:
    Even with frequent actions logged in memory, mutating tools
    MUST always require affirmative user confirmation.
    """
    engine = HermesAgentEngine()
    # Log 100 prior confirmed WhatsApp messages in episodic memory
    for _ in range(100):
        engine.memory.log_action(
            tool_name="send_message",
            parameters={"recipient": "Mom", "message_body": "Hello"},
            result={"status": "SUCCESS"},
            risk_tier="HIGH",
            user_confirmed=True
        )

    # Now request sending a message
    result = engine.process_turn("send a message on WhatsApp to Mom saying I am heading home")
    assert result["tool_call"] is not None
    assert result["tool_call"]["tool_name"] == "send_message"
    assert result["tool_call"]["risk_tier"] == RiskTier.HIGH.value
    # MUST STILL REQUIRE CONFIRMATION
    assert result["tool_call"]["requires_confirmation"] is True
