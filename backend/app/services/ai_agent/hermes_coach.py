from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.app.services.ai_agent.omniroute_router import OmniRouteRouter, ModelTaskCategory, OmniRouteResponse
from backend.app.services.ai_agent.hermes_tools import HermesToolRegistry
from backend.app.services.ai_agent.prompt_defense import build_defended_prompt, SYSTEM_INSTRUCTION_HEADER
from backend.app.models.learning import AISession, AIMessage, AIToolCall

class HermesAICoach:

    def __init__(self, db_session: Optional[Session] = None):
        self.db = db_session
        self.router = OmniRouteRouter()
        self.tools = HermesToolRegistry(db_session=db_session)

    def process_chat_request(
        self,
        user_id: str,
        user_message: str,
        session_id: Optional[str] = None,
        task_category: ModelTaskCategory = ModelTaskCategory.TUTORING,
        retrieved_context: str = ""
    ) -> Dict[str, Any]:
        
        # 1. Build prompt injection defense
        system_prompt = SYSTEM_INSTRUCTION_HEADER
        if retrieved_context:
            system_prompt += f"\n\n<untrusted_retrieved_context>\n{retrieved_context}\n</untrusted_retrieved_context>"

        messages = [{"role": "user", "content": user_message}]

        # 2. Select & execute tool if requested by pattern or explicit query intent
        executed_tool_calls = []
        
        if "quant" in user_message.lower() and ("allocate" in user_message.lower() or "target" in user_message.lower() or "question" in user_message.lower() or "want" in user_message.lower()):
            import re
            numbers = re.findall(r'\d+', user_message)
            count = int(numbers[0]) if numbers else 25
            executed_tool_calls.append({
                "tool_name": "update_mission_config",
                "args": {"subject_code": "QUANT", "target_count": count},
                "result": {"status": "PENDING_CONFIRMATION", "subject_code": "QUANT", "target_count": count}
            })
        elif "mastery" in user_message.lower() or "score" in user_message.lower():
            t_res = self.tools.get_user_mastery(user_id=user_id)
            executed_tool_calls.append({"tool_name": "get_user_mastery", "result": t_res})
        elif "mistake" in user_message.lower():
            t_res = self.tools.get_mistakes(user_id=user_id)
            executed_tool_calls.append({"tool_name": "get_mistakes", "result": t_res})
        elif "revision" in user_message.lower() or "due" in user_message.lower():
            t_res = self.tools.get_due_revisions(user_id=user_id)
            executed_tool_calls.append({"tool_name": "get_due_revisions", "result": t_res})
        elif "weak" in user_message.lower() or "trap" in user_message.lower():
            t_res = self.tools.analyze_weak_patterns(user_id=user_id)
            executed_tool_calls.append({"tool_name": "analyze_weak_patterns", "result": t_res})
        elif "generate" in user_message.lower() or "practice" in user_message.lower():
            t_res = self.tools.generate_practice_question(user_id=user_id, topic_code="PROFIT_LOSS", count=2)
            executed_tool_calls.append({"tool_name": "generate_practice_question", "result": t_res})
        elif "challenge" in user_message.lower():
            t_res = self.tools.create_challenge_set(user_id=user_id, topic_code="PROFIT_LOSS", size=3)
            executed_tool_calls.append({"tool_name": "create_challenge_set", "result": t_res})
        elif "blueprint" in user_message.lower() or "exam pattern" in user_message.lower():
            t_res = self.tools.get_exam_blueprint(exam_code="IBPS_RRB_PO")
            executed_tool_calls.append({"tool_name": "get_exam_blueprint", "result": t_res})

        # 3. Route through OmniRoute model router
        omni_res: OmniRouteResponse = self.router.generate_completion(
            task=task_category,
            system_prompt=system_prompt,
            messages=messages
        )

        # 4. Save session and messages to database if DB session active
        db_session_id = session_id or f"SESS_{user_id[:8]}"
        if self.db:
            ai_sess = self.db.query(AISession).filter_by(id=db_session_id).first()
            if not ai_sess:
                ai_sess = AISession(id=db_session_id, user_id=user_id, title="Coaching Session")
                self.db.add(ai_sess)
                self.db.flush()

            # Add User message
            user_msg_obj = AIMessage(session_id=db_session_id, sender="USER", content=user_message)
            self.db.add(user_msg_obj)
            self.db.flush()

            # Add AI message
            ai_msg_obj = AIMessage(
                session_id=db_session_id,
                sender="HERMES",
                content=omni_res.content,
                source_provenance_json={"model_used": omni_res.model_used, "latency_ms": omni_res.observability.latency_ms}
            )
            self.db.add(ai_msg_obj)
            self.db.flush()

            # Add Tool call logs
            for tc in executed_tool_calls:
                self.db.add(AIToolCall(
                    message_id=ai_msg_obj.id,
                    tool_name=tc["tool_name"],
                    result_json=tc["result"],
                    execution_time_ms=15
                ))

            self.db.commit()

        return {
            "session_id": db_session_id,
            "response": omni_res.content,
            "model_used": omni_res.model_used,
            "tool_calls": executed_tool_calls,
            "observability": omni_res.observability.model_dump()
        }
