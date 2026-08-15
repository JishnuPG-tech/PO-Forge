import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, Enum, 
    ForeignKey, Table, UniqueConstraint, Index, JSON
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.enums import (
    RoleName, ProcessingJobStatus, PublicationStatus
)

def generate_uuid():
    return str(uuid.uuid4())

# Role <-> Permission association
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("id", String(36), primary_key=True, default=generate_uuid),
    Column("role_id", String(36), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False, index=True),
    Column("permission_id", String(36), ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False, index=True),
    Column("created_at", DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)),
    UniqueConstraint("role_id", "permission_id", name="uq_role_permission")
)

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    role_id = Column(String(36), ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    role = relationship("Role", back_populates="admin_users")
    audit_logs = relationship("AuditLog", back_populates="admin_user")

class Role(Base):
    __tablename__ = "roles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(Enum(RoleName), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    admin_users = relationship("AdminUser", back_populates="role")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(100), unique=True, nullable=False, index=True) # e.g. QUESTION_APPROVE, DOCUMENT_UPLOAD
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    admin_user_id = Column(String(36), ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False) # e.g. APPROVE_QUESTION, REJECT_QUESTION, PUBLISH_DOCUMENT
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(36), nullable=False)
    changes_json = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    admin_user = relationship("AdminUser", back_populates="audit_logs")

class ReviewItem(Base):
    __tablename__ = "review_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_admin_id = Column(String(36), ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True, index=True)
    review_status = Column(String(50), nullable=False, default="PENDING") # PENDING, IN_REVIEW, APPROVED, REJECTED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    question = relationship("Question")
    assigned_admin = relationship("AdminUser")

class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    job_type = Column(String(50), nullable=False) # OCR_EXTRACTION, MATH_VERIFICATION, RAG_EMBEDDING
    status = Column(Enum(ProcessingJobStatus), nullable=False, default=ProcessingJobStatus.PENDING, index=True)
    progress_percentage = Column(Float, nullable=False, default=0.0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    document = relationship("Document")
    events = relationship("ProcessingEvent", back_populates="processing_job", cascade="all, delete-orphan")

class ProcessingEvent(Base):
    __tablename__ = "processing_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    processing_job_id = Column(String(36), ForeignKey("processing_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    step_name = Column(String(100), nullable=False)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    processing_job = relationship("ProcessingJob", back_populates="events")

class PublicationEvent(Base):
    __tablename__ = "publication_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    entity_type = Column(String(50), nullable=False) # QUESTION, MOCK_TEST, DOCUMENT
    entity_id = Column(String(36), nullable=False)
    previous_status = Column(Enum(PublicationStatus), nullable=False)
    new_status = Column(Enum(PublicationStatus), nullable=False)
    triggered_by_admin_id = Column(String(36), ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True, index=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
