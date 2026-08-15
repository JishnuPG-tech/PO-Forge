from typing import List, Dict, Any, Tuple
from backend.app.models.enums import TopicState

# Explicit state transition rules
ALLOWED_STATE_TRANSITIONS = {
    TopicState.LOCKED: [TopicState.NOT_LEARNED],
    TopicState.NOT_LEARNED: [TopicState.LEARNING],
    TopicState.LEARNING: [TopicState.AVAILABLE, TopicState.NEEDS_REVISION],
    TopicState.AVAILABLE: [TopicState.NEEDS_REVISION, TopicState.MASTERED],
    TopicState.NEEDS_REVISION: [TopicState.AVAILABLE, TopicState.MASTERED],
    TopicState.MASTERED: [TopicState.NEEDS_REVISION]
}

def is_topic_eligible_for_training(current_state: TopicState) -> bool:
    """
    STRICT ELIGIBILITY RULE:
    Questions from LOCKED or NOT_LEARNED topics must NEVER enter practice, daily missions, or mocks.
    """
    if current_state in [TopicState.LOCKED, TopicState.NOT_LEARNED]:
        return False
    return True

def transition_topic_state(
    current_state: TopicState,
    mastery_percentage: float,
    accuracy_percentage: float,
    revision_due: bool = False
) -> Tuple[TopicState, str]:
    """
    Determines next topic state deterministically based on mastery, accuracy, and revision status.
    """
    if current_state == TopicState.LOCKED:
        return TopicState.LOCKED, "Topic is locked by user."
        
    if current_state == TopicState.NOT_LEARNED:
        return TopicState.NOT_LEARNED, "Topic has not been learned yet."

    if revision_due:
        return TopicState.NEEDS_REVISION, "Spaced repetition review is due."

    if current_state in [TopicState.LEARNING, TopicState.AVAILABLE, TopicState.NEEDS_REVISION]:
        if mastery_percentage >= 85.0 and accuracy_percentage >= 85.0:
            return TopicState.MASTERED, "Topic achieved high mastery and accuracy (>= 85%)."
        elif accuracy_percentage >= 70.0:
            return TopicState.AVAILABLE, "Topic accuracy is healthy (>= 70%)."
        else:
            return TopicState.LEARNING, "Topic requires further practice (Accuracy < 70%)."

    return current_state, "Topic state unchanged."
