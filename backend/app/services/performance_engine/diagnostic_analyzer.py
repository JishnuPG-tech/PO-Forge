from typing import List, Dict, Any, Tuple
from backend.app.services.performance_engine.schemas import (
    AttemptRecord, SubjectPerformanceSummary, ComprehensivePerformanceReport
)

def compute_subject_performance(
    attempts: List[AttemptRecord],
    subject_code: str,
    subject_name: str
) -> SubjectPerformanceSummary:
    
    subj_attempts = [a for a in attempts if a.subject_code == subject_code]
    tot = len(subj_attempts)
    if tot == 0:
        return SubjectPerformanceSummary(
            subject_code=subject_code,
            subject_name=subject_name,
            total_questions=0,
            attempted_count=0,
            correct_count=0,
            incorrect_count=0,
            skipped_count=0,
            total_score=0.0,
            accuracy_percentage=0.0,
            average_speed_seconds=0.0,
            difficulty_breakdown={},
            topic_breakdown={}
        )

    correct = sum(1 for a in subj_attempts if a.is_correct)
    skipped = sum(1 for a in subj_attempts if a.is_skipped)
    incorrect = tot - correct - skipped
    attempted = correct + incorrect

    total_time_ms = sum(a.response_time_ms for a in subj_attempts)
    avg_speed = (total_time_ms / 1000.0) / tot if tot > 0 else 0.0

    score = float(correct - (incorrect * 0.25))
    acc = (correct / attempted * 100.0) if attempted > 0 else 0.0

    # Difficulty Breakdown
    diff_map: Dict[str, Dict[str, Any]] = {}
    for d in ["EASY", "MEDIUM", "HARD"]:
        d_att = [a for a in subj_attempts if a.question_difficulty == d]
        d_corr = sum(1 for a in d_att if a.is_correct)
        diff_map[d] = {
            "total": len(d_att),
            "correct": d_corr,
            "accuracy": round((d_corr / max(1, len(d_att)) * 100.0), 1) if d_att else 0.0
        }

    # Topic Breakdown
    topic_map: Dict[str, Dict[str, Any]] = {}
    for a in subj_attempts:
        t = a.topic_code
        if t not in topic_map:
            topic_map[t] = {"total": 0, "correct": 0, "incorrect": 0}
        topic_map[t]["total"] += 1
        if a.is_correct:
            topic_map[t]["correct"] += 1
        elif not a.is_skipped:
            topic_map[t]["incorrect"] += 1

    for t, data in topic_map.items():
        data["accuracy"] = round((data["correct"] / max(1, data["total"]) * 100.0), 1)

    return SubjectPerformanceSummary(
        subject_code=subject_code,
        subject_name=subject_name,
        total_questions=tot,
        attempted_count=attempted,
        correct_count=correct,
        incorrect_count=incorrect,
        skipped_count=skipped,
        total_score=score,
        accuracy_percentage=round(acc, 2),
        average_speed_seconds=round(avg_speed, 2),
        difficulty_breakdown=diff_map,
        topic_breakdown=topic_map
    )

def extract_strongest_and_weakest_topics(subject_summaries: List[SubjectPerformanceSummary]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    all_topics = []
    for s in subject_summaries:
        for t_code, t_data in s.topic_breakdown.items():
            all_topics.append({
                "subject_code": s.subject_code,
                "topic_code": t_code,
                "accuracy": t_data["accuracy"],
                "total_questions": t_data["total"]
            })

    all_topics.sort(key=lambda x: x["accuracy"], reverse=True)
    strongest = all_topics[:3]
    weakest = sorted(all_topics, key=lambda x: x["accuracy"])[:3]
    return strongest, weakest
