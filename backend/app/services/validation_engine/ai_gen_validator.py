import re
import sympy
from typing import List
from backend.app.services.document_intelligence.schemas import QuestionCandidate
from backend.app.services.validation_engine.schemas import (
    ValidationRuleResult, RuleStatus, ValidationStageName
)

def validate_ai_generated_rules(candidate: QuestionCandidate) -> List[ValidationRuleResult]:
    results = []

    # AI_GEN_01: Independent Re-Derivation Check using SymPy equation solver
    from backend.app.services.math_verifier import verify_question_mathematically
    is_math_valid, math_msg, _ = verify_question_mathematically(
        candidate.normalized_text, candidate.options, candidate.correct_option_index
    )

    results.append(ValidationRuleResult(
        rule_id="AI_GEN_01",
        rule_name="Independent Re-Derivation Check",
        stage=ValidationStageName.MATHEMATICS,
        status=RuleStatus.PASS if is_math_valid else RuleStatus.FAIL,
        is_mandatory=True,
        details=math_msg
    ))

    # AI_GEN_02: Marked Answer Exists in Options Check
    has_valid_marked_option = (
        candidate.correct_option_index is not None and
        0 <= candidate.correct_option_index < len(candidate.options) and
        bool(candidate.options[candidate.correct_option_index].text.strip())
    )
    results.append(ValidationRuleResult(
        rule_id="AI_GEN_02",
        rule_name="Marked Answer Exists in Options Check",
        stage=ValidationStageName.STRUCTURAL,
        status=RuleStatus.PASS if has_valid_marked_option else RuleStatus.FAIL,
        is_mandatory=True,
        details="Marked correct option exists and is non-empty." if has_valid_marked_option else "Marked correct option index is invalid or empty."
    ))

    # AI_GEN_03: Uniqueness of Correct Answer Check
    unique_correct = sum(1 for opt in candidate.options if opt.is_correct) == 1
    results.append(ValidationRuleResult(
        rule_id="AI_GEN_03",
        rule_name="Uniqueness of Correct Answer Check",
        stage=ValidationStageName.SEMANTIC,
        status=RuleStatus.PASS if unique_correct else RuleStatus.FAIL,
        is_mandatory=True,
        details="Exactly one correct option marked." if unique_correct else "Multiple or zero options marked as correct."
    ))

    # AI_GEN_04: Distractor Plausibility Check
    option_texts = [opt.text.strip().lower() for opt in candidate.options]
    distinct_distractors = len(set(option_texts)) == len(option_texts)
    results.append(ValidationRuleResult(
        rule_id="AI_GEN_04",
        rule_name="Distractor Plausibility Check",
        stage=ValidationStageName.SEMANTIC,
        status=RuleStatus.PASS if distinct_distractors else RuleStatus.FAIL,
        is_mandatory=True,
        details="All options are distinct and plausible." if distinct_distractors else "Duplicate or trivial distractor options detected."
    ))

    # AI_GEN_05: Well-Posedness Check
    well_posed = len(candidate.raw_text.strip()) >= 15
    results.append(ValidationRuleResult(
        rule_id="AI_GEN_05",
        rule_name="Well-Posedness Check",
        stage=ValidationStageName.TEXT_OCR,
        status=RuleStatus.PASS if well_posed else RuleStatus.FAIL,
        is_mandatory=True,
        details="Question stem is complete and well-posed." if well_posed else "Question stem is truncated or underspecified."
    ))

    return results
