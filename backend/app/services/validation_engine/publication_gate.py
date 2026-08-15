from typing import List, Optional
from backend.app.services.document_intelligence.schemas import QuestionCandidate
from backend.app.services.validation_engine.schemas import (
    PublicationGateReport, ValidationRuleResult, TypedAnomaly,
    RuleStatus, AnomalySeverity, ValidationStageName
)
from backend.app.services.validation_engine.structural_validator import validate_structural_rules
from backend.app.services.validation_engine.text_validator import validate_text_and_ocr_rules
from backend.app.services.validation_engine.math_validator import validate_mathematical_rules
from backend.app.services.validation_engine.semantic_validator import validate_semantic_rules
from backend.app.services.validation_engine.taxonomy_validator import validate_taxonomy_rules
from backend.app.services.validation_engine.duplicate_validator import validate_duplicate_rules

class MultiLayerValidationFramework:

    def evaluate_candidate(
        self,
        candidate: QuestionCandidate,
        existing_candidates: Optional[List[QuestionCandidate]] = None,
        admin_approval_granted: bool = False
    ) -> PublicationGateReport:
        
        all_results: List[ValidationRuleResult] = []
        
        # 1. Structural Stage
        all_results.extend(validate_structural_rules(candidate))
        
        # 2. Text & OCR Stage
        all_results.extend(validate_text_and_ocr_rules(candidate))
        
        # 3. Mathematics Stage
        all_results.extend(validate_mathematical_rules(candidate))
        
        # 4. Semantic Stage
        all_results.extend(validate_semantic_rules(candidate))
        
        # 5. Taxonomy Stage
        all_results.extend(validate_taxonomy_rules(candidate))
        
        # 6. Duplicate Stage
        all_results.extend(validate_duplicate_rules(candidate, existing_candidates))

        # 7. AI Generation Rigorous Verification Stage
        from backend.app.services.validation_engine.ai_gen_validator import validate_ai_generated_rules
        all_results.extend(validate_ai_generated_rules(candidate))

        # Separate mandatory pass/fail rules
        mandatory_failed = [r for r in all_results if r.is_mandatory and r.status == RuleStatus.FAIL]
        mandatory_passed = len(mandatory_failed) == 0

        # Construct Typed Anomalies
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
        if critical_count > 0:
            rejection_reasons.append(f"{critical_count} critical anomalies detected.")
        if not admin_approval_granted:
            rejection_reasons.append("Admin explicit approval has not been granted.")

        # Strict Publication Gate Logic
        can_publish = mandatory_passed and (critical_count == 0) and admin_approval_granted

        if can_publish:
            pub_status = "PUBLISHED"
        elif mandatory_passed and critical_count == 0:
            pub_status = "APPROVED" # Approved by verifier, waiting for Admin publication
        elif mandatory_passed:
            pub_status = "REVIEW_REQUIRED"
        else:
            pub_status = "DRAFT"

        return PublicationGateReport(
            question_candidate_id=candidate.candidate_id,
            can_publish=can_publish,
            publication_status=pub_status,
            mandatory_rules_passed=mandatory_passed,
            total_rules_evaluated=len(all_results),
            passed_rules_count=sum(1 for r in all_results if r.status == RuleStatus.PASS),
            failed_rules_count=len(mandatory_failed),
            critical_anomalies_count=critical_count,
            individual_rule_results=all_results,
            anomalies=anomalies,
            admin_approval_granted=admin_approval_granted,
            rejection_reasons=rejection_reasons
        )
