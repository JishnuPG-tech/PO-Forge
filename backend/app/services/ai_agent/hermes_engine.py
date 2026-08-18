import json
import logging
from typing import Any, Dict, List, Optional
from backend.app.services.ai_agent.hermes_tools import HermesToolRegistry, RiskTier
from backend.app.services.ai_agent.hermes_memory import HermesMemoryStore
from backend.app.services.ai_agent.hermes_skills import HermesSkillRegistry

logger = logging.getLogger("hermes.engine")

class HermesAgentEngine:
    def __init__(self):
        self.registry = HermesToolRegistry()
        self.memory = HermesMemoryStore()
        self.skills = HermesSkillRegistry()

    def process_turn(
        self,
        user_message: str,
        screen_elements: Optional[List[Dict[str, Any]]] = None,
        history: Optional[List[Dict[str, Any]]] = None,
        recent_actions: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Process a user input turn, analyzing intent, grounding in current screen state,
        retrieving episodic memory when asked, executing skills, and producing conversational response and/or tool call.
        """
        msg_lower = user_message.lower().strip()
        screen_elements = screen_elements or []
        history = history or []

        # Ingest recent actions from client into backend memory
        if recent_actions:
            for act in recent_actions:
                self.memory.log_action(
                    tool_name=act.get("tool_name", "unknown"),
                    parameters=act.get("parameters", {}),
                    result=act.get("result", {}),
                    risk_tier=act.get("risk_tier", "LOW"),
                    user_confirmed=act.get("user_confirmed", False),
                )

        # 0. Episodic Memory Query Intent
        if any(w in msg_lower for w in ["what did i ask you to do", "what actions did you perform", "action history", "what did you do", "previous actions"]):
            actions = self.memory.query_actions(user_message)
            if actions:
                summary_items = [f"- `{a['tool_name']}` (Params: {a['parameters']}, Confirmed: {a['user_confirmed']})" for a in actions[:5]]
                return {
                    "response": "Here are the recent device actions I recorded in episodic memory:\n" + "\n".join(summary_items),
                    "tool_call": None,
                    "is_chained": False,
                }
            else:
                return {
                    "response": "I checked episodic memory, but no previous actions have been logged in this session yet.",
                    "tool_call": None,
                    "is_chained": False,
                }

        # 1. Skill: Summarize Active Screen
        if "summarize" in msg_lower and "screen" in msg_lower:
            if screen_elements:
                element_texts = [e.get("text") or e.get("content_description") for e in screen_elements if (e.get("text") or e.get("content_description"))]
                summary = "Active Screen Summary:\n" + "\n".join([f"• {t}" for t in element_texts[:8]])
                return {
                    "response": summary,
                    "tool_call": None,
                    "is_chained": False,
                }
            else:
                tool_spec = self.registry.get_tool("read_screen_content")
                return {
                    "response": "Reading screen content to generate a complete summary...",
                    "tool_call": {
                        "tool_name": "read_screen_content",
                        "risk_tier": tool_spec.risk_tier.value,
                        "requires_confirmation": tool_spec.requires_confirmation,
                        "parameters": {},
                    },
                    "is_chained": False,
                }

        # 2. Skill: Reminder creation (mutating)
        if any(w in msg_lower for w in ["create reminder", "schedule reminder", "remind me", "set reminder", "new reminder"]):
            tool_spec = self.registry.get_tool("create_calendar_event")
            return {
                "response": "I prepared a reminder action. Please confirm the reminder details before it is saved:",
                "tool_call": {
                    "tool_name": "create_calendar_event",
                    "risk_tier": tool_spec.risk_tier.value,
                    "requires_confirmation": tool_spec.requires_confirmation,
                    "parameters": {
                        "title": user_message,
                        "time": "Today",
                    },
                },
                "is_chained": False,
            }

        # 1. Inspect screen intent
        if any(w in msg_lower for w in ["what's on my screen", "read screen", "inspect screen", "what is on screen", "screen content"]):
            tool_spec = self.registry.get_tool("read_screen_content")
            return {
                "response": "I am reading the active screen content to inspect all UI elements.",
                "tool_call": {
                    "tool_name": "read_screen_content",
                    "risk_tier": tool_spec.risk_tier.value,
                    "requires_confirmation": tool_spec.requires_confirmation,
                    "parameters": {},
                },
                "is_chained": False,
            }

        # 2. System Navigation Actions
        if any(w in msg_lower for w in ["go home", "press home", "home screen"]):
            tool_spec = self.registry.get_tool("navigate_system")
            return {
                "response": "Navigating to Home screen...",
                "tool_call": {
                    "tool_name": "navigate_system",
                    "risk_tier": tool_spec.risk_tier.value,
                    "requires_confirmation": tool_spec.requires_confirmation,
                    "parameters": {"action": "home"},
                },
                "is_chained": False,
            }
        if any(w in msg_lower for w in ["go back", "press back", "navigate back"]):
            tool_spec = self.registry.get_tool("navigate_system")
            return {
                "response": "Navigating back...",
                "tool_call": {
                    "tool_name": "navigate_system",
                    "risk_tier": tool_spec.risk_tier.value,
                    "requires_confirmation": tool_spec.requires_confirmation,
                    "parameters": {"action": "back"},
                },
                "is_chained": False,
            }
        if any(w in msg_lower for w in ["show recents", "open recents", "app switcher"]):
            tool_spec = self.registry.get_tool("navigate_system")
            return {
                "response": "Opening Android app switcher...",
                "tool_call": {
                    "tool_name": "navigate_system",
                    "risk_tier": tool_spec.risk_tier.value,
                    "requires_confirmation": tool_spec.requires_confirmation,
                    "parameters": {"action": "recents"},
                },
                "is_chained": False,
            }
        if any(w in msg_lower for w in ["show notifications", "open notifications"]):
            tool_spec = self.registry.get_tool("navigate_system")
            return {
                "response": "Pulling down notifications shade...",
                "tool_call": {
                    "tool_name": "navigate_system",
                    "risk_tier": tool_spec.risk_tier.value,
                    "requires_confirmation": tool_spec.requires_confirmation,
                    "parameters": {"action": "notifications"},
                },
                "is_chained": False,
            }

        # 2.1 Intent Deep-linking
        if any(w in msg_lower for w in ["open url", "visit website", "browse to"]) or msg_lower.startswith("http"):
            url = user_message
            for prefix in ["open url ", "visit website ", "browse to "]:
                if msg_lower.startswith(prefix):
                    url = user_message[len(prefix):].strip()
                    break
            if not url.startswith("http"):
                url = "https://" + url
            tool_spec = self.registry.get_tool("dispatch_intent")
            return {
                "response": f"Opening URL '{url}' in browser...",
                "tool_call": {
                    "tool_name": "dispatch_intent",
                    "risk_tier": tool_spec.risk_tier.value,
                    "requires_confirmation": tool_spec.requires_confirmation,
                    "parameters": {"action": "view_url", "uri": url},
                },
                "is_chained": False,
            }

        # 2.2 Open App intent
        if msg_lower.startswith("open ") or "launch " in msg_lower:
            app_name = msg_lower.replace("open ", "").replace("launch ", "").replace("app", "").strip()
            tool_spec = self.registry.get_tool("open_app")
            return {
                "response": f"Opening {app_name.capitalize()}...",
                "tool_call": {
                    "tool_name": "open_app",
                    "risk_tier": tool_spec.risk_tier.value,
                    "requires_confirmation": tool_spec.requires_confirmation,
                    "parameters": {"app_name": app_name},
                },
                "is_chained": True,
                "next_step": "read_screen_content",
            }

        # 3. Tap intent (screen grounded)
        if any(w in msg_lower for w in ["tap ", "click ", "press "]):
            target_query = msg_lower.replace("tap ", "").replace("click ", "").replace("press ", "").strip()
            matched_element = self._match_screen_element(target_query, screen_elements)
            tool_spec = self.registry.get_tool("perform_tap")
            
            if matched_element:
                bounds = matched_element.get("bounds", {})
                return {
                    "response": f"I identified '{matched_element.get('text') or target_query}' on your screen. Please confirm before I tap:",
                    "tool_call": {
                        "tool_name": "perform_tap",
                        "risk_tier": tool_spec.risk_tier.value,
                        "requires_confirmation": tool_spec.requires_confirmation,
                        "parameters": {
                            "target_text": matched_element.get("text") or target_query,
                            "target_element": matched_element,
                            "x": bounds.get("center_x", 160.0),
                            "y": bounds.get("center_y", 320.0),
                            "bounds": f"[{bounds.get('left', 0)}, {bounds.get('top', 0)}][{bounds.get('right', 0)}, {bounds.get('bottom', 0)}]",
                        },
                    },
                    "is_chained": False,
                }
            else:
                return {
                    "response": f"I prepared a tap action for '{target_query}'. Please confirm to execute:",
                    "tool_call": {
                        "tool_name": "perform_tap",
                        "risk_tier": tool_spec.risk_tier.value,
                        "requires_confirmation": tool_spec.requires_confirmation,
                        "parameters": {
                            "target_text": target_query,
                            "x": 160.0,
                            "y": 320.0,
                        },
                    },
                    "is_chained": False,
                }

        # 4. Type / Enter text intent
        if any(w in msg_lower for w in ["type ", "enter text ", "write "]):
            text_to_type = user_message
            for prefix in ["type ", "enter text ", "write "]:
                if msg_lower.startswith(prefix):
                    text_to_type = user_message[len(prefix):].strip()
                    break
            
            tool_spec = self.registry.get_tool("enter_text")
            return {
                "response": f"I prepared to type '{text_to_type}' into the active input field. Please confirm before typing:",
                "tool_call": {
                    "tool_name": "enter_text",
                    "risk_tier": tool_spec.risk_tier.value,
                    "requires_confirmation": tool_spec.requires_confirmation,
                    "parameters": {
                        "text": text_to_type,
                    },
                },
                "is_chained": False,
            }

        # 5. Send message intent
        if "send a message" in msg_lower or "send message" in msg_lower or "whatsapp" in msg_lower:
            tool_spec = self.registry.get_tool("send_message")
            return {
                "response": "I prepared your outgoing message. Because sending messages is high-risk, please confirm the recipient and payload:",
                "tool_call": {
                    "tool_name": "send_message",
                    "risk_tier": tool_spec.risk_tier.value,
                    "requires_confirmation": tool_spec.requires_confirmation,
                    "parameters": {
                        "recipient": "Selected Contact",
                        "message_body": user_message,
                    },
                },
                "is_chained": False,
            }

        # 6. Default Conversational response
        return {
            "response": f"I am Hermes, ready to assist on your device. I received: '{user_message}'. You can ask me to open apps, read the screen, tap buttons, or type text.",
            "tool_call": None,
            "is_chained": False,
        }

    def _match_screen_element(self, query: str, elements: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        query_clean = query.lower().strip()
        for el in elements:
            text = (el.get("text") or "").lower().strip()
            desc = (el.get("content_description") or "").lower().strip()
            if (text and query_clean in text) or (desc and query_clean in desc):
                return el
        return None
