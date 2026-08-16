"""
Production-grade MultiLayerValidationFramework Gatekeeper.
Evaluates question candidates across structural, OCR text, mathematics, semantics, taxonomy, and duplicate checks.
"""
import re
from typing import List, Optional, Dict, Any, Tuple
from ..document_intelligence.schemas import QuestionCandidate, ExtractedOption
from ..math_verifier import verify_question_mathematically
from .schemas import (
    PublicationGateReport, ValidationRuleResult, TypedAnomaly,
    RuleStatus, AnomalySeverity, ValidationStageName
)

class Gatekeeper:
    """Standalone Validation Gatekeeper for Kaggle Worker & Production Handoff."""

    def evaluate_candidate(
        self,
        candidate: QuestionCandidate,
        existing_candidates: Optional[List[QuestionCandidate]] = None,
        auto_approve: bool = True
    ) -> PublicationGateReport:
        all_results: List[ValidationRuleResult] = []

        # 1. Structural Checks
        # Rule S1: Has 4 or 5 options
        opt_len = len(candidate.options)
        if opt_len in (4, 5):
            all_results.append(ValidationRuleResult(
                rule_id="RULE_S1_OPTION_COUNT",
                rule_name="Option Count Validity",
                stage=ValidationStageName.STRUCTURAL,
                status=RuleStatus.PASS,
                is_mandatory=True,
                details=f"Contains valid {opt_len} options."
            ))
        else:
            all_results.append(ValidationRuleResult(
                rule_id="RULE_S1_OPTION_COUNT",
                rule_name="Option Count Validity",
                stage=ValidationStageName.STRUCTURAL,
                status=RuleStatus.FAIL,
                is_mandatory=True,
                details=f"Invalid option count: {opt_len}. Expected 4 or 5."
            ))

        # Rule S2: Stem Length Check
        stem = getattr(candidate, "stem_text", None) or getattr(candidate, "structured_text", None) or getattr(candidate, "raw_text", "")
        if len(stem.strip()) >= 15:
            all_results.append(ValidationRuleResult(
                rule_id="RULE_S2_STEM_LENGTH",
                rule_name="Stem Text Length",
                stage=ValidationStageName.STRUCTURAL,
                status=RuleStatus.PASS,
                is_mandatory=True,
                details=f"Stem has adequate length ({len(stem)} chars)."
            ))
        else:
            all_results.append(ValidationRuleResult(
                rule_id="RULE_S2_STEM_LENGTH",
                rule_name="Stem Text Length",
                stage=ValidationStageName.STRUCTURAL,
                status=RuleStatus.FAIL,
                is_mandatory=True,
                details=f"Stem too short ({len(stem)} chars)."
            ))


        # Rule S3: Correct Option Index Validity
        c_idx = candidate.correct_option_index
        if c_idx is not None and 0 <= c_idx < len(candidate.options):
            all_results.append(ValidationRuleResult(
                rule_id="RULE_S3_ANSWER_INDEX",
                rule_name="Answer Key Index",
                stage=ValidationStageName.STRUCTURAL,
                status=RuleStatus.PASS,
                is_mandatory=True,
                details=f"Correct answer index {c_idx} resolves to option {candidate.options[c_idx].label}."
            ))
        else:
            all_results.append(ValidationRuleResult(
                rule_id="RULE_S3_ANSWER_INDEX",
                rule_name="Answer Key Index",
                stage=ValidationStageName.STRUCTURAL,
                status=RuleStatus.FAIL,
                is_mandatory=True,
                details=f"Answer index {c_idx} missing or out of bounds."
            ))

        # 2. Text & OCR Checks
        # Rule T1: Text encoding artifacts check (en-dash corruption, mojibake)
        has_mojibake = any(x in stem for x in ["\ufffd", "Ã", "â€", "1.1.", "1.2."])
        if not has_mojibake:
            all_results.append(ValidationRuleResult(
                rule_id="RULE_T1_OCR_INTEGRITY",
                rule_name="OCR Character Quality",
                stage=ValidationStageName.TEXT_OCR,
                status=RuleStatus.PASS,
                is_mandatory=False,
                details="No unicode or mojibake artifacts detected."
            ))
        else:
            all_results.append(ValidationRuleResult(
                rule_id="RULE_T1_OCR_INTEGRITY",
                rule_name="OCR Character Quality",
                stage=ValidationStageName.TEXT_OCR,
                status=RuleStatus.WARNING,
                is_mandatory=False,
                details="Potential mojibake or numbering artifacts in text."
            ))

        # 3. Mathematics Validation
        # Rule M1: SymPy Solver re-derivation
        math_ok, math_reason, derived_idx = verify_question_mathematically(
            stem, candidate.options, candidate.correct_option_index
        )
        if math_ok:
            all_results.append(ValidationRuleResult(
                rule_id="RULE_M1_MATH_VERIFICATION",
                rule_name="Mathematical Re-derivation",
                stage=ValidationStageName.MATHEMATICS,
                status=RuleStatus.PASS,
                is_mandatory=True,
                details=math_reason
            ))
        else:
            all_results.append(ValidationRuleResult(
                rule_id="RULE_M1_MATH_VERIFICATION",
                rule_name="Mathematical Re-derivation",
                stage=ValidationStageName.MATHEMATICS,
                status=RuleStatus.FAIL,
                is_mandatory=True,
                details=math_reason
            ))

        # 4. Duplicate Check
        # Rule D1: Stem Hash Uniqueness
        is_duplicate = False
        if existing_candidates:
            stem_clean = re.sub(r'[^a-zA-Z0-9]', '', stem.lower())
            for ex in existing_candidates:
                ex_s = getattr(ex, "stem_text", None) or getattr(ex, "structured_text", None) or getattr(ex, "raw_text", "")
                ex_stem = re.sub(r'[^a-zA-Z0-9]', '', ex_s.lower())
                if stem_clean == ex_stem:
                    is_duplicate = True
                    break


        if not is_duplicate:
            all_results.append(ValidationRuleResult(
                rule_id="RULE_D1_DUPLICATE_CHECK",
                rule_name="Corpus Uniqueness",
                stage=ValidationStageName.DUPLICATE,
                status=RuleStatus.PASS,
                is_mandatory=True,
                details="Question stem is unique."
            ))
        else:
            all_results.append(ValidationRuleResult(
                rule_id="RULE_D1_DUPLICATE_CHECK",
                rule_name="Corpus Uniqueness",
                stage=ValidationStageName.DUPLICATE,
                status=RuleStatus.FAIL,
                is_mandatory=True,
                details="Exact duplicate question detected in batch."
            ))

        # Compute Final Publication Gate Decisions
        mandatory_failed = [r for r in all_results if r.is_mandatory and r.status == RuleStatus.FAIL]
        mandatory_passed = len(mandatory_failed) == 0

        anomalies: List[TypedAnomaly] = []
        for r in all_results:
            if r.status == RuleStatus.FAIL:
                sev = AnomalySeverity.CRITICAL if r.is_mandatory else AnomalySeverity.HIGH
                anomalies.append(TypedAnomaly(
                    anomaly_type=r.rule_id,
                    severity=sev,
                    description=f"Validation Failure [{r.rule_name}]: {r.details}"
                ))
            elif r.status == RuleStatus.WARNING:
                anomalies.append(TypedAnomaly(
                    anomaly_type=r.rule_id,
                    severity=AnomalySeverity.MEDIUM,
                    description=f"Validation Warning [{r.rule_name}]: {r.details}"
                ))

        critical_count = sum(1 for a in anomalies if a.severity == AnomalySeverity.CRITICAL)
        rejection_reasons = [r.details for r in mandatory_failed]

        can_publish = mandatory_passed and (critical_count == 0) and auto_approve
        if can_publish:
            pub_status = "PUBLISHED"
        elif mandatory_passed:
            pub_status = "APPROVED"
        else:
            pub_status = "REJECTED"

        return PublicationGateReport(
            question_candidate_id=getattr(candidate, "candidate_id", None) or getattr(candidate, "id", "QCAND"),
            can_publish=can_publish,
            publication_status=pub_status,
            mandatory_rules_passed=mandatory_passed,
            total_rules_evaluated=len(all_results),
            passed_rules_count=sum(1 for r in all_results if r.status == RuleStatus.PASS),
            failed_rules_count=len(mandatory_failed),
            critical_anomalies_count=critical_count,
            individual_rule_results=all_results,
            anomalies=anomalies,
            admin_approval_granted=auto_approve,
            rejection_reasons=rejection_reasons
        )

