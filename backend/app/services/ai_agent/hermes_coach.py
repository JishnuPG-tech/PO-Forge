from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
import re

from backend.app.services.ai_agent.omniroute_router import OmniRouteRouter, ModelTaskCategory, OmniRouteResponse
from backend.app.services.ai_agent.hermes_tools import HermesToolRegistry, RiskTier
from backend.app.services.ai_agent.prompt_defense import SYSTEM_INSTRUCTION_HEADER

class HermesAICoach:
    def __init__(self, db_session: Optional[Session] = None):
        self.db = db_session
        self.router = OmniRouteRouter()
        self.tools = HermesToolRegistry()

    def process_chat_request(
        self,
        user_id: str,
        user_message: str,
        session_id: Optional[str] = None,
        task_category: ModelTaskCategory = ModelTaskCategory.TUTORING,
        retrieved_context: str = ""
    ) -> Dict[str, Any]:
        system_prompt = SYSTEM_INSTRUCTION_HEADER
        if retrieved_context:
            system_prompt += f"\n\n<untrusted_retrieved_context>\n{retrieved_context}\n</untrusted_retrieved_context>"

        messages = [{"role": "user", "content": user_message}]
        executed_tool_calls: List[Dict[str, Any]] = []
        msg_lower = user_message.lower()

        # Deterministic Intent Matching for Device Actions
        if "open" in msg_lower and ("app" in msg_lower or "settings" in msg_lower or "camera" in msg_lower or "maps" in msg_lower or "chrome" in msg_lower or "youtube" in msg_lower):
            app_name = "Settings"
            for candidate in ["settings", "camera", "maps", "chrome", "youtube", "whatsapp", "messages", "calculator"]:
                if candidate in msg_lower:
                    app_name = candidate.capitalize()
                    break
            t_res = self.tools.open_app(user_id=user_id, app_name=app_name)
            executed_tool_calls.append({
                "tool_name": "open_app",
                "args": {"app_name": app_name},
                "result": t_res
            })
        elif "read screen" in msg_lower or "what's on my screen" in msg_lower or "what is on screen" in msg_lower:
            t_res = self.tools.read_screen_content(user_id=user_id)
            executed_tool_calls.append({
                "tool_name": "read_screen_content",
                "args": {},
                "result": t_res
            })
        elif "tap" in msg_lower or "click" in msg_lower:
            # Extract target element or button label
            target = "confirm_button"
            if "search" in msg_lower:
                target = "search_bar"
            elif "send" in msg_lower:
                target = "send_btn"
            t_res = self.tools.perform_tap(user_id=user_id, element_id=target, label=f"Tap '{target}'")
            executed_tool_calls.append({
                "tool_name": "perform_tap",
                "args": {"element_id": target, "label": f"Tap '{target}'"},
                "result": t_res
            })
        elif "type" in msg_lower or "enter text" in msg_lower:
            t_res = self.tools.enter_text(user_id=user_id, text=user_message, field_label="Text Input")
            executed_tool_calls.append({
                "tool_name": "enter_text",
                "args": {"text": user_message},
                "result": t_res
            })
        elif "send message" in msg_lower or "text " in msg_lower:
            contact = "Mom" if "mom" in msg_lower else "John"
            text_body = "Hello, I will be there soon."
            t_res = self.tools.send_message(user_id=user_id, app="Messages", contact=contact, message=text_body)
            executed_tool_calls.append({
                "tool_name": "send_message",
                "args": {"app": "Messages", "contact": contact, "message": text_body},
                "result": t_res
            })
        elif "calendar" in msg_lower or "schedule" in msg_lower or "remind" in msg_lower:
            t_res = self.tools.create_calendar_event(user_id=user_id, title="Meeting with Team", datetime="2026-08-19T15:00:00")
            executed_tool_calls.append({
                "tool_name": "create_calendar_event",
                "args": {"title": "Meeting with Team", "datetime": "2026-08-19T15:00:00"},
                "result": t_res
            })
        elif "pay" in msg_lower or "purchase" in msg_lower or "buy" in msg_lower or "transfer" in msg_lower:
            t_res = self.tools.make_purchase_or_payment(user_id=user_id, context=user_message)
            executed_tool_calls.append({
                "tool_name": "make_purchase_or_payment",
                "args": {"context": user_message},
                "result": t_res
            })

        # Route through OmniRoute
        omni_res: OmniRouteResponse = self.router.generate_completion(
            task=task_category,
            system_prompt=system_prompt,
            messages=messages
        )

        return {
            "session_id": session_id or f"SESS_{user_id[:8]}",
            "response": omni_res.content,
            "model_used": omni_res.model_used,
            "tool_calls": executed_tool_calls,
            "sources": [],
            "observability": {
                "latency_ms": omni_res.observability.latency_ms,
                "token_usage": omni_res.observability.token_usage,
                "status_code": 200
            }
        }
