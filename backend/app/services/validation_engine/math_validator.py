from typing import List
from backend.app.services.document_intelligence.schemas import QuestionCandidate, VerificationStatus
from backend.app.services.validation_engine.schemas import (
    ValidationRuleResult, ValidationStageName, RuleStatus
)
from backend.app.services.math_verifier import verify_question_mathematically

def validate_mathematical_rules(candidate: QuestionCandidate) -> List[ValidationRuleResult]:
    results = []

    # MATH_01 & 02: SymPy Calculation & Answer Key Comparison
    if candidate.subject_code == "QUANT":
        is_math_valid, msg, verified_idx = verify_question_mathematically(
            candidate.normalized_text, candidate.options, candidate.correct_option_index
        )
        
        if is_math_valid:
            results.append(ValidationRuleResult(
                rule_id="MATH_01",
                stage=ValidationStageName.MATHEMATICS,
                rule_name="Deterministic Math Verification",
                status=RuleStatus.PASS,
                is_mandatory=True,
                details=f"SymPy math check passed: {msg}"
            ))
        else:
            results.append(ValidationRuleResult(
                rule_id="MATH_01",
                stage=ValidationStageName.MATHEMATICS,
                rule_name="Deterministic Math Verification",
                status=RuleStatus.FAIL,
                is_mandatory=True,
                details=f"Math discrepancy detected: {msg}",
                suggested_fix=f"Review correct answer key or update to Option index {verified_idx}"
            ))
            
        # MATH_05: Detect impossible conditions (e.g., negative speed, probability > 1)
        text_lower = candidate.normalized_text.lower()
        if "probability" in text_lower:
            # Check if any option is > 1.0 or < 0 for probability
            for opt in candidate.options:
                try:
                    val = float(opt.text.strip())
                    if val < 0 or val > 1.0:
                        results.append(ValidationRuleResult(
                            rule_id="MATH_05",
                            stage=ValidationStageName.MATHEMATICS,
                            rule_name="Impossible Condition Check",
                            status=RuleStatus.FAIL,
                            is_mandatory=True,
                            details=f"Impossible condition: Probability option {opt.label} ({val}) is outside valid range [0, 1]."
                        ))
                except ValueError:
                    pass

    return results
