from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field

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

class ValidationStageName(str, Enum):
    STRUCTURAL = "STRUCTURAL"
    TEXT_OCR = "TEXT_OCR"
    MATHEMATICS = "MATHEMATICS"
    SEMANTIC = "SEMANTIC"
    TAXONOMY = "TAXONOMY"
    DUPLICATE = "DUPLICATE"
    AI_GENERATION = "AI_GENERATION"

class ValidationRuleResult(BaseModel):
    rule_id: str
    rule_name: str
    stage: ValidationStageName
    status: RuleStatus
    is_mandatory: bool = True
    details: str = ""

class TypedAnomaly(BaseModel):
    anomaly_type: str
    severity: AnomalySeverity
    description: str

class PublicationGateReport(BaseModel):
    question_candidate_id: str
    can_publish: bool
    publication_status: str
    mandatory_rules_passed: bool
    total_rules_evaluated: int
    passed_rules_count: int
    failed_rules_count: int
    critical_anomalies_count: int
    individual_rule_results: List[ValidationRuleResult] = []
    anomalies: List[TypedAnomaly] = []
    admin_approval_granted: bool = False
    rejection_reasons: List[str] = []
