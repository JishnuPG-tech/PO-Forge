import json
import time
from typing import Any, Dict, List, Optional

class HermesMemoryStore:
    def __init__(self):
        self._action_log: List[Dict[str, Any]] = []
        self._user_profile: Dict[str, Any] = {
            "name": "User",
            "frequent_apps": ["Settings", "Messages", "WhatsApp", "Camera"],
            "frequent_contacts": ["Alex", "Mom", "Work"],
            "preferences": {
                "dark_mode": True,
                "confirm_medium_risk": True,
                "confirm_high_risk": True,
            }
        }

    def log_action(
        self,
        tool_name: str,
        parameters: Dict[str, Any],
        result: Any,
        risk_tier: str,
        user_confirmed: bool = False
    ) -> Dict[str, Any]:
        """Record an episodic device action event with timestamp and confirmation metadata."""
        entry = {
            "timestamp": time.time(),
            "tool_name": tool_name,
            "parameters": parameters,
            "result": result,
            "risk_tier": risk_tier,
            "user_confirmed": user_confirmed,
        }
        self._action_log.append(entry)
        return entry

    def get_recent_actions(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Retrieve recent episodic actions in chronological order."""
        return self._action_log[-limit:]

    def query_actions(self, query: str) -> List[Dict[str, Any]]:
        """Search action logs for relevant tool calls or app names."""
        q_lower = query.lower().strip()
        matches = []
        for entry in reversed(self._action_log):
            tool = entry.get("tool_name", "").lower()
            params_str = str(entry.get("parameters", "")).lower()
            if q_lower in tool or q_lower in params_str or "earlier" in q_lower or "history" in q_lower or "what did" in q_lower or "actions" in q_lower:
                matches.append(entry)
        return matches[:10]

    def get_user_profile(self) -> Dict[str, Any]:
        """Retrieve the semantic user profile."""
        return self._user_profile

    def update_user_profile(self, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update user preferences or profile metadata."""
        self._user_profile.update(updates)
        return self._user_profile

    def format_memory_summary(self) -> str:
        """Synthesize recent episodic events into a compact prompt string."""
        if not self._action_log:
            return "No previous actions in this session."
        
        lines = []
        for act in self.get_recent_actions(3):
            lines.append(f"- Executed `{act['tool_name']}` (Risk: {act['risk_tier']}, Confirmed: {act['user_confirmed']})")
        return "\n".join(lines)
