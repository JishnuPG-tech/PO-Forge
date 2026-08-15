import time
from typing import List, Tuple, Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.services.document_intelligence.schemas import (
    QuestionCandidate, DocumentForensicsReport, ProcessingReport,
    ExtractionStatus, StructureStatus, OptionStatus, AnswerStatus,
    AnomalyStatus, VerificationStatus
)
from backend.app.services.document_intelligence.security_forensics import run_pdf_forensics
from backend.app.services.document_intelligence.layout_ocr import extract_page_text_with_ocr
from backend.app.services.document_intelligence.boundary_parser import segment_questions_from_pages
from backend.app.services.document_intelligence.unicode_validator import check_and_preserve_unicode
from backend.app.services.math_verifier import verify_question_mathematically
from backend.app.models.content import (
    Document, DocumentPage, Question, QuestionOption, QuestionSolution, QuestionSource, QuestionAnomaly
)
from backend.app.models.enums import PublicationStatus, ValidationStatus, AnomalyType, DocumentType

class DocumentIntelligencePipeline:

    def __init__(self, db_session: Optional[Session] = None):
        self.db = db_session

    def process_document(
        self,
        file_bytes: Optional[bytes] = None,
        filename: str = "document.pdf",
        raw_bytes: Optional[bytes] = None,
        document_id: Optional[str] = None,
        subject_code: str = "QUANT",
        topic_code: str = "SIMPLIFICATION"
    ) -> Tuple[List[QuestionCandidate], ProcessingReport]:
        data_bytes = file_bytes or raw_bytes
        if not data_bytes:
            raise ValueError("No document bytes provided.")
        start_time = time.time()
        
        # 1 - 4: Security & Forensics
        forensics: DocumentForensicsReport = run_pdf_forensics(data_bytes, filename)
        if not forensics.security_passed:
            raise ValueError(f"Security check failed for document {filename}")

        # 5 - 11: Render, OCR & Text Extraction per page
        pages_text: Dict[int, str] = {}
        total_ocr_pages = 0
        total_raw_len = 0
        
        for p in range(1, forensics.page_count + 1):
            page_text = extract_page_text_with_ocr(file_bytes, p)
            pages_text[p] = page_text
            total_raw_len += len(page_text)
            if "[OCR Text" in page_text:
                total_ocr_pages += 1

        # 12 - 18: Question Boundary, Options, Answer Key, DI set parsing
        candidates: List[QuestionCandidate] = segment_questions_from_pages(pages_text, document_id=forensics.file_hash[:8])
        
        # 19 - 25: Unicode Validation, Math Verification, Anomaly & Confidence Scoring
        valid_published_count = 0
        review_required_count = 0
        rejected_count = 0
        anomalies_summary: Dict[str, int] = {}

        for cand in candidates:
            cand.anomalies_detected = []
            # 19: Unicode & corruption check
            norm_text, unicode_anomalies = check_and_preserve_unicode(cand.normalized_text)
            cand.normalized_text = norm_text
            cand.anomalies_detected.extend(unicode_anomalies)

            # 22: Mathematical verification for Quantitative Aptitude
            if cand.subject_code == "QUANT":
                is_math_valid, math_msg, verified_answer_idx = verify_question_mathematically(
                    cand.normalized_text, cand.options, cand.correct_option_index
                )
                if is_math_valid:
                    cand.verification_status = VerificationStatus.VERIFIED_MATH
                else:
                    cand.verification_status = VerificationStatus.DISCREPANCY_FLAGGED
                    cand.anomalies_detected.append(f"MATH_DISCREPANCY: {math_msg}")

            # Confidence scoring & Anomaly status assignment
            score = 1.0
            if cand.option_status not in [OptionStatus.VALID_4, OptionStatus.VALID_5]:
                score -= 0.3
                cand.anomalies_detected.append("INVALID_OPTION_COUNT")
            if cand.answer_status == AnswerStatus.MISSING:
                score -= 0.3
                cand.anomalies_detected.append("MISSING_ANSWER_KEY")
            elif cand.answer_status == AnswerStatus.OUT_OF_BOUNDS:
                score -= 0.4
                cand.anomalies_detected.append("ANSWER_OUT_OF_BOUNDS")
            if cand.verification_status == VerificationStatus.DISCREPANCY_FLAGGED:
                score -= 0.3
            if cand.anomalies_detected:
                score -= 0.1 * len(cand.anomalies_detected)

            cand.confidence_score = max(0.0, min(1.0, round(score, 2)))

            # Categorize candidate review requirements
            if cand.confidence_score >= 0.85 and not cand.anomalies_detected:
                cand.anomaly_status = AnomalyStatus.NONE
                valid_published_count += 1
            elif cand.confidence_score >= 0.5:
                cand.anomaly_status = AnomalyStatus.MEDIUM_SEVERITY
                review_required_count += 1
            else:
                cand.anomaly_status = AnomalyStatus.CRITICAL_SEVERITY
                rejected_count += 1

            # Update anomaly summary counts
            for a in cand.anomalies_detected:
                a_type = a.split(":")[0]
                anomalies_summary[a_type] = anomalies_summary.get(a_type, 0) + 1

        # 26 - 29: Database Persistence if DB session is active
        doc_id = forensics.file_hash[:8]
        if self.db:
            db_doc = Document(
                id=doc_id,
                title=filename,
                original_filename=filename,
                file_hash=forensics.file_hash,
                file_path=f"/storage/documents/{filename}",
                doc_type=DocumentType.PDF if forensics.doc_type == "PDF" else DocumentType.SCANNED_PDF,
                file_size_bytes=forensics.file_size_bytes,
                page_count=forensics.page_count
            )
            self.db.add(db_doc)
            self.db.flush()

            for p_num, p_txt in pages_text.items():
                self.db.add(DocumentPage(
                    document_id=doc_id,
                    page_number=p_num,
                    ocr_raw_text=p_txt,
                    unicode_clean_text=p_txt
                ))
            self.db.commit()

        elapsed_time = round(time.time() - start_time, 3)

        report = ProcessingReport(
            document_id=doc_id,
            file_name=filename,
            total_pages_processed=forensics.page_count,
            total_raw_text_length=total_raw_len,
            total_questions_extracted=len(candidates),
            valid_published_candidates=valid_published_count,
            review_required_candidates=review_required_count,
            rejected_candidates=rejected_count,
            anomalies_summary=anomalies_summary,
            ocr_pages_count=total_ocr_pages,
            di_sets_found=len(set(c.di_set_id for c in candidates if c.di_set_id)),
            processing_time_seconds=elapsed_time,
            quality_gate_passed=(rejected_count == 0 and valid_published_count > 0)
        )

        return candidates, report
