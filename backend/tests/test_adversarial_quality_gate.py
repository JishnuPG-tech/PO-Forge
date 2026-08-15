import pytest
from backend.tests.fixtures import get_all_adversarial_fixtures
from backend.app.services.validation_engine import MultiLayerValidationFramework
from backend.app.services.document_intelligence.schemas import (
    QuestionCandidate, ExtractedOption, ExtractedSourceLocation
)

def test_adversarial_fixtures_rejection_quality_gate():
    framework = MultiLayerValidationFramework()
    fixtures = get_all_adversarial_fixtures()

    for idx, fix in enumerate(fixtures, start=1):
        q_data = fix["question"]
        
        extracted_opts = [
            ExtractedOption(index=i, label=f"({chr(65+i)})", text=opt_str)
            for i, opt_str in enumerate(q_data["options"])
        ]
        
        corr_idx = q_data.get("correct_option_index")
        if corr_idx is not None and 0 <= corr_idx < len(extracted_opts):
            extracted_opts[corr_idx].is_correct = True

        cand = QuestionCandidate(
            candidate_id=f"ADV_CAND_{idx:02d}",
            raw_text=q_data["text"],
            normalized_text=q_data["text"],
            structured_text=q_data["text"],
            options=extracted_opts,
            option_count=len(extracted_opts),
            correct_option_index=corr_idx,
            subject_code=q_data["subject_code"],
            topic_code=q_data.get("topic_code", "SIMPLIFICATION"),
            source_location=ExtractedSourceLocation(document_id="DOC_ADV", page_number=1)
        )

        existing = []
        if fix["fixture_id"] == "ADV_10_EXACT_DUPLICATE":
            existing_cand = QuestionCandidate(
                candidate_id="ADV_CAND_PREVIOUS",
                raw_text=q_data["text"],
                normalized_text=q_data["text"],
                structured_text=q_data["text"],
                options=extracted_opts,
                option_count=len(extracted_opts),
                correct_option_index=corr_idx,
                subject_code=q_data["subject_code"],
                topic_code=q_data.get("topic_code", "SIMPLIFICATION"),
                source_location=ExtractedSourceLocation(document_id="DOC_ADV", page_number=1)
            )
            existing = [existing_cand]

        report = framework.evaluate_candidate(cand, existing_candidates=existing)
        
        # PROOF: Bad content CANNOT reach publication gate
        assert report.can_publish is False, f"Fixture {fix['fixture_id']} failed to be rejected!"
        assert report.mandatory_rules_passed is False or len(report.anomalies) > 0, f"Fixture {fix['fixture_id']} passed validation without anomalies!"
