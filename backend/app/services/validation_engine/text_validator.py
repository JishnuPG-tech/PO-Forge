import re
from typing import List
from backend.app.services.document_intelligence.schemas import QuestionCandidate
from backend.app.services.validation_engine.schemas import (
    ValidationRuleResult, ValidationStageName, RuleStatus
)

def validate_text_and_ocr_rules(candidate: QuestionCandidate) -> List[ValidationRuleResult]:
    results = []
    text = candidate.normalized_text or ""

    # TEXT_01: Unicode validity
    if "\ufffd" not in text and "???" not in text and "\x00" not in text:
        results.append(ValidationRuleResult(
            rule_id="TEXT_01",
            stage=ValidationStageName.TEXT_OCR,
            rule_name="Unicode Integrity",
            status=RuleStatus.PASS,
            is_mandatory=True,
            details="No Unicode replacement, null byte, or question mark corruptions detected."
        ))
    else:
        results.append(ValidationRuleResult(
            rule_id="TEXT_01",
            stage=ValidationStageName.TEXT_OCR,
            rule_name="Unicode Integrity",
            status=RuleStatus.FAIL,
            is_mandatory=True,
            details="Unicode corruption, null byte (\\x00), or replacement characters (\\ufffd/???) detected."
        ))

    # TEXT_02: Malformed numbers & OCR digit substitutions (e.g. 1OOO or 1O%)
    ocr_num_anomaly = re.search(r'\b\d+[OolL]+\d*\b|\b\d*[OolL]+\d+\b', text)
    broken_decimal = re.search(r'\b\d+\s+\.\s*\d+\b', text)
    if not ocr_num_anomaly and not broken_decimal:
        results.append(ValidationRuleResult(
            rule_id="TEXT_02",
            stage=ValidationStageName.TEXT_OCR,
            rule_name="Malformed Numbers Check",
            status=RuleStatus.PASS,
            is_mandatory=True,
            details="No broken decimal points or OCR digit substitutions detected."
        ))
    else:
        results.append(ValidationRuleResult(
            rule_id="TEXT_02",
            stage=ValidationStageName.TEXT_OCR,
            rule_name="Malformed Numbers Check",
            status=RuleStatus.FAIL,
            is_mandatory=True,
            details="OCR letter-digit substitution (e.g. 1OOO) or broken decimal format detected."
        ))

    # TEXT_03: Watermark / Header Contamination
    watermark_terms = ["watermark", "sample paper", "adda247", "testbook", "downloaded from", "portal.com", "exam-toppers"]
    has_watermark = any(term in text.lower() for term in watermark_terms)
    if not has_watermark:
        results.append(ValidationRuleResult(
            rule_id="TEXT_03",
            stage=ValidationStageName.TEXT_OCR,
            rule_name="No Watermark Contamination",
            status=RuleStatus.PASS,
            is_mandatory=False,
            details="No watermark or header pollution terms found."
        ))
    else:
        results.append(ValidationRuleResult(
            rule_id="TEXT_03",
            stage=ValidationStageName.TEXT_OCR,
            rule_name="No Watermark Contamination",
            status=RuleStatus.WARNING,
            is_mandatory=False,
            details="Watermark or header pollution text detected in question stem."
        ))

    return results
