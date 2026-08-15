import pytest
from backend.app.services.document_intelligence.pipeline import DocumentIntelligencePipeline
from backend.app.services.document_intelligence.schemas import (
    OptionStatus, AnswerStatus, AnomalyStatus, VerificationStatus
)
from backend.app.services.document_intelligence.unicode_validator import check_and_preserve_unicode
from backend.app.services.document_intelligence.security_forensics import inspect_file_security_and_integrity

def test_security_inspection_malicious_script():
    malicious_bytes = b"%PDF-1.4 <script>alert('xss')</script> malformed pdf"
    sec_passed, msg = inspect_file_security_and_integrity(malicious_bytes, "malicious.pdf")
    assert sec_passed is False
    assert "security inspection failed" in msg.lower()

def test_unicode_symbol_preservation_and_corruption_detection():
    sample_text = "What is the profit in ₹ if cost is 1,00,000 at 15% rate? Equation: √x + 2² = 10. Broken decimal: 12 . 50"
    norm_text, anomalies = check_and_preserve_unicode(sample_text)
    
    assert "₹" in norm_text
    assert "1,00,000" in norm_text
    assert "√x" in norm_text
    assert "BROKEN_DECIMAL_POINT" in anomalies

def test_pipeline_valid_banking_exam_document():
    doc_content = """
Directions (Q. 1 - 2): Read the table below and answer the questions.
DI_SET_0001: Sales of bank branches A and B in 2025.

Q1. A sum of ₹10,000 yields ₹1,200 simple interest in 2 years. What is the annual rate of interest?
(A) 5%
(B) 6%
(C) 7%
(D) 8%
(E) 10%
Ans: (B)
Solution: Rate = (1200 * 100) / (10000 * 2) = 6%. Shortcut: 1200 / 2 = 600 per year = 6%.

Q2. If 25% of X is equal to 500, find X.
(A) 1000
(B) 1500
(C) 2000
(D) 2500
Ans: (C)
Sol: X = (500 * 100) / 25 = 2000.
"""
    pipeline = DocumentIntelligencePipeline()
    candidates, report = pipeline.process_document(doc_content.encode("utf-8"), "banking_quant_test.pdf")

    assert len(candidates) == 2
    assert report.quality_gate_passed is True
    
    q1 = candidates[0]
    assert q1.option_count == 5
    assert q1.correct_option_index == 1  # (B)
    assert q1.option_status == OptionStatus.VALID_5
    assert q1.answer_status == AnswerStatus.FOUND
    assert "₹" in q1.normalized_text

    q2 = candidates[1]
    assert q2.option_count == 4
    assert q2.correct_option_index == 2  # (C)
    assert q2.option_status == OptionStatus.VALID_4

def test_pipeline_deliberately_malformed_documents():
    malformed_content = """
Q1. Question with truncated options missing.
(A) Option A
(B) Option B
Ans: (A)

Q2. Question with out-of-bounds answer key.
(A) 10
(B) 20
(C) 30
(D) 40
Ans: (E)

Q3. Question with character corruption \ufffd and math discrepancy 25 * 4 = 100 = ?
(A) 100
(B) 120
(C) 140
(D) 160
Ans: (B)
"""
    pipeline = DocumentIntelligencePipeline()
    candidates, report = pipeline.process_document(malformed_content.encode("utf-8"), "malformed_test.pdf")

    assert len(candidates) == 3
    assert report.quality_gate_passed is False  # Rejected/Review candidates present
    
    # Candidate 1: Missing options (only 2 options)
    c1 = candidates[0]
    assert c1.option_status == OptionStatus.INVALID_COUNT
    assert "INVALID_OPTION_COUNT" in c1.anomalies_detected

    # Candidate 2: Answer out of bounds (Ans: E on 4 options)
    c2 = candidates[1]
    assert c2.answer_status == AnswerStatus.OUT_OF_BOUNDS
    assert "ANSWER_OUT_OF_BOUNDS" in c2.anomalies_detected

    # Candidate 3: Math discrepancy (25 * 4 = 100, but source answer key claims Option B = 120)
    c3 = candidates[2]
    assert c3.verification_status == VerificationStatus.DISCREPANCY_FLAGGED
    assert any("MATH_DISCREPANCY" in a for a in c3.anomalies_detected)

if __name__ == "__main__":
    pytest.main(["-v", __file__])
