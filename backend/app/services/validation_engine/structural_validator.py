from typing import List
from backend.app.services.document_intelligence.schemas import QuestionCandidate
from backend.app.services.validation_engine.schemas import (
    ValidationRuleResult, ValidationStageName, RuleStatus
)

def validate_structural_rules(candidate: QuestionCandidate) -> List[ValidationRuleResult]:
    results = []

    # STRUCT_01: Question text exists
    if candidate.normalized_text and len(candidate.normalized_text.strip()) > 10:
        results.append(ValidationRuleResult(
            rule_id="STRUCT_01",
            stage=ValidationStageName.STRUCTURAL,
            rule_name="Question Text Exists",
            status=RuleStatus.PASS,
            is_mandatory=True,
            details="Question text is present and exceeds minimum character length."
        ))
    else:
        results.append(ValidationRuleResult(
            rule_id="STRUCT_01",
            stage=ValidationStageName.STRUCTURAL,
            rule_name="Question Text Exists",
            status=RuleStatus.FAIL,
            is_mandatory=True,
            details="Question text is missing or too short."
        ))

    # STRUCT_03: 4 or 5 options
    if candidate.option_count in [4, 5]:
        results.append(ValidationRuleResult(
            rule_id="STRUCT_03",
            stage=ValidationStageName.STRUCTURAL,
            rule_name="Valid Option Count",
            status=RuleStatus.PASS,
            is_mandatory=True,
            details=f"Question has exactly {candidate.option_count} options."
        ))
    else:
        results.append(ValidationRuleResult(
            rule_id="STRUCT_03",
            stage=ValidationStageName.STRUCTURAL,
            rule_name="Valid Option Count",
            status=RuleStatus.FAIL,
            is_mandatory=True,
            details=f"Invalid option count: {candidate.option_count}. Expected 4 or 5 options."
        ))

    # STRUCT_04: No empty option
    empty_opts = [o.label for o in candidate.options if not o.text or not o.text.strip()]
    if not empty_opts:
        results.append(ValidationRuleResult(
            rule_id="STRUCT_04",
            stage=ValidationStageName.STRUCTURAL,
            rule_name="No Empty Options",
            status=RuleStatus.PASS,
            is_mandatory=True,
            details="All options contain valid non-empty text."
        ))
    else:
        results.append(ValidationRuleResult(
            rule_id="STRUCT_04",
            stage=ValidationStageName.STRUCTURAL,
            rule_name="No Empty Options",
            status=RuleStatus.FAIL,
            is_mandatory=True,
            details=f"Empty option text found in options: {', '.join(empty_opts)}."
        ))

    # STRUCT_05: Unique options
    opt_texts = [o.text.strip().lower() for o in candidate.options]
    if len(opt_texts) == len(set(opt_texts)):
        results.append(ValidationRuleResult(
            rule_id="STRUCT_05",
            stage=ValidationStageName.STRUCTURAL,
            rule_name="Unique Options",
            status=RuleStatus.PASS,
            is_mandatory=True,
            details="All options are distinct and unique."
        ))
    else:
        results.append(ValidationRuleResult(
            rule_id="STRUCT_05",
            stage=ValidationStageName.STRUCTURAL,
            rule_name="Unique Options",
            status=RuleStatus.FAIL,
            is_mandatory=True,
            details="Duplicate option texts detected."
        ))

    # STRUCT_07 & 08: Correct answer exists and corresponds to option
    if candidate.correct_option_index is not None and 0 <= candidate.correct_option_index < len(candidate.options):
        results.append(ValidationRuleResult(
            rule_id="STRUCT_08",
            stage=ValidationStageName.STRUCTURAL,
            rule_name="Valid Correct Option Reference",
            status=RuleStatus.PASS,
            is_mandatory=True,
            details=f"Correct option index {candidate.correct_option_index} points to valid option {candidate.options[candidate.correct_option_index].label}."
        ))
    else:
        results.append(ValidationRuleResult(
            rule_id="STRUCT_08",
            stage=ValidationStageName.STRUCTURAL,
            rule_name="Valid Correct Option Reference",
            status=RuleStatus.FAIL,
            is_mandatory=True,
            details=f"Invalid or missing correct answer key index: {candidate.correct_option_index} for option count {len(candidate.options)}."
        ))

    # STRUCT_09 & 10: Source document and page location exist
    if candidate.source_location and candidate.source_location.page_number > 0:
        results.append(ValidationRuleResult(
            rule_id="STRUCT_10",
            stage=ValidationStageName.STRUCTURAL,
            rule_name="Source Page Exists",
            status=RuleStatus.PASS,
            is_mandatory=True,
            details=f"Source page location is valid: Page {candidate.source_location.page_number}."
        ))
    else:
        results.append(ValidationRuleResult(
            rule_id="STRUCT_10",
            stage=ValidationStageName.STRUCTURAL,
            rule_name="Source Page Exists",
            status=RuleStatus.FAIL,
            is_mandatory=True,
            details="Source page location is missing or invalid."
        ))

    return results
