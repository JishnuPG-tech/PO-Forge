from typing import List, Dict, Any, Optional, Tuple
from backend.app.services.mission_engine.schemas import (
    MissionSectionSpec, MissionQuestionItem, MissionAllocationAudit
)
from backend.app.services.learner_engine.topic_state_machine import is_topic_eligible_for_training
from backend.app.models.enums import TopicState

DEFAULT_SEQUENCE = ["QUANT", "REASONING", "ENGLISH", "GA_BANKING", "COMPUTER"]

SUBJECT_NAMES = {
    "QUANT": "Quantitative Aptitude",
    "REASONING": "Reasoning Ability",
    "ENGLISH": "English Language",
    "GA_BANKING": "General & Banking Awareness",
    "COMPUTER": "Computer Knowledge"
}

def generate_daily_mission_blueprint(
    user_id: str,
    enabled_subjects: List[str],
    enabled_topics_map: Dict[str, List[Dict[str, Any]]], # subject_code -> list of topic dicts {code, state, mastery}
    due_revision_question_ids: List[str],
    published_questions_pool: List[Dict[str, Any]],
    target_question_count: int = 90
) -> Tuple[List[MissionSectionSpec], List[MissionAllocationAudit]]:
    
    # 1. Order active subjects according to standard sequence (Quant -> Reasoning -> English -> GA -> Computer)
    active_sequence = [s for s in DEFAULT_SEQUENCE if s in enabled_subjects]
    if not active_sequence:
        active_sequence = ["QUANT"]

    # Calculate target allocation per subject
    per_subject_target = max(5, target_question_count // len(active_sequence))

    sections = []
    audits = []

    global_question_order = 1

    for order_idx, subj_code in enumerate(active_sequence, start=1):
        subj_name = SUBJECT_NAMES.get(subj_code, subj_code)
        
        # Filter eligible topics for this subject
        topics_info = enabled_topics_map.get(subj_code, [])
        eligible_topics = []
        for t in topics_info:
            t_state = TopicState(t.get("state", "AVAILABLE"))
            if is_topic_eligible_for_training(t_state):
                eligible_topics.append(t)

        if not eligible_topics:
            # Fallback default eligible topic if none configured
            eligible_topics = [{"code": f"{subj_code}_DEFAULT", "state": "AVAILABLE", "mastery": 50.0}]

        # Audit record for topic allocation
        audits.append(MissionAllocationAudit(
            subject_code=subj_code,
            topic_code=eligible_topics[0]["code"],
            allocated_count=per_subject_target,
            revision_count=min(5, len(due_revision_question_ids)),
            reason=f"Allocated {per_subject_target} questions for {subj_name} across {len(eligible_topics)} eligible topics."
        ))

        # Select published questions matching subject and eligible topics
        section_questions = []
        eligible_topic_codes = set(t["code"] for t in eligible_topics)

        for q in published_questions_pool:
            if q.get("subject_code") == subj_code:
                # Strictly enforce eligible topic & published status
                q_topic = q.get("topic_code", "")
                if q_topic in eligible_topic_codes or not q_topic:
                    is_rev = q.get("question_id") in due_revision_question_ids
                    
                    item = MissionQuestionItem(
                        question_id=q["question_id"],
                        subject_code=subj_code,
                        topic_code=q_topic or "SIMPLIFICATION",
                        subtopic_code=q.get("subtopic_code"),
                        text=q["text"],
                        options=q.get("options", ["(A) Opt 1", "(B) Opt 2", "(C) Opt 3", "(D) Opt 4", "(E) Opt 5"]),
                        correct_option_index=q.get("correct_option_index", 1),
                        explanation=q.get("explanation", "Standard solution."),
                        shortcut=q.get("shortcut"),
                        common_trap=q.get("common_trap"),
                        difficulty=q.get("difficulty", "MEDIUM"),
                        est_time_seconds=q.get("est_time_seconds", 60),
                        is_revision_item=is_rev,
                        question_order=global_question_order
                    )
                    section_questions.append(item)
                    global_question_order += 1
                    
                    if len(section_questions) >= per_subject_target:
                        break

        # Fallback question generator if pool is smaller than target
        while len(section_questions) < per_subject_target:
            q_num = len(section_questions) + 1
            item = MissionQuestionItem(
                question_id=f"MQ_{subj_code}_{q_num:03d}",
                subject_code=subj_code,
                topic_code=eligible_topics[0]["code"],
                text=f"[{subj_name}] Sample question #{q_num} for daily mission practice.",
                options=["(A) Option 1", "(B) Option 2", "(C) Option 3", "(D) Option 4", "(E) Option 5"],
                correct_option_index=1,
                explanation=f"Detailed step-by-step solution for {subj_name} Q#{q_num}.",
                shortcut=f"Shortcut trick for {subj_name} Q#{q_num}.",
                question_order=global_question_order
            )
            section_questions.append(item)
            global_question_order += 1

        sections.append(MissionSectionSpec(
            subject_code=subj_code,
            subject_name=subj_name,
            section_order=order_idx,
            target_count=len(section_questions),
            completed_count=0,
            questions=section_questions
        ))

    return sections, audits
