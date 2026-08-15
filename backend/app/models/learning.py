import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, Enum, 
    ForeignKey, UniqueConstraint, CheckConstraint, Index, JSON
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.enums import (
    TopicState, MistakeCategory, ExamReadinessState
)

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    avatar_url = Column(String(512), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    current_streak_days = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    exam_targets = relationship("UserExamTarget", back_populates="user", cascade="all, delete-orphan")
    topic_states = relationship("UserTopicState", back_populates="user", cascade="all, delete-orphan")
    user_mastery = relationship("UserMastery", back_populates="user", uselist=False, cascade="all, delete-orphan")
    daily_missions = relationship("DailyMission", back_populates="user", cascade="all, delete-orphan")
    mock_attempts = relationship("MockAttempt", back_populates="user", cascade="all, delete-orphan")
    ai_sessions = relationship("AISession", back_populates="user", cascade="all, delete-orphan")

class UserExamTarget(Base):
    __tablename__ = "user_exam_targets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    exam_id = Column(String(36), ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    target_date = Column(DateTime(timezone=True), nullable=True)
    is_primary = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("user_id", "exam_id", name="uq_user_exam_target"),
    )

    user = relationship("User", back_populates="exam_targets")
    exam = relationship("Exam")

class UserSubjectPreference(Base):
    __tablename__ = "user_subject_preferences"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    is_enabled_for_daily = Column(Boolean, default=True, nullable=False)
    daily_question_target = Column(Integer, default=25, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("user_id", "subject_id", name="uq_user_subject_pref"),
    )

class UserTopicPreference(Base):
    __tablename__ = "user_topic_preferences"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    is_enabled_for_daily = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("user_id", "topic_id", name="uq_user_topic_pref"),
    )

class UserTopicState(Base):
    __tablename__ = "user_topic_states"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    state = Column(Enum(TopicState), nullable=False, default=TopicState.AVAILABLE, index=True)
    mastery_percentage = Column(Float, nullable=False, default=0.0)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("user_id", "topic_id", name="uq_user_topic_state"),
        Index("idx_user_topic_state_query", "user_id", "state"),
    )

    user = relationship("User", back_populates="topic_states")
    topic = relationship("Topic")

class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    source_type = Column(String(50), nullable=False) # MISSION, MOCK, TOPIC_PRACTICE
    total_questions = Column(Integer, nullable=False)
    correct_count = Column(Integer, nullable=False, default=0)
    incorrect_count = Column(Integer, nullable=False, default=0)
    skipped_count = Column(Integer, nullable=False, default=0)
    total_time_seconds = Column(Integer, nullable=False, default=0)
    accuracy_percentage = Column(Float, nullable=False, default=0.0)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)

    answers = relationship("AttemptAnswer", back_populates="attempt", cascade="all, delete-orphan")

class AttemptAnswer(Base):
    __tablename__ = "attempt_answers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    attempt_id = Column(String(36), ForeignKey("attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    selected_option_index = Column(Integer, nullable=True) # Null if skipped
    is_correct = Column(Boolean, nullable=False, default=False)
    is_skipped = Column(Boolean, nullable=False, default=False)
    response_time_ms = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("attempt_id", "question_id", name="uq_attempt_question_answer"),
    )

    attempt = relationship("Attempt", back_populates="answers")
    question = relationship("Question")
    mistakes = relationship("Mistake", back_populates="attempt_answer", cascade="all, delete-orphan")

class Mistake(Base):
    __tablename__ = "mistakes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    attempt_answer_id = Column(String(36), ForeignKey("attempt_answers.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    mistake_category = Column(Enum(MistakeCategory), nullable=False, default=MistakeCategory.CONCEPT_ERROR)
    user_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    attempt_answer = relationship("AttemptAnswer", back_populates="mistakes")
    events = relationship("MistakeEvent", back_populates="mistake", cascade="all, delete-orphan")

class MistakeEvent(Base):
    __tablename__ = "mistake_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    mistake_id = Column(String(36), ForeignKey("mistakes.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False) # REPEATED, RESOLVED, REVISE_FLAGGED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    mistake = relationship("Mistake", back_populates="events")

class UserMastery(Base):
    __tablename__ = "user_mastery"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    overall_mastery_percentage = Column(Float, nullable=False, default=0.0)
    overall_accuracy_percentage = Column(Float, nullable=False, default=0.0)
    average_speed_seconds_per_q = Column(Float, nullable=False, default=0.0)
    retention_score = Column(Float, nullable=False, default=0.0)
    readiness_state = Column(Enum(ExamReadinessState), nullable=False, default=ExamReadinessState.FOUNDATION)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="user_mastery")

class TopicMastery(Base):
    __tablename__ = "topic_mastery"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    mastery_percentage = Column(Float, nullable=False, default=0.0)
    accuracy_percentage = Column(Float, nullable=False, default=0.0)
    attempts_count = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("user_id", "topic_id", name="uq_user_topic_mastery"),
    )

class SubtopicMastery(Base):
    __tablename__ = "subtopic_mastery"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subtopic_id = Column(String(36), ForeignKey("subtopics.id", ondelete="CASCADE"), nullable=False, index=True)
    mastery_percentage = Column(Float, nullable=False, default=0.0)
    accuracy_percentage = Column(Float, nullable=False, default=0.0)
    attempts_count = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("user_id", "subtopic_id", name="uq_user_subtopic_mastery"),
    )

class ConceptMastery(Base):
    __tablename__ = "concept_mastery"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    concept_id = Column(String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    mastery_percentage = Column(Float, nullable=False, default=0.0)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("user_id", "concept_id", name="uq_user_concept_mastery"),
    )

class RevisionItem(Base):
    __tablename__ = "revision_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    next_review_at = Column(DateTime(timezone=True), nullable=False, index=True)
    interval_days = Column(Float, nullable=False, default=1.0)
    ease_factor = Column(Float, nullable=False, default=2.5)
    repetitions = Column(Integer, nullable=False, default=0)
    lapse_count = Column(Integer, nullable=False, default=0)
    last_attempt_status = Column(Boolean, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("user_id", "question_id", name="uq_user_question_revision"),
        Index("idx_user_revision_due", "user_id", "next_review_at"),
    )

    events = relationship("RevisionEvent", back_populates="revision_item", cascade="all, delete-orphan")

class RevisionEvent(Base):
    __tablename__ = "revision_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    revision_item_id = Column(String(36), ForeignKey("revision_items.id", ondelete="CASCADE"), nullable=False, index=True)
    review_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    quality_grade = Column(Integer, nullable=False) # 0 to 5 SM-2 grade
    new_interval_days = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    revision_item = relationship("RevisionItem", back_populates="events")

class DailyMission(Base):
    __tablename__ = "daily_missions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mission_date = Column(DateTime(timezone=True), nullable=False, index=True)
    status = Column(String(20), nullable=False, default="PENDING") # PENDING, IN_PROGRESS, COMPLETED
    target_question_count = Column(Integer, nullable=False, default=90)
    completed_question_count = Column(Integer, nullable=False, default=0)
    blueprint_config_json = Column(JSON, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("user_id", "mission_date", name="uq_user_daily_mission_date"),
    )

    user = relationship("User", back_populates="daily_missions")
    sections = relationship("MissionSection", back_populates="daily_mission", cascade="all, delete-orphan")

class MissionSection(Base):
    __tablename__ = "mission_sections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    daily_mission_id = Column(String(36), ForeignKey("daily_missions.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="RESTRICT"), nullable=False, index=True)
    section_order = Column(Integer, nullable=False, default=1)
    target_count = Column(Integer, nullable=False, default=25)
    completed_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    daily_mission = relationship("DailyMission", back_populates="sections")
    questions = relationship("MissionQuestion", back_populates="mission_section", cascade="all, delete-orphan", order_by="MissionQuestion.question_order")

class MissionQuestion(Base):
    __tablename__ = "mission_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    mission_section_id = Column(String(36), ForeignKey("mission_sections.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_order = Column(Integer, nullable=False)
    selected_option_index = Column(Integer, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    response_time_ms = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("mission_section_id", "question_order", name="uq_mission_section_question_order"),
    )

    mission_section = relationship("MissionSection", back_populates="questions")
    question = relationship("Question")

class MockAttempt(Base):
    __tablename__ = "mock_attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mock_test_id = Column(String(36), ForeignKey("mock_tests.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Float, nullable=False, default=0.0)
    correct_count = Column(Integer, nullable=False, default=0)
    incorrect_count = Column(Integer, nullable=False, default=0)
    skipped_count = Column(Integer, nullable=False, default=0)
    total_time_seconds = Column(Integer, nullable=False, default=0)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    submitted_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="mock_attempts")
    mock_test = relationship("MockTest")
    answers = relationship("MockAttemptAnswer", back_populates="mock_attempt", cascade="all, delete-orphan")

class MockAttemptAnswer(Base):
    __tablename__ = "mock_attempt_answers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    mock_attempt_id = Column(String(36), ForeignKey("mock_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    selected_option_index = Column(Integer, nullable=True)
    is_marked_for_review = Column(Boolean, default=False, nullable=False)
    is_correct = Column(Boolean, nullable=True)
    response_time_ms = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    mock_attempt = relationship("MockAttempt", back_populates="answers")
    question = relationship("Question")

class LearningEvent(Base):
    __tablename__ = "learning_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False) # MISSION_START, QUESTION_SOLVED, MISTAKE_REVISED
    event_data_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class AISession(Base):
    __tablename__ = "ai_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), default="Coaching Session", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="ai_sessions")
    messages = relationship("AIMessage", back_populates="session", cascade="all, delete-orphan", order_by="AIMessage.created_at")

class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("ai_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String(20), nullable=False) # USER, HERMES, SYSTEM
    content = Column(Text, nullable=False)
    source_provenance_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    session = relationship("AISession", back_populates="messages")
    tool_calls = relationship("AIToolCall", back_populates="message", cascade="all, delete-orphan")

class AIToolCall(Base):
    __tablename__ = "ai_tool_calls"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    message_id = Column(String(36), ForeignKey("ai_messages.id", ondelete="CASCADE"), nullable=False, index=True)
    tool_name = Column(String(100), nullable=False)
    arguments_json = Column(JSON, nullable=True)
    result_json = Column(JSON, nullable=True)
    execution_time_ms = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    message = relationship("AIMessage", back_populates="tool_calls")
