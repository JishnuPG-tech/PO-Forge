from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.app.services.ai_agent.hermes_engine import HermesAgentEngine
from backend.app.services.ai_agent.hermes_tools import HermesToolRegistry
from backend.app.services.ai_agent.hermes_skills import HermesSkillRegistry

router = APIRouter(prefix="/api/v1/hermes", tags=["Hermes Device Agent"])
engine = HermesAgentEngine()
tool_registry = HermesToolRegistry()
skill_registry = HermesSkillRegistry()

class HermesChatRequest(BaseModel):
    message: str
    screen_elements: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    history: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    recent_actions: Optional[List[Dict[str, Any]]] = Field(default_factory=list)

class HermesChatResponse(BaseModel):
    response: str
    tool_call: Optional[Dict[str, Any]] = None
    is_chained: bool = False
    next_step: Optional[str] = None

@router.post("/chat", response_model=HermesChatResponse)
async def chat_with_hermes(request: HermesChatRequest):
    """
    Process multi-turn chat input with Hermes, analyzing intent, grounding in
    on-device screen elements, utilizing episodic memory, and emitting device action tool calls.
    """
    result = engine.process_turn(
        user_message=request.message,
        screen_elements=request.screen_elements,
        history=request.history,
        recent_actions=request.recent_actions,
    )
    return HermesChatResponse(**result)

@router.get("/tools")
async def get_hermes_tools():
    """
    Retrieve all registered Hermes device control tools and their risk tiers.
    """
    return {
        "tools": tool_registry.get_tool_definitions(),
    }

@router.get("/skills")
async def get_hermes_skills():
    """
    Retrieve all registered Hermes high-level skills with their parameter schemas and risk tiers.
    """
    return {
        "skills": skill_registry.list_skills(),
    }
