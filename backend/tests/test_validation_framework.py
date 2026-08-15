import pytest
from backend.app.services.document_intelligence.schemas import (
    QuestionCandidate, ExtractedOption, ExtractedSourceLocation
)
from backend.app.services.validation_engine import (
    MultiLayerValidationFramework, RuleStatus, AnomalySeverity
)

def create_base_candidate(cand_id="QCAND_1001", q_text="A sum of ₹10,000 yields ₹1,200 simple interest in 2 years. What is the annual rate of interest?"):
    return QuestionCandidate(
        candidate_id=cand_id,
        raw_text=q_text,
        normalized_text=q_text,
        structured_text=q_text,
        options=[
            ExtractedOption(index=0, label="(A)", text="5%"),
            ExtractedOption(index=1, label="(B)", text="6%", is_correct=True),
            ExtractedOption(index=2, label="(C)", text="7%"),
            ExtractedOption(index=3, label="(D)", text="8%"),
            ExtractedOption(index=4, label="(E)", text="10%")
        ],
        option_count=5,
        correct_option_index=1,
        subject_code="QUANT",
        topic_code="SIMPLIFICATION",
        source_location=ExtractedSourceLocation(document_id="DOC1", page_number=1)
    )

def test_structural_failure_invalid_option_count():
    framework = MultiLayerValidationFramework()
    cand = create_base_candidate()
    cand.options = cand.options[:3]  # Only 3 options
    cand.option_count = 3

    report = framework.evaluate_candidate(cand)
    assert report.mandatory_rules_passed is False
    assert report.can_publish is False
    
    struct_rule = next(r for r in report.individual_rule_results if r.rule_id == "STRUCT_03")
    assert struct_rule.status == RuleStatus.FAIL

def test_structural_failure_empty_option():
    framework = MultiLayerValidationFramework()
    cand = create_base_candidate()
    cand.options[2].text = "   "  # Empty text for Option C

    report = framework.evaluate_candidate(cand)
    assert report.mandatory_rules_passed is False
    
    struct_rule = next(r for r in report.individual_rule_results if r.rule_id == "STRUCT_04")
    assert struct_rule.status == RuleStatus.FAIL

def test_structural_failure_duplicate_options():
    framework = MultiLayerValidationFramework()
    cand = create_base_candidate()
    cand.options[2].text = "6%"  # Duplicate text (Option B is also 6%)

    report = framework.evaluate_candidate(cand)
    assert report.mandatory_rules_passed is False
    
    struct_rule = next(r for r in report.individual_rule_results if r.rule_id == "STRUCT_05")
    assert struct_rule.status == RuleStatus.FAIL

def test_text_failure_unicode_corruption():
    framework = MultiLayerValidationFramework()
    cand = create_base_candidate(q_text="What is 100 * 5 = \ufffd ?")

    report = framework.evaluate_candidate(cand)
    assert report.mandatory_rules_passed is False
    
    text_rule = next(r for r in report.individual_rule_results if r.rule_id == "TEXT_01")
    assert text_rule.status == RuleStatus.FAIL

def test_math_failure_discrepancy():
    framework = MultiLayerValidationFramework()
    # 25 * 4 = 100, but source answer key claims Option B (120)
    cand = QuestionCandidate(
        candidate_id="QCAND_MATH_FAIL",
        raw_text="Calculate 25 * 4 = ?",
        normalized_text="Calculate 25 * 4 = ?",
        structured_text="Calculate 25 * 4 = ?",
        options=[
            ExtractedOption(index=0, label="(A)", text="100"),
            ExtractedOption(index=1, label="(B)", text="120", is_correct=True),
            ExtractedOption(index=2, label="(C)", text="140"),
            ExtractedOption(index=3, label="(D)", text="160")
        ],
        option_count=4,
        correct_option_index=1, # Claims B (120)
        subject_code="QUANT",
        topic_code="SIMPLIFICATION",
        source_location=ExtractedSourceLocation(document_id="DOC1", page_number=1)
    )

    report = framework.evaluate_candidate(cand)
    assert report.mandatory_rules_passed is False
    
    math_rule = next(r for r in report.individual_rule_results if r.rule_id == "MATH_01")
    assert math_rule.status == RuleStatus.FAIL

def test_taxonomy_failure_invalid_subject():
    framework = MultiLayerValidationFramework()
    cand = create_base_candidate()
    cand.subject_code = "PHYSICS_NOT_BANKING"

    report = framework.evaluate_candidate(cand)
    assert report.mandatory_rules_passed is False
    
    tax_rule = next(r for r in report.individual_rule_results if r.rule_id == "TAX_01")
    assert tax_rule.status == RuleStatus.FAIL

def test_duplicate_failure_exact_duplicate():
    framework = MultiLayerValidationFramework()
    cand1 = create_base_candidate(cand_id="QCAND_1")
    cand2 = create_base_candidate(cand_id="QCAND_2")

    report = framework.evaluate_candidate(cand2, existing_candidates=[cand1])
    assert report.mandatory_rules_passed is False
    
    dup_rule = next(r for r in report.individual_rule_results if r.rule_id == "DUP_01")
    assert dup_rule.status == RuleStatus.FAIL

def test_publication_gate_approval_workflow():
    framework = MultiLayerValidationFramework()
    cand = create_base_candidate()

    # Step 1: Evaluate candidate without admin approval
    report_unapproved = framework.evaluate_candidate(cand, admin_approval_granted=False)
    assert report_unapproved.mandatory_rules_passed is True
    assert report_unapproved.critical_anomalies_count == 0
    assert report_unapproved.can_publish is False
    assert report_unapproved.publication_status == "APPROVED"  # Valid candidate awaiting admin approval

    # Step 2: Grant Admin explicit approval
    report_approved = framework.evaluate_candidate(cand, admin_approval_granted=True)
    assert report_approved.mandatory_rules_passed is True
    assert report_approved.can_publish is True
    assert report_approved.publication_status == "PUBLISHED"

if __name__ == "__main__":
    pytest.main(["-v", __file__])
