from typing import Dict, Any, List
from backend.app.services.mission_engine.schemas import DailyMissionState, MissionReport

def generate_post_mission_report(mission: DailyMissionState) -> MissionReport:
    total_q = 0
    correct = 0
    incorrect = 0
    skipped = 0
    total_time_ms = 0

    subject_perf: Dict[str, Dict[str, Any]] = {}
    topic_perf: Dict[str, Dict[str, Any]] = {}
    mistake_breakdown: Dict[str, int] = {}

    for sec in mission.sections:
        subj_code = sec.subject_code
        if subj_code not in subject_perf:
            subject_perf[subj_code] = {"correct": 0, "incorrect": 0, "skipped": 0, "total": 0}

        for q in sec.questions:
            total_q += 1
            subject_perf[subj_code]["total"] += 1
            total_time_ms += q.response_time_ms

            t_code = q.topic_code
            if t_code not in topic_perf:
                topic_perf[t_code] = {"correct": 0, "incorrect": 0, "total": 0}
            topic_perf[t_code]["total"] += 1

            if q.is_skipped:
                skipped += 1
                subject_perf[subj_code]["skipped"] += 1
            elif q.is_correct is True:
                correct += 1
                subject_perf[subj_code]["correct"] += 1
                topic_perf[t_code]["correct"] += 1
            else:
                incorrect += 1
                subject_perf[subj_code]["incorrect"] += 1
                topic_perf[t_code]["incorrect"] += 1
                
                # Classify mistake category based on speed
                resp_sec = q.response_time_ms / 1000.0
                if resp_sec < 15.0:
                    cat = "CARELESS_ERROR"
                elif resp_sec > 90.0:
                    cat = "TIME_PRESSURE"
                else:
                    cat = "CONCEPT_ERROR"
                mistake_breakdown[cat] = mistake_breakdown.get(cat, 0) + 1

    acc = (correct / max(1, (correct + incorrect))) * 100.0 if (correct + incorrect) > 0 else 0.0
    avg_time_sec = (total_time_ms / 1000.0) / max(1, total_q)
    total_dur_min = (total_time_ms / 1000.0) / 60.0

    # Calculate subject accuracy percentages
    for s_code, sp in subject_perf.items():
        s_tot = sp["correct"] + sp["incorrect"]
        sp["accuracy"] = round((sp["correct"] / s_tot * 100.0), 1) if s_tot > 0 else 0.0

    # Generate actionable next-day recommendations
    next_day_recs = []
    if acc < 70.0:
        next_day_recs.append("Daily target accuracy fell below 70%. Schedule 20 targeted foundation questions on your weak topics tomorrow.")
    
    slowest_subject = max(subject_perf.keys(), key=lambda k: subject_perf[k]["incorrect"]) if subject_perf else "QUANT"
    next_day_recs.append(f"Prioritize 25 practice questions in {slowest_subject} to strengthen speed and accuracy.")
    next_day_recs.append("Review 5 due Spaced Repetition items before beginning tomorrow's mission.")

    return MissionReport(
        mission_id=mission.mission_id,
        user_id=mission.user_id,
        mission_date=mission.mission_date,
        total_score=float(correct - (incorrect * 0.25)),
        total_questions=total_q,
        correct_count=correct,
        incorrect_count=incorrect,
        skipped_count=skipped,
        accuracy_percentage=round(acc, 2),
        average_time_seconds_per_q=round(avg_time_sec, 2),
        total_duration_minutes=round(total_dur_min, 2),
        subject_performance=subject_perf,
        topic_performance=topic_perf,
        mistake_categories_breakdown=mistake_breakdown,
        next_day_recommendations=next_day_recs
    )
