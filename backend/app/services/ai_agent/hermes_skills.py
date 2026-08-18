from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from backend.app.services.ai_agent.hermes_tools import RiskTier

@dataclass
class HermesSkill:
    id: str
    name: str
    description: str
    risk_tier: RiskTier
    requires_confirmation: bool
    parameters: Dict[str, Any]
    required_tools: List[str]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "risk_tier": self.risk_tier.value,
            "requires_confirmation": self.requires_confirmation,
            "parameters": self.parameters,
            "required_tools": self.required_tools,
        }

class HermesSkillRegistry:
    def __init__(self):
        self._skills: Dict[str, HermesSkill] = {}
        self._register_default_skills()

    def _register_default_skills(self):
        # 1. Summarize Active Screen (Read-Only)
        self.register_skill(
            HermesSkill(
                id="summarize_active_screen",
                name="Summarize Screen",
                description="Scans the active screen, extracts visible text & buttons, and generates an organized summary.",
                risk_tier=RiskTier.LOW,
                requires_confirmation=False,
                parameters={},
                required_tools=["read_screen_content"],
            )
        )

        # 2. Launch and Inspect App (Read-Only / Low Risk)
        self.register_skill(
            HermesSkill(
                id="launch_and_inspect_app",
                name="App Scanner",
                description="Opens a specified app and immediately scans its UI layout for interaction targets.",
                risk_tier=RiskTier.LOW,
                requires_confirmation=False,
                parameters={
                    "app_name": {"type": "string", "description": "Name of app to launch and inspect", "required": True}
                },
                required_tools=["open_app", "read_screen_content"],
            )
        )

        # 3. Schedule Device Reminder (Mutating / Medium Risk)
        self.register_skill(
            HermesSkill(
                id="schedule_device_reminder",
                name="New Reminder",
                description="Creates a reminder or calendar event with title and timing.",
                risk_tier=RiskTier.MEDIUM,
                requires_confirmation=True,
                parameters={
                    "title": {"type": "string", "description": "Title or task for the reminder", "required": True},
                    "time": {"type": "string", "description": "Time or date for the reminder", "required": True},
                },
                required_tools=["create_calendar_event"],
            )
        )

        # 4. Compose Contact Message (Mutating / High Risk)
        self.register_skill(
            HermesSkill(
                id="compose_contact_message",
                name="Message Contact",
                description="Composes and stages an outgoing message to a designated contact.",
                risk_tier=RiskTier.HIGH,
                requires_confirmation=True,
                parameters={
                    "recipient": {"type": "string", "description": "Contact name or phone number", "required": True},
                    "message": {"type": "string", "description": "Message content", "required": True},
                },
                required_tools=["send_message"],
            )
        )

    def register_skill(self, skill: HermesSkill):
        self._skills[skill.id] = skill

    def get_skill(self, skill_id: str) -> Optional[HermesSkill]:
        return self._skills.get(skill_id)

    def list_skills(self) -> List[Dict[str, Any]]:
        return [skill.to_dict() for skill in self._skills.values()]
