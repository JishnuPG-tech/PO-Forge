import pytest
from backend.app.services.ai_agent.hermes_tools import HermesToolRegistry, RiskTier
from backend.app.services.ai_agent.hermes_engine import HermesAgentEngine

def test_navigate_system_tool_definition():
    registry = HermesToolRegistry()
    tool = registry.get_tool("navigate_system")
    assert tool is not None
    assert tool.risk_tier == RiskTier.LOW
    assert tool.requires_confirmation is False
    assert "action" in tool.parameters["properties"]

def test_dispatch_intent_tool_definition():
    registry = HermesToolRegistry()
    tool = registry.get_tool("dispatch_intent")
    assert tool is not None
    assert tool.risk_tier == RiskTier.LOW
    assert tool.requires_confirmation is False
    assert "action" in tool.parameters["properties"]

def test_engine_routes_system_navigation_and_intents():
    engine = HermesAgentEngine()
    
    # 1. Go home
    res_home = engine.process_turn("Go home")
    assert res_home["tool_call"] is not None
    assert res_home["tool_call"]["tool_name"] == "navigate_system"
    assert res_home["tool_call"]["parameters"]["action"] == "home"
    assert res_home["tool_call"]["requires_confirmation"] is False

    # 2. Show recents
    res_recents = engine.process_turn("Show recents app switcher")
    assert res_recents["tool_call"] is not None
    assert res_recents["tool_call"]["tool_name"] == "navigate_system"
    assert res_recents["tool_call"]["parameters"]["action"] == "recents"

    # 3. Open URL
    res_url = engine.process_turn("Open URL github.com/poforge")
    assert res_url["tool_call"] is not None
    assert res_url["tool_call"]["tool_name"] == "dispatch_intent"
    assert res_url["tool_call"]["parameters"]["action"] == "view_url"
    assert "github.com/poforge" in res_url["tool_call"]["parameters"]["uri"]
