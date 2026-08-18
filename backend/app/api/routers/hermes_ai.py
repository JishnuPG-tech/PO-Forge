from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from backend.app.api.deps import get_current_user, UserTokenPayload
from backend.app.services.ai_agent.hermes_coach import HermesAICoach
from backend.app.services.ai_agent.hermes_tools import HermesToolRegistry
from backend.app.services.ai_agent.omniroute_router import ModelTaskCategory

router = APIRouter(prefix="/hermes", tags=["Hermes AI Agent"])

class HermesChatRequest(BaseModel):
    user_message: str
    task_category: str = "TUTORING"

class HermesChatResponse(BaseModel):
    response: str
    model_used: str
    tool_calls: List[Dict[str, Any]]
    sources: List[Dict[str, Any]]
    observability: Dict[str, Any]

@router.get("/tools")
def list_available_device_tools():
    """Returns the registered device action tools with risk tiers and confirmation requirements."""
    registry = HermesToolRegistry()
    return {"tools": registry.list_tools()}

@router.post("/chat", response_model=HermesChatResponse)
def chat_with_hermes_agent(
    req: HermesChatRequest,
    current_user: UserTokenPayload = Depends(get_current_user)
):
    coach = HermesAICoach()
    
    task_enum = ModelTaskCategory.TUTORING
    if req.task_category == "COMPLEX_REASONING":
        task_enum = ModelTaskCategory.COMPLEX_REASONING
    elif req.task_category == "CLASSIFICATION":
        task_enum = ModelTaskCategory.CLASSIFICATION

    res = coach.process_chat_request(
        user_id=current_user.user_id,
        user_message=req.user_message,
        task_category=task_enum
    )

    return HermesChatResponse(
        response=res["response"],
        model_used=res["model_used"],
        tool_calls=res.get("tool_calls", []),
        sources=res.get("sources", []),
        observability=res.get("observability", {})
    )
