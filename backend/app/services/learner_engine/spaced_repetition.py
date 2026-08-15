from datetime import datetime, timedelta, timezone
from typing import Tuple
from backend.app.services.learner_engine.schemas import SuperMemoState

def calculate_sm2_interval(
    quality_grade: int,
    previous_interval_days: float = 1.0,
    previous_ease_factor: float = 2.5,
    previous_repetitions: int = 0,
    previous_lapse_count: int = 0
) -> SuperMemoState:
    """
    SuperMemo SM-2 deterministic spaced repetition scheduler algorithm.
    quality_grade: Integer 0 to 5.
    """
    q = max(0, min(5, quality_grade))
    
    # Calculate new ease factor EF'
    new_ef = previous_ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    new_ef = max(1.3, round(new_ef, 2))

    if q < 3:
        # Failure / Lapse
        new_repetitions = 0
        new_lapse_count = previous_lapse_count + 1
        new_interval = 1.0
    else:
        # Success
        new_lapse_count = previous_lapse_count
        new_repetitions = previous_repetitions + 1
        if new_repetitions == 1:
            new_interval = 1.0
        elif new_repetitions == 2:
            new_interval = 6.0
        else:
            new_interval = round(previous_interval_days * new_ef, 1)

    next_review = datetime.now(timezone.utc) + timedelta(days=new_interval)

    return SuperMemoState(
        interval_days=new_interval,
        ease_factor=new_ef,
        repetitions=new_repetitions,
        lapse_count=new_lapse_count,
        next_review_at=next_review.isoformat()
    )
