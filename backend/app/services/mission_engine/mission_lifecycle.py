import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session

from backend.app.services.mission_engine.schemas import (
    DailyMissionState, MissionStatus, MissionReport, MissionQuestionItem
)
from backend.app.services.mission_engine.blueprint_generator import generate_daily_mission_blueprint
from backend.app.services.mission_engine.analytics_report import generate_post_mission_report

class DailyMissionLifecycleManager:

    def __init__(self, db_session: Optional[Session] = None):
        self.db = db_session

    def start_daily_mission(
        self,
        user_id: str,
        enabled_subjects: List[str],
        enabled_topics_map: Dict[str, List[Dict[str, Any]]],
        due_revision_question_ids: List[str],
        published_questions_pool: List[Dict[str, Any]],
        target_question_count: int = 90,
        mission_date_str: Optional[str] = None
    ) -> DailyMissionState:
        
        date_str = mission_date_str or datetime.now(timezone.utc).strftime("%Y-%m-%d")
        mission_id = f"DM_{user_id[:6]}_{date_str.replace('-', '')}"

        sections, audits = generate_daily_mission_blueprint(
            user_id=user_id,
            enabled_subjects=enabled_subjects,
            enabled_topics_map=enabled_topics_map,
            due_revision_question_ids=due_revision_question_ids,
            published_questions_pool=published_questions_pool,
            target_question_count=target_question_count
        )

        state = DailyMissionState(
            mission_id=mission_id,
            user_id=user_id,
            mission_date=date_str,
            status=MissionStatus.IN_PROGRESS,
            target_question_count=sum(s.target_count for s in sections),
            completed_question_count=0,
            current_section_index=0,
            current_question_index=0,
            sections=sections,
            audits=audits,
            created_at=datetime.now(timezone.utc).isoformat()
        )

        return state

    def pause_mission(self, state: DailyMissionState) -> DailyMissionState:
        state.status = MissionStatus.PAUSED
        return state

    def resume_mission(self, state: DailyMissionState) -> DailyMissionState:
        state.status = MissionStatus.IN_PROGRESS
        return state

    def submit_mission_question(
        self,
        state: DailyMissionState,
        section_index: int,
        question_index: int,
        selected_option_index: Optional[int],
        is_skipped: bool,
        response_time_ms: int
    ) -> Tuple[DailyMissionState, MissionQuestionItem]:
        
        if section_index < 0 or section_index >= len(state.sections):
            raise IndexError(f"Section index {section_index} out of range.")

        sec = state.sections[section_index]
        if question_index < 0 or question_index >= len(sec.questions):
            raise IndexError(f"Question index {question_index} out of range.")

        q_item = sec.questions[question_index]
        q_item.user_selected_option = selected_option_index
        q_item.is_skipped = is_skipped
        q_item.response_time_ms = response_time_ms
        q_item.answered_at = datetime.now(timezone.utc).isoformat()

        if is_skipped or selected_option_index is None:
            q_item.is_correct = False
        else:
            q_item.is_correct = (selected_option_index == q_item.correct_option_index)

        # Update section and mission completion counts
        completed_in_sec = sum(1 for q in sec.questions if q.answered_at is not None)
        sec.completed_count = completed_in_sec

        state.completed_question_count = sum(s.completed_count for s in state.sections)

        # Advance question / section pointer
        if question_index + 1 < len(sec.questions):
            state.current_question_index = question_index + 1
        elif section_index + 1 < len(state.sections):
            state.current_section_index = section_index + 1
            state.current_question_index = 0

        # Check if entire mission completed
        if state.completed_question_count >= state.target_question_count:
            state.status = MissionStatus.COMPLETED
            state.completed_at = datetime.now(timezone.utc).isoformat()

        return state, q_item

    def complete_mission(self, state: DailyMissionState) -> Tuple[DailyMissionState, MissionReport]:
        state.status = MissionStatus.COMPLETED
        state.completed_at = datetime.now(timezone.utc).isoformat()
        report = generate_post_mission_report(state)
        return state, report
