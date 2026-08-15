from typing import List
from backend.app.services.document_intelligence.schemas import QuestionCandidate
from backend.app.services.validation_engine.schemas import (
    ValidationRuleResult, ValidationStageName, RuleStatus
)

VALID_SUBJECTS = {"QUANT", "REASONING", "ENGLISH", "GA_BANKING", "COMPUTER"}

def validate_taxonomy_rules(candidate: QuestionCandidate) -> List[ValidationRuleResult]:
    results = []

    # TAX_01: Subject belongs to taxonomy
    if candidate.subject_code in VALID_SUBJECTS:
        results.append(ValidationRuleResult(
            rule_id="TAX_01",
            stage=ValidationStageName.TAXONOMY,
            rule_name="Subject Taxonomy Validation",
            status=RuleStatus.PASS,
            is_mandatory=True,
            details=f"Subject code '{candidate.subject_code}' is valid."
        ))
    else:
        results.append(ValidationRuleResult(
            rule_id="TAX_01",
            stage=ValidationStageName.TAXONOMY,
            rule_name="Subject Taxonomy Validation",
            status=RuleStatus.FAIL,
            is_mandatory=True,
            details=f"Subject code '{candidate.subject_code}' is not in approved taxonomy."
        ))

    # TAX_02: Topic code exists
    if candidate.topic_code:
        results.append(ValidationRuleResult(
            rule_id="TAX_02",
            stage=ValidationStageName.TAXONOMY,
            rule_name="Topic Taxonomy Validation",
            status=RuleStatus.PASS,
            is_mandatory=True,
            details=f"Topic code '{candidate.topic_code}' is present."
        ))
    else:
        results.append(ValidationRuleResult(
            rule_id="TAX_02",
            stage=ValidationStageName.TAXONOMY,
            rule_name="Topic Taxonomy Validation",
            status=RuleStatus.FAIL,
            is_mandatory=True,
            details="Topic code is missing."
        ))

    return results
