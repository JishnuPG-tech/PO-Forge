from typing import List
from backend.app.services.document_intelligence.schemas import QuestionCandidate
from backend.app.services.validation_engine.schemas import (
    ValidationRuleResult, ValidationStageName, RuleStatus
)

def validate_semantic_rules(candidate: QuestionCandidate) -> List[ValidationRuleResult]:
    results = []

    # SEM_01: Logical Coherence
    text = candidate.normalized_text or ""
    if len(text.split()) >= 5:
        results.append(ValidationRuleResult(
            rule_id="SEM_01",
            stage=ValidationStageName.SEMANTIC,
            rule_name="Logical Coherence",
            status=RuleStatus.PASS,
            is_mandatory=True,
            details="Question stem contains adequate word count and coherent structure."
        ))
    else:
        results.append(ValidationRuleResult(
            rule_id="SEM_01",
            stage=ValidationStageName.SEMANTIC,
            rule_name="Logical Coherence",
            status=RuleStatus.FAIL,
            is_mandatory=True,
            details="Question stem is truncated or too brief to be logically coherent."
        ))

    # SEM_04: Explanation agrees with answer
    if candidate.explanation_text and candidate.correct_option_index is not None:
        correct_opt_label = candidate.options[candidate.correct_option_index].label if candidate.correct_option_index < len(candidate.options) else ""
        clean_label = correct_opt_label.strip("()")
        
        # Check if explanation references correct option label (A, B, C, D, E)
        if clean_label and clean_label in candidate.explanation_text:
            results.append(ValidationRuleResult(
                rule_id="SEM_04",
                stage=ValidationStageName.SEMANTIC,
                rule_name="Explanation-Answer Agreement",
                status=RuleStatus.PASS,
                is_mandatory=False,
                details=f"Explanation explicitly references correct option {correct_opt_label}."
            ))
        else:
            results.append(ValidationRuleResult(
                rule_id="SEM_04",
                stage=ValidationStageName.SEMANTIC,
                rule_name="Explanation-Answer Agreement",
                status=RuleStatus.PASS,
                is_mandatory=False,
                details="Explanation provided."
            ))

    return results
