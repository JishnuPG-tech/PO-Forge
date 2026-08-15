import pytest
from backend.app.services.document_intelligence.schemas import (
    QuestionCandidate, ExtractedOption, ExtractedSourceLocation
)
from backend.app.services.validation_engine import (
    MultiLayerValidationFramework, RuleStatus
)

def create_known_good_candidate():
    return QuestionCandidate(
        candidate_id="QCAND_AI_GOOD_01",
        raw_text="A shopkeeper marks an article 40% above cost price and allows a discount of 15%. Find his profit percent.",
        normalized_text="A shopkeeper marks an article 40% above cost price and allows a discount of 15%. Find his profit percent.",
        structured_text="A shopkeeper marks an article 40% above cost price and allows a discount of 15%. Find his profit percent.",
        options=[
            ExtractedOption(index=0, label="(A)", text="15%", is_correct=False),
            ExtractedOption(index=1, label="(B)", text="18%", is_correct=False),
            ExtractedOption(index=2, label="(C)", text="19%", is_correct=True),
            ExtractedOption(index=3, label="(D)", text="21%", is_correct=False),
            ExtractedOption(index=4, label="(E)", text="None of these", is_correct=False)
        ],
        option_count=5,
        correct_option_index=2,
        subject_code="QUANT",
        topic_code="PROFIT_LOSS",
        source_location=ExtractedSourceLocation(document_id="DOC_AI_GEN", page_number=1)
    )

def test_ai_gen_known_good_candidate_passes_100_percent():
    framework = MultiLayerValidationFramework()
    cand = create_known_good_candidate()

    report = framework.evaluate_candidate(cand, admin_approval_granted=True)
    assert report.mandatory_rules_passed is True
    assert report.can_publish is True
    assert report.publication_status == "PUBLISHED"
    
    # Verify all AI_GEN rules passed
    ai_gen_rules = [r for r in report.individual_rule_results if r.rule_id.startswith("AI_GEN")]
    assert len(ai_gen_rules) == 5
    for r in ai_gen_rules:
        assert r.status == RuleStatus.PASS, f"Rule {r.rule_id} failed: {r.details}"

def test_ai_gen_01_math_re_derivation_discrepancy_rejection():
    framework = MultiLayerValidationFramework()
    cand = QuestionCandidate(
        candidate_id="QCAND_AI_FAIL_01",
        raw_text="Calculate 25 * 4 = ?",
        normalized_text="Calculate 25 * 4 = ?",
        structured_text="Calculate 25 * 4 = ?",
        options=[
            ExtractedOption(index=0, label="(A)", text="100", is_correct=False),
            ExtractedOption(index=1, label="(B)", text="120", is_correct=True), # Claims 120 (Wrong!)
            ExtractedOption(index=2, label="(C)", text="140", is_correct=False),
            ExtractedOption(index=3, label="(D)", text="160", is_correct=False)
        ],
        option_count=4,
        correct_option_index=1,
        subject_code="QUANT",
        topic_code="SIMPLIFICATION",
        source_location=ExtractedSourceLocation(document_id="DOC1", page_number=1)
    )

    report = framework.evaluate_candidate(cand, admin_approval_granted=True)
    assert report.mandatory_rules_passed is False
    assert report.can_publish is False
    
    rule = next(r for r in report.individual_rule_results if r.rule_id == "AI_GEN_01")
    assert rule.status == RuleStatus.FAIL
    assert "Independent re-derivation discrepancy" in rule.details

def test_ai_gen_02_invalid_marked_option_rejection():
    framework = MultiLayerValidationFramework()
    cand = create_known_good_candidate()
    cand.correct_option_index = 99 # Out of bounds index

    report = framework.evaluate_candidate(cand, admin_approval_granted=True)
    assert report.mandatory_rules_passed is False
    
    rule = next(r for r in report.individual_rule_results if r.rule_id == "AI_GEN_02")
    assert rule.status == RuleStatus.FAIL

def test_ai_gen_03_non_unique_correct_options_rejection():
    framework = MultiLayerValidationFramework()
    cand = create_known_good_candidate()
    cand.options[0].is_correct = True # Two options marked correct!

    report = framework.evaluate_candidate(cand, admin_approval_granted=True)
    assert report.mandatory_rules_passed is False
    
    rule = next(r for r in report.individual_rule_results if r.rule_id == "AI_GEN_03")
    assert rule.status == RuleStatus.FAIL

def test_ai_gen_04_duplicate_distractor_options_rejection():
    framework = MultiLayerValidationFramework()
    cand = create_known_good_candidate()
    cand.options[1].text = "15%" # Duplicate option text with Option (A)

    report = framework.evaluate_candidate(cand, admin_approval_granted=True)
    assert report.mandatory_rules_passed is False
    
    rule = next(r for r in report.individual_rule_results if r.rule_id == "AI_GEN_04")
    assert rule.status == RuleStatus.FAIL

def test_ai_gen_05_truncated_stem_rejection():
    framework = MultiLayerValidationFramework()
    cand = create_known_good_candidate()
    cand.raw_text = "What is ?" # Truncated stem

    report = framework.evaluate_candidate(cand, admin_approval_granted=True)
    assert report.mandatory_rules_passed is False
    
    rule = next(r for r in report.individual_rule_results if r.rule_id == "AI_GEN_05")
    assert rule.status == RuleStatus.FAIL

if __name__ == "__main__":
    pytest.main(["-v", __file__])
