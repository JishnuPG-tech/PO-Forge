import sqlite3
import os
import sys

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app.services.validation_engine import MultiLayerValidationFramework
from backend.app.services.document_intelligence.schemas import QuestionCandidate, ExtractedOption, ExtractedSourceLocation

def remediate_database(db_path: str = "poforge_prod.db"):
    print("=========================================================")
    print(f"   CORPUS VALIDATION STATUS REMEDIATION: {db_path}")
    print("=========================================================")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT q.id, q.text, q.subject_id, q.topic_id, q.publication_status,
               q.correct_option_index
        FROM questions q
        ORDER BY q.id
    """)
    questions_raw = cursor.fetchall()
    print(f"Total questions in {db_path}: {len(questions_raw)}")

    framework = MultiLayerValidationFramework()

    validated_ids = []
    quarantined_ids = []

    for q_row in questions_raw:
        q_id, stem, subj, topic, pub_status, q_correct_idx = q_row

        cursor.execute("""
            SELECT option_index, option_label, text, is_correct
            FROM question_options
            WHERE question_id = ?
            ORDER BY option_index
        """, (q_id,))
        options_raw = cursor.fetchall()

        options = [
            ExtractedOption(
                index=opt_idx,
                label=label or f"({chr(65+opt_idx)})",
                text=opt_text or "",
                is_correct=bool(is_correct)
            )
            for opt_idx, label, opt_text, is_correct in options_raw
        ]

        cand = QuestionCandidate(
            candidate_id=q_id,
            raw_text=stem,
            normalized_text=stem,
            structured_text=stem,
            options=options,
            option_count=len(options),
            correct_option_index=q_correct_idx,
            subject_code="QUANT",
            topic_code="SIMPLIFICATION",
            source_location=ExtractedSourceLocation(document_id="DOC_TB_CH01", page_number=1)
        )

        report = framework.evaluate_candidate(cand)

        if report.mandatory_rules_passed and len(report.anomalies) == 0:
            validated_ids.append(q_id)
        else:
            quarantined_ids.append(q_id)

    # 1. Update 74 Validated Questions -> PUBLISHED & VALIDATED
    cursor.executemany("""
        UPDATE questions
        SET publication_status = 'PUBLISHED',
            validation_status = 'VALIDATED'
        WHERE id = ?
    """, [(qid,) for qid in validated_ids])

    # 2. Update 276 Anomalous Questions -> REVIEW_REQUIRED & FLAGGED
    cursor.executemany("""
        UPDATE questions
        SET publication_status = 'REVIEW_REQUIRED',
            validation_status = 'FLAGGED'
        WHERE id = ?
    """, [(qid,) for qid in quarantined_ids])

    conn.commit()

    # Verification query
    cursor.execute("""
        SELECT publication_status, validation_status, count(*)
        FROM questions
        GROUP BY publication_status, validation_status
    """)
    distribution = cursor.fetchall()

    print("---------------------------------------------------------")
    print(f"Validated (PUBLISHED / VALIDATED):    {len(validated_ids)}")
    print(f"Quarantined (REVIEW_REQUIRED / FLAGGED): {len(quarantined_ids)}")
    print(f"Post-Remediation DB Distribution: {distribution}")
    print("---------------------------------------------------------")

    conn.close()

if __name__ == "__main__":
    remediate_database("poforge_prod.db")
    if os.path.exists("test_migrated.db"):
        remediate_database("test_migrated.db")
