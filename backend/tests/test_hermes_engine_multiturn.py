import pytest
from backend.app.services.ai_agent.hermes_engine import HermesAgentEngine
from backend.app.services.ai_agent.hermes_tools import RiskTier

def test_hermes_engine_open_app_chain():
    engine = HermesAgentEngine()
    result = engine.process_turn("Open Settings")
    assert result["tool_call"] is not None
    assert result["tool_call"]["tool_name"] == "open_app"
    assert result["tool_call"]["parameters"]["app_name"] == "settings"
    assert result["is_chained"] is True
    assert result["next_step"] == "read_screen_content"

def test_hermes_engine_read_screen():
    engine = HermesAgentEngine()
    result = engine.process_turn("What's on my screen?")
    assert result["tool_call"] is not None
    assert result["tool_call"]["tool_name"] == "read_screen_content"
    assert result["tool_call"]["risk_tier"] == RiskTier.LOW.value
    assert result["tool_call"]["requires_confirmation"] is False

def test_hermes_engine_grounded_tap():
    engine = HermesAgentEngine()
    screen_elements = [
        {
            "text": "Network & internet",
            "class_name": "android.widget.TextView",
            "bounds": {"left": 84, "top": 207, "right": 213, "bottom": 229, "center_x": 148, "center_y": 218},
        },
        {
            "text": "Connected devices",
            "class_name": "android.widget.TextView",
            "bounds": {"left": 84, "top": 263, "right": 208, "bottom": 285, "center_x": 146, "center_y": 274},
        }
    ]
    result = engine.process_turn("tap Network & internet", screen_elements=screen_elements)
    assert result["tool_call"] is not None
    assert result["tool_call"]["tool_name"] == "perform_tap"
    assert result["tool_call"]["risk_tier"] == RiskTier.MEDIUM.value
    assert result["tool_call"]["requires_confirmation"] is True
    assert result["tool_call"]["parameters"]["x"] == 148
    assert result["tool_call"]["parameters"]["y"] == 218
    assert result["tool_call"]["parameters"]["bounds"] == "[84, 207][213, 229]"

def test_hermes_engine_type_text():
    engine = HermesAgentEngine()
    result = engine.process_turn("type hello hermes")
    assert result["tool_call"] is not None
    assert result["tool_call"]["tool_name"] == "enter_text"
    assert result["tool_call"]["risk_tier"] == RiskTier.MEDIUM.value
    assert result["tool_call"]["requires_confirmation"] is True
    assert result["tool_call"]["parameters"]["text"] == "hello hermes"

def test_hermes_engine_send_message():
    engine = HermesAgentEngine()
    result = engine.process_turn("send a message on WhatsApp to Mom saying I am heading home")
    assert result["tool_call"] is not None
    assert result["tool_call"]["tool_name"] == "send_message"
    assert result["tool_call"]["risk_tier"] == RiskTier.HIGH.value
    assert result["tool_call"]["requires_confirmation"] is True
