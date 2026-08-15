from typing import List, Dict, Any, Tuple

def calculate_speed_factor(average_time_seconds: float, est_time_seconds: float = 60.0) -> float:
    if average_time_seconds <= 0:
        return 100.0
    ratio = average_time_seconds / max(1.0, est_time_seconds)
    if ratio <= 1.0:
        return 100.0
    elif ratio <= 1.5:
        return 80.0
    elif ratio <= 2.0:
        return 60.0
    else:
        return 40.0

def calculate_deterministic_mastery(
    accuracy_percentage: float,
    average_speed_seconds: float,
    retention_score: float = 80.0,
    est_time_seconds: float = 60.0
) -> float:
    """
    Calculates deterministic topic mastery percentage:
    70% Accuracy + 20% Speed + 10% Retention
    """
    speed_factor = calculate_speed_factor(average_speed_seconds, est_time_seconds)
    mastery = (accuracy_percentage * 0.70) + (speed_factor * 0.20) + (retention_score * 0.10)
    return round(max(0.0, min(100.0, mastery)), 2)

def adapt_target_difficulty(recent_attempt_correctness: List[bool]) -> str:
    """
    Adapts target difficulty based on recent 5 attempt history.
    """
    if not recent_attempt_correctness:
        return "MEDIUM"
    
    recent_5 = recent_attempt_correctness[-5:]
    acc = (sum(1 for c in recent_5 if c) / len(recent_5)) * 100.0

    if acc >= 85.0:
        return "HARD"
    elif acc <= 50.0:
        return "EASY"
    return "MEDIUM"

def determine_readiness_state(overall_mastery: float, overall_accuracy: float) -> str:
    if overall_mastery >= 85.0 and overall_accuracy >= 85.0:
        return "EXAM_READY"
    elif overall_mastery >= 75.0:
        return "STRONG"
    elif overall_mastery >= 60.0:
        return "COMPETITIVE"
    elif overall_mastery >= 45.0:
        return "DEVELOPING"
    return "FOUNDATION"
