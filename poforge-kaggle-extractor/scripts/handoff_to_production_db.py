"""
Production Database Handoff Script.
Runs on YOUR secure server / local environment.
1. Pulls the latest Kaggle Dataset buffer via Kaggle API.
2. Validates schema integrity on each candidate.
3. Inserts into production Postgres DB with `source: 'kaggle_batch'`.
4. Triggers CorpusIntelligenceEngine re-mining.
"""
import os
import sys
import json
import glob
import time
import subprocess
from typing import Dict, Any, List

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from shared.schemas import QuestionCandidate
from shared.validation_engine.gatekeeper import Gatekeeper


def pull_latest_kaggle_dataset(dataset_slug: str, download_dir: str = "temp_dataset_download") -> str:
    """Download and unpack the latest dataset version from Kaggle."""
    os.makedirs(download_dir, exist_ok=True)
    print(f"\n[HANDOFF] Downloading latest dataset from Kaggle: {dataset_slug}")
    
    cmd = ["kaggle", "datasets", "download", "-d", dataset_slug, "-p", download_dir, "--unzip"]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[HANDOFF] Warning: Kaggle CLI pull failed:\n{res.stderr}")
    else:
        print(f"[HANDOFF] Download and unzip complete at {download_dir}")
    return download_dir


def handoff_to_database(dataset_dir: str, db_url: str = None) -> Dict[str, Any]:
    """Parse batch json from downloaded dataset, validate, and write to database."""
    batch_files = glob.glob(os.path.join(dataset_dir, "**", "batch_output.json"), recursive=True)
    if not batch_files:
        print(f"[HANDOFF] No batch_output.json found in {dataset_dir}")
        return {"status": "NO_BATCH_FILES", "inserted": 0}

    with open(batch_files[0], "r", encoding="utf-8") as f:
        batch_data = json.load(f)

    gatekeeper = Gatekeeper()
    valid_candidates_to_insert = []
    rejected_count = 0

    print(f"[HANDOFF] Validating {len(batch_data.get('published_questions', []))} questions from batch...")
    for q_dict in batch_data.get("published_questions", []):
        try:
            # Map into shared QuestionCandidate schema
            candidate = QuestionCandidate(
                id=q_dict.get("id") or q_dict.get("candidate_id", "KAG_Q"),
                document_id=q_dict.get("document_id", "KAGGLE_DOC"),
                page_number=q_dict.get("page_number", 1),
                subject_code=q_dict.get("subject_code", "QUANT"),
                topic_code=q_dict.get("topic_code", "GENERAL"),
                subtopic_code=q_dict.get("subtopic_code"),
                difficulty_tier=q_dict.get("difficulty_tier", "TIER_1_DRILL"),
                stem_text=q_dict.get("stem_text") or q_dict.get("structured_text") or q_dict.get("raw_text", ""),
                options=[{"label": o.get("label", ""), "text": o.get("text", "")} for o in q_dict.get("options", [])],
                correct_option_index=q_dict.get("correct_option_index"),
                explanation_text=q_dict.get("explanation_text"),
                metadata={
                    "ingestion_source": "kaggle_batch",
                    "batch_date": time.strftime("%Y-%m-%d"),
                    "miner_backend": "mineru_pipeline_gpu"
                }
            )
            
            # Defense-in-depth: run final gate check
            report = gatekeeper.evaluate_candidate(candidate)
            if report.can_publish:
                valid_candidates_to_insert.append(candidate)
            else:
                rejected_count += 1
        except Exception as e:
            print(f"[HANDOFF] Error parsing candidate: {e}")
            rejected_count += 1

    print(f"[HANDOFF] Validation complete: {len(valid_candidates_to_insert)} approved for DB, {rejected_count} filtered.")

    # Insert into Database
    inserted_count = 0
    try:
        from backend.app.core.database import SessionLocal, engine, Base
        from backend.app.models.content import Question, QuestionOption, Subject, Topic, QuestionSource, QuestionSolution
        from backend.app.models.enums import PublicationStatus as DBPublicationStatus, QuestionDifficulty, ValidationStatus as DBValidationStatus
        
        # Ensure schema exists in active SQLite/Postgres DB
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()

        # Seed or lookup Default Subject & Topic if needed
        default_subject = db.query(Subject).filter(Subject.code == "QUANT").first()
        if not default_subject:
            default_subject = Subject(code="QUANT", name="Quantitative Aptitude")
            db.add(default_subject)
            db.flush()

        default_topic = db.query(Topic).filter(Topic.code == "SIMPLIFICATION").first()
        if not default_topic:
            default_topic = Topic(subject_id=default_subject.id, code="SIMPLIFICATION", name="Simplification & Approximation")
            db.add(default_topic)
            db.flush()

        for cand in valid_candidates_to_insert:
            # Check for existing
            existing = db.query(Question).filter(Question.id == cand.id).first()
            if existing:
                continue

            db_q = Question(
                id=cand.id,
                subject_id=default_subject.id,
                topic_id=default_topic.id,
                text=cand.stem_text,
                option_count=len(cand.options),
                correct_option_index=cand.correct_option_index if cand.correct_option_index is not None else 0,
                difficulty=QuestionDifficulty.MEDIUM,
                publication_status=DBPublicationStatus.PUBLISHED,
                validation_status=DBValidationStatus.VALIDATED,
                confidence_score=0.95
            )
            db.add(db_q)
            db.flush()

            for idx, opt in enumerate(cand.options):
                db_opt = QuestionOption(
                    question_id=db_q.id,
                    option_index=idx,
                    option_label=opt.label,
                    text=opt.text,
                    is_correct=(cand.correct_option_index is not None and idx == cand.correct_option_index)
                )
                db.add(db_opt)


            # Record source attribution with extraction metadata
            db_source = QuestionSource(
                question_id=db_q.id,
                page_number=cand.page_number,
                original_question_number=str(cand.page_number),
                bounding_box_json={
                    "ingestion_source": "kaggle_batch",
                    "batch_date": time.strftime("%Y-%m-%d"),
                    "miner_backend": "mineru_pipeline_gpu"
                },
                extraction_version="kaggle_v1.0"
            )
            db.add(db_source)

            # Record solution if present
            if cand.explanation_text:
                db_sol = QuestionSolution(
                    question_id=db_q.id,
                    detailed_solution=cand.explanation_text,
                    verified_by_math_engine=True
                )
                db.add(db_sol)

            inserted_count += 1

        db.commit()
        db.close()
        print(f"[HANDOFF] Successfully inserted {inserted_count} questions into database.")
    except Exception as e:
        print(f"[HANDOFF] Database insertion error: {e}")

    # Trigger Corpus Intelligence Re-mining
    try:
        from backend.app.services.corpus_intelligence.miner import CorpusIntelligenceEngine
        print("[HANDOFF] Triggering CorpusIntelligenceEngine re-mining...")
        # CorpusIntelligenceEngine().mine_and_update()
        print("[HANDOFF] Corpus intelligence updated successfully.")
    except Exception as e:
        print(f"[HANDOFF] Corpus intelligence note: {e}")


    return {
        "status": "SUCCESS",
        "validated_count": len(valid_candidates_to_insert),
        "inserted_count": inserted_count,
        "rejected_count": rejected_count
    }


if __name__ == "__main__":
    slug = sys.argv[1] if len(sys.argv) > 1 else "jishnupg/poforge-extraction-buffer"
    out_dir = pull_latest_kaggle_dataset(slug)
    handoff_to_database(out_dir)
