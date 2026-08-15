from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class ValidationStageName(str, Enum):
    STRUCTURAL = "STRUCTURAL"
    TEXT_OCR = "TEXT_OCR"
    MATHEMATICS = "MATHEMATICS"
    SEMANTIC = "SEMANTIC"
    TAXONOMY = "TAXONOMY"
    DUPLICATE = "DUPLICATE"

class RuleStatus(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    WARNING = "WARNING"
    SKIPPED = "SKIPPED"

class AnomalySeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ValidationRuleResult(BaseModel):
    rule_id: str
    stage: ValidationStageName
    rule_name: str
    status: RuleStatus
    is_mandatory: bool = True
    details: str
    suggested_fix: Optional[str] = None

class TypedAnomaly(BaseModel):
    anomaly_type: str  # e.g. CORRUPTED_DECIMAL, MATH_DISCREPANCY, DUPLICATE_QUESTION
    severity: AnomalySeverity
    description: str
    resolved: bool = False

class PublicationGateReport(BaseModel):
    question_candidate_id: str
    can_publish: bool
    publication_status: str  # DRAFT, REVIEW_REQUIRED, APPROVED, PUBLISHED
    mandatory_rules_passed: bool
    total_rules_evaluated: int
    passed_rules_count: int
    failed_rules_count: int
    critical_anomalies_count: int
    individual_rule_results: List[ValidationRuleResult]
    anomalies: List[TypedAnomaly]
    admin_approval_granted: bool = False
    rejection_reasons: List[str] = []
