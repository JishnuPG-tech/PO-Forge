import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, Enum, 
    ForeignKey, Table, UniqueConstraint, CheckConstraint, Index, JSON
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base, Vector
from backend.app.models.enums import (
    PublicationStatus, QuestionDifficulty, DocumentType, 
    ValidationStatus, AnomalyType, MockType
)

def generate_uuid():
    return str(uuid.uuid4())

# Association table for Question <-> Concept
question_concepts = Table(
    "question_concepts",
    Base.metadata,
    Column("id", String(36), primary_key=True, default=generate_uuid),
    Column("question_id", String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True),
    Column("concept_id", String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True),
    Column("created_at", DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)),
    UniqueConstraint("question_id", "concept_id", name="uq_question_concept")
)

class Exam(Base):
    __tablename__ = "exams"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True) # e.g. IBPS_RRB_PO, SBI_PO
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    sections = relationship("ExamSection", back_populates="exam", cascade="all, delete-orphan")
    mocks = relationship("MockTest", back_populates="exam")

class ExamSection(Base):
    __tablename__ = "exam_sections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    exam_id = Column(String(36), ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    section_order = Column(Integer, nullable=False, default=1)
    duration_minutes = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    exam = relationship("Exam", back_populates="sections")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True) # e.g. QUANT, REASONING, ENGLISH
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="subject")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    code = Column(String(50), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("subject_id", "code", name="uq_topic_subject_code"),
    )

    subject = relationship("Subject", back_populates="topics")
    subtopics = relationship("Subtopic", back_populates="topic", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="topic")

class Subtopic(Base):
    __tablename__ = "subtopics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    code = Column(String(50), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("topic_id", "code", name="uq_subtopic_topic_code"),
    )

    topic = relationship("Topic", back_populates="subtopics")
    concepts = relationship("Concept", back_populates="subtopic", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="subtopic")

class Concept(Base):
    __tablename__ = "concepts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    subtopic_id = Column(String(36), ForeignKey("subtopics.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    formula_summary = Column(Text, nullable=True)
    shortcut_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    subtopic = relationship("Subtopic", back_populates="concepts")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_hash = Column(String(64), unique=True, nullable=False, index=True)
    file_path = Column(String(512), nullable=False)
    doc_type = Column(Enum(DocumentType), nullable=False, default=DocumentType.PDF)
    file_size_bytes = Column(Integer, nullable=False, default=0)
    page_count = Column(Integer, nullable=False, default=0)
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")
    pages = relationship("DocumentPage", back_populates="document", cascade="all, delete-orphan")

class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False, default=1)
    changes_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="versions")

class DocumentPage(Base):
    __tablename__ = "document_pages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    page_number = Column(Integer, nullable=False)
    ocr_raw_text = Column(Text, nullable=True)
    unicode_clean_text = Column(Text, nullable=True)
    page_image_path = Column(String(512), nullable=True)
    has_tables = Column(Boolean, default=False, nullable=False)
    has_diagrams = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("document_id", "page_number", name="uq_doc_page"),
    )

    document = relationship("Document", back_populates="pages")
    assets = relationship("DocumentAsset", back_populates="page", cascade="all, delete-orphan")

class DocumentAsset(Base):
    __tablename__ = "document_assets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    page_id = Column(String(36), ForeignKey("document_pages.id", ondelete="CASCADE"), nullable=True, index=True)
    asset_type = Column(String(50), nullable=False) # e.g. TABLE, CHART, DIAGRAM
    asset_path = Column(String(512), nullable=False)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    page = relationship("DocumentPage", back_populates="assets")

class Question(Base):
    __tablename__ = "questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    exam_id = Column(String(36), ForeignKey("exams.id", ondelete="SET NULL"), nullable=True, index=True)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="RESTRICT"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="RESTRICT"), nullable=False, index=True)
    subtopic_id = Column(String(36), ForeignKey("subtopics.id", ondelete="SET NULL"), nullable=True, index=True)
    
    text = Column(Text, nullable=False)
    di_set_id = Column(String(100), nullable=True, index=True) # e.g. DI_SET_00042 for shared context
    di_context_text = Column(Text, nullable=True)
    
    option_count = Column(Integer, nullable=False, default=5)
    correct_option_index = Column(Integer, nullable=False)
    
    difficulty = Column(Enum(QuestionDifficulty), nullable=False, default=QuestionDifficulty.MEDIUM)
    est_time_seconds = Column(Integer, nullable=False, default=60)
    
    publication_status = Column(Enum(PublicationStatus), nullable=False, default=PublicationStatus.DRAFT, index=True)
    validation_status = Column(Enum(ValidationStatus), nullable=False, default=ValidationStatus.FLAGGED)
    
    confidence_score = Column(Float, nullable=False, default=0.0)
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    version = Column(Integer, nullable=False, default=1)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        CheckConstraint("option_count >= 4 AND option_count <= 5", name="ck_question_option_count"),
        CheckConstraint("correct_option_index >= 0 AND correct_option_index < option_count", name="ck_question_correct_option_index"),
        Index("idx_question_taxonomy", "subject_id", "topic_id", "subtopic_id", "publication_status"),
        Index("idx_question_publication", "publication_status", "is_deleted"),
    )

    subject = relationship("Subject", back_populates="questions")
    topic = relationship("Topic", back_populates="questions")
    subtopic = relationship("Subtopic", back_populates="questions")
    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan", order_by="QuestionOption.option_index")
    solutions = relationship("QuestionSolution", back_populates="question", cascade="all, delete-orphan")
    sources = relationship("QuestionSource", back_populates="question", cascade="all, delete-orphan")
    validation_results = relationship("QuestionValidationResult", back_populates="question", cascade="all, delete-orphan")
    anomalies = relationship("QuestionAnomaly", back_populates="question", cascade="all, delete-orphan")
    embeddings = relationship("QuestionEmbedding", back_populates="question", cascade="all, delete-orphan")

class QuestionOption(Base):
    __tablename__ = "question_options"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    option_index = Column(Integer, nullable=False) # 0, 1, 2, 3, 4
    option_label = Column(String(10), nullable=False) # (A), (B), (C), (D), (E)
    text = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("question_id", "option_index", name="uq_question_option_index"),
    )

    question = relationship("Question", back_populates="options")

class QuestionSolution(Base):
    __tablename__ = "question_solutions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    detailed_solution = Column(Text, nullable=False)
    shortcut_method = Column(Text, nullable=True)
    common_trap_warning = Column(Text, nullable=True)
    verified_by_math_engine = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    question = relationship("Question", back_populates="solutions")

class QuestionSource(Base):
    __tablename__ = "question_sources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    page_number = Column(Integer, nullable=True)
    original_question_number = Column(String(50), nullable=True)
    bounding_box_json = Column(JSON, nullable=True)
    extraction_version = Column(String(50), default="v1.0", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    question = relationship("Question", back_populates="sources")

class QuestionVariant(Base):
    __tablename__ = "question_variants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    parent_question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    variant_question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    variant_type = Column(String(50), nullable=False) # NUMERICAL_CHANGE, REPHRASED, SIMILAR_CONCEPT
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("parent_question_id", "variant_question_id", name="uq_question_variant_pair"),
    )

class QuestionValidationResult(Base):
    __tablename__ = "question_validation_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_name = Column(String(100), nullable=False)
    status = Column(Enum(ValidationStatus), nullable=False)
    details = Column(Text, nullable=True)
    evaluated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    question = relationship("Question", back_populates="validation_results")

class QuestionAnomaly(Base):
    __tablename__ = "question_anomalies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    anomaly_type = Column(Enum(AnomalyType), nullable=False)
    severity = Column(String(20), nullable=False, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    description = Column(Text, nullable=False)
    resolved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    question = relationship("Question", back_populates="anomalies")

class QuestionEmbedding(Base):
    __tablename__ = "question_embeddings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    model_name = Column(String(100), nullable=False, default="text-embedding-3-large")
    embedding = Column(Vector(1536), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    question = relationship("Question", back_populates="embeddings")

class MockTest(Base):
    __tablename__ = "mock_tests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    exam_id = Column(String(36), ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    mock_type = Column(Enum(MockType), nullable=False, default=MockType.FULL)
    total_questions = Column(Integer, nullable=False, default=80)
    duration_minutes = Column(Integer, nullable=False, default=45)
    total_marks = Column(Float, nullable=False, default=80.0)
    negative_marking_ratio = Column(Float, nullable=False, default=0.25)
    publication_status = Column(Enum(PublicationStatus), nullable=False, default=PublicationStatus.PUBLISHED, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    exam = relationship("Exam", back_populates="mocks")
    sections = relationship("MockSection", back_populates="mock_test", cascade="all, delete-orphan", order_by="MockSection.section_order")

class MockSection(Base):
    __tablename__ = "mock_sections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    mock_test_id = Column(String(36), ForeignKey("mock_tests.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="RESTRICT"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    section_order = Column(Integer, nullable=False, default=1)
    duration_minutes = Column(Integer, nullable=True) # Sectional timing if applicable
    question_count = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    mock_test = relationship("MockTest", back_populates="sections")
    mock_questions = relationship("MockQuestion", back_populates="mock_section", cascade="all, delete-orphan", order_by="MockQuestion.question_order")

class MockQuestion(Base):
    __tablename__ = "mock_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    mock_section_id = Column(String(36), ForeignKey("mock_sections.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_order = Column(Integer, nullable=False)
    marks = Column(Float, nullable=False, default=1.0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("mock_section_id", "question_order", name="uq_mock_section_question_order"),
    )

    mock_section = relationship("MockSection", back_populates="mock_questions")
    question = relationship("Question")

class CurrentAffairs(Base):
    __tablename__ = "current_affairs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, default="BANKING_AWARENESS")
    content = Column(Text, nullable=False)
    bullet_points_json = Column(JSON, nullable=True)
    event_date = Column(DateTime(timezone=True), nullable=False)
    publication_status = Column(Enum(PublicationStatus), nullable=False, default=PublicationStatus.PUBLISHED)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=True, index=True)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True, index=True)
    
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    page_number = Column(Integer, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    embeddings = relationship("KnowledgeEmbedding", back_populates="chunk", cascade="all, delete-orphan")

class KnowledgeEmbedding(Base):
    __tablename__ = "knowledge_embeddings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    chunk_id = Column(String(36), ForeignKey("knowledge_chunks.id", ondelete="CASCADE"), nullable=False, index=True)
    model_name = Column(String(100), nullable=False, default="text-embedding-3-large")
    embedding = Column(Vector(1536), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    chunk = relationship("KnowledgeChunk", back_populates="embeddings")

class QuestionTemplate(Base):
    __tablename__ = "question_templates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    template_code = Column(String(100), unique=True, nullable=False, index=True) # e.g. TPL_PL_DISCOUNT_TRAP_003
    subject_code = Column(String(50), nullable=False, index=True)
    topic_code = Column(String(50), nullable=False, index=True)
    subtopic_code = Column(String(50), nullable=True)
    
    stem_pattern = Column(Text, nullable=False)
    numeric_param_ranges_json = Column(JSON, nullable=False)
    distractor_patterns_json = Column(JSON, nullable=False)
    difficulty_signal = Column(String(20), default="MEDIUM", nullable=False)
    style_fingerprint = Column(String(100), default="STANDARD_BANKING", nullable=False)
    example_question_ids_json = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

