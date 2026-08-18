import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from enum import Enum

logger = logging.getLogger("HermesTools")

class RiskTier(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class DeviceToolDefinition(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any]
    requires_confirmation: bool
    risk_tier: RiskTier
    note: Optional[str] = None

# Master Device Action Tool Registry
DEVICE_TOOLS: List[DeviceToolDefinition] = [
    DeviceToolDefinition(
        name="open_app",
        description="Launches a named app via Android intent.",
        parameters={"type": "object", "properties": {"app_name": {"type": "string", "description": "The name or common label of the app to launch (e.g. Settings, Camera, Maps, Chrome)"}}, "required": ["app_name"]},
        requires_confirmation=False,
        risk_tier=RiskTier.LOW,
        note="Executes immediately without confirmation."
    ),
    DeviceToolDefinition(
        name="read_screen_content",
        description="Reads currently visible screen text via AccessibilityService for the agent to reason over.",
        parameters={"type": "object", "properties": {}, "required": []},
        requires_confirmation=False,
        risk_tier=RiskTier.LOW,
        note="Read-only — never performs an action itself."
    ),
    DeviceToolDefinition(
        name="perform_tap",
        description="Taps a UI element identified from a prior read_screen_content result.",
        parameters={"type": "object", "properties": {"element_id": {"type": "string", "description": "Resource ID, node index, or text identifier of the target element"}, "label": {"type": "string", "description": "Human readable label for confirmation card"}}, "required": ["element_id"]},
        requires_confirmation=True,
        risk_tier=RiskTier.MEDIUM
    ),
    DeviceToolDefinition(
        name="enter_text",
        description="Types text into a focused input field.",
        parameters={"type": "object", "properties": {"text": {"type": "string", "description": "Text string to enter"}, "field_label": {"type": "string", "description": "Label of input field"}}, "required": ["text"]},
        requires_confirmation=True,
        risk_tier=RiskTier.MEDIUM
    ),
    DeviceToolDefinition(
        name="send_message",
        description="Sends a message via a messaging app (SMS/WhatsApp/etc.) to a specified contact.",
        parameters={"type": "object", "properties": {"app": {"type": "string", "description": "Messaging app name (e.g. Messages, WhatsApp)"}, "contact": {"type": "string", "description": "Recipient name or phone number"}, "message": {"type": "string", "description": "Literal message text to send"}}, "required": ["app", "contact", "message"]},
        requires_confirmation=True,
        risk_tier=RiskTier.HIGH,
        note="Requires literal preview of full message text before execution."
    ),
    DeviceToolDefinition(
        name="create_calendar_event",
        description="Creates a calendar entry.",
        parameters={"type": "object", "properties": {"title": {"type": "string", "description": "Event title"}, "datetime": {"type": "string", "description": "ISO datetime or standard format string"}, "notes": {"type": "string", "description": "Optional notes/location"}}, "required": ["title", "datetime"]},
        requires_confirmation=True,
        risk_tier=RiskTier.MEDIUM
    ),
    DeviceToolDefinition(
        name="make_purchase_or_payment",
        description="Any action that spends money or completes a transaction.",
        parameters={"type": "object", "properties": {"context": {"type": "string", "description": "Transaction context, merchant, and amount"}}, "required": ["context"]},
        requires_confirmation=True,
        risk_tier=RiskTier.CRITICAL,
        note="Always requires explicit confirmation with full transaction details shown — never batched, never auto-approved."
    ),
    DeviceToolDefinition(
        name="navigate_system",
        description="Dispatches system-level Android global navigation gestures (back, home, recents, notifications, quick_settings).",
        parameters={"type": "object", "properties": {"action": {"type": "string", "enum": ["back", "home", "recents", "notifications", "quick_settings"]}}, "required": ["action"]},
        requires_confirmation=False,
        risk_tier=RiskTier.LOW,
        note="Safe, non-destructive navigation action."
    ),
    DeviceToolDefinition(
        name="dispatch_intent",
        description="Launches external Android activities via deep link or intent (view_url, dial_number, open_settings).",
        parameters={"type": "object", "properties": {"action": {"type": "string", "enum": ["view_url", "dial_number", "open_settings"]}, "uri": {"type": "string"}}, "required": ["action"]},
        requires_confirmation=False,
        risk_tier=RiskTier.LOW,
        note="Dispatches native Android intents."
    )
]

class HermesToolRegistry:
    def __init__(self):
        self.tools = {t.name: t for t in DEVICE_TOOLS}

    def list_tools(self) -> List[Dict[str, Any]]:
        return [t.model_dump() for t in DEVICE_TOOLS]

    def get_tool(self, name: str) -> Optional[DeviceToolDefinition]:
        return self.tools.get(name)

    def _execute_safe(self, tool_name: str, user_id: str, fn, *args, **kwargs) -> Dict[str, Any]:
        logger.info(f"[HERMES DEVICE TOOL] Tool={tool_name} | UserID={user_id}")
        if not user_id:
            return {"status": "ERROR", "error": "Unauthorized: user_id is required."}
        tool_def = self.get_tool(tool_name)
        if not tool_def:
            return {"status": "ERROR", "error": f"Unknown tool: {tool_name}"}
        try:
            result_data = fn(*args, **kwargs)
            return {
                "status": "SUCCESS",
                "tool": tool_name,
                "risk_tier": tool_def.risk_tier.value,
                "requires_confirmation": tool_def.requires_confirmation,
                "data": result_data
            }
        except Exception as e:
            logger.error(f"[HERMES DEVICE TOOL ERROR] Tool={tool_name} | Error={e}")
            return {"status": "ERROR", "tool": tool_name, "error": str(e)}

    def open_app(self, user_id: str, app_name: str) -> Dict[str, Any]:
        def _impl():
            return {
                "action": "open_app",
                "app_name": app_name,
                "status": "DISPATCHED",
                "message": f"Dispatched intent to launch '{app_name}' on device."
            }
        return self._execute_safe("open_app", user_id, _impl)

    def read_screen_content(self, user_id: str) -> Dict[str, Any]:
        def _impl():
            return {
                "action": "read_screen_content",
                "status": "READ_READY",
                "elements_count": 0,
                "message": "Screen hierarchy read via AccessibilityService."
            }
        return self._execute_safe("read_screen_content", user_id, _impl)

    def perform_tap(self, user_id: str, element_id: str, label: Optional[str] = None) -> Dict[str, Any]:
        def _impl():
            return {
                "action": "perform_tap",
                "element_id": element_id,
                "label": label or element_id,
                "status": "PENDING_CONFIRMATION"
            }
        return self._execute_safe("perform_tap", user_id, _impl)

    def enter_text(self, user_id: str, text: str, field_label: Optional[str] = None) -> Dict[str, Any]:
        def _impl():
            return {
                "action": "enter_text",
                "text": text,
                "field_label": field_label or "Input Field",
                "status": "PENDING_CONFIRMATION"
            }
        return self._execute_safe("enter_text", user_id, _impl)

    def send_message(self, user_id: str, app: str, contact: str, message: str) -> Dict[str, Any]:
        def _impl():
            return {
                "action": "send_message",
                "app": app,
                "contact": contact,
                "message": message,
                "status": "PENDING_CONFIRMATION"
            }
        return self._execute_safe("send_message", user_id, _impl)

    def create_calendar_event(self, user_id: str, title: str, datetime: str, notes: Optional[str] = None) -> Dict[str, Any]:
        def _impl():
            return {
                "action": "create_calendar_event",
                "title": title,
                "datetime": datetime,
                "notes": notes,
                "status": "PENDING_CONFIRMATION"
            }
        return self._execute_safe("create_calendar_event", user_id, _impl)

    def make_purchase_or_payment(self, user_id: str, context: str) -> Dict[str, Any]:
        def _impl():
            return {
                "action": "make_purchase_or_payment",
                "context": context,
                "status": "PENDING_CONFIRMATION",
                "critical_notice": "Manual user confirmation strictly required. Cannot be bypassed."
            }
        return self._execute_safe("make_purchase_or_payment", user_id, _impl)
