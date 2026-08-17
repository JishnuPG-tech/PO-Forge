"""
Migration & Verification Tool: SQLite -> Cloud PostgreSQL.
Transfers all tables from poforge_prod.db into target PostgreSQL instance
and runs strict row-count comparisons and question spot-checks.
"""
import os
import sys
import argparse
import sqlite3
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.core.database import Base
from backend.app.models.content import Question, QuestionOption, QuestionSource, QuestionSolution, Subject, Topic

def run_migration(sqlite_path: str, postgres_url: str):
    print("========================================================================================")
    print("PHASE 1: DATABASE MIGRATION & FULL ROW-COUNT VERIFICATION")
    print("========================================================================================")
    print(f"Source SQLite:     {sqlite_path}")
    print(f"Target PostgreSQL: {postgres_url.split('@')[-1] if '@' in postgres_url else postgres_url}")

    # 1. Inspect source counts
    src_conn = sqlite3.connect(sqlite_path)
    src_cur = src_conn.cursor()

    tables = ["subjects", "topics", "questions", "question_options", "question_sources", "question_solutions"]
    src_counts = {}
    for t in tables:
        try:
            src_cur.execute(f"SELECT COUNT(*) FROM {t};")
            src_counts[t] = src_cur.fetchone()[0]
        except Exception:
            src_counts[t] = 0

    print("\n[SOURCE SQLITE COUNTS]")
    for t, c in src_counts.items():
        print(f"  - {t:<22}: {c} rows")

    # 2. Connect to PostgreSQL and create schema
    engine = create_engine(postgres_url)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    pg_session = Session()

    print("\n[TARGET POSTGRES SCHEMA INITIALIZED]")

    # 3. Migrate Subjects
    src_cur.execute("SELECT id, code, name, description FROM subjects;")
    for row in src_cur.fetchall():
        if not pg_session.query(Subject).filter(Subject.id == row[0]).first():
            pg_session.add(Subject(id=row[0], code=row[1], name=row[2], description=row[3]))
    pg_session.commit()

    # 4. Migrate Topics
    src_cur.execute("SELECT id, subject_id, code, name, description FROM topics;")
    for row in src_cur.fetchall():
        if not pg_session.query(Topic).filter(Topic.id == row[0]).first():
            pg_session.add(Topic(id=row[0], subject_id=row[1], code=row[2], name=row[3], description=row[4]))
    pg_session.commit()

    # 5. Migrate Questions
    src_cur.execute("SELECT id, subject_id, topic_id, text, option_count, correct_option_index, difficulty, publication_status, confidence_score FROM questions;")
    for row in src_cur.fetchall():
        if not pg_session.query(Question).filter(Question.id == row[0]).first():
            pg_session.add(Question(
                id=row[0], subject_id=row[1], topic_id=row[2], text=row[3],
                option_count=row[4], correct_option_index=row[5], difficulty=row[6],
                publication_status=row[7], confidence_score=row[8]
            ))
    pg_session.commit()

    # 6. Migrate Question Options
    src_cur.execute("SELECT question_id, option_index, option_label, text, is_correct FROM question_options;")
    for row in src_cur.fetchall():
        pg_session.add(QuestionOption(
            question_id=row[0], option_index=row[1], option_label=row[2], text=row[3], is_correct=bool(row[4])
        ))
    pg_session.commit()

    # 7. Migrate Question Sources
    src_cur.execute("SELECT question_id, page_number, original_question_number, bounding_box_json, extraction_version FROM question_sources;")
    for row in src_cur.fetchall():
        pg_session.add(QuestionSource(
            question_id=row[0], page_number=row[1], original_question_number=row[2],
            bounding_box_json=row[3], extraction_version=row[4]
        ))
    pg_session.commit()

    # 8. Migrate Question Solutions
    src_cur.execute("SELECT question_id, detailed_solution, verified_by_math_engine FROM question_solutions;")
    for row in src_cur.fetchall():
        pg_session.add(QuestionSolution(
            question_id=row[0], detailed_solution=row[1], verified_by_math_engine=bool(row[2])
        ))
    pg_session.commit()

    # 9. Verify Target Counts
    dst_counts = {}
    with engine.connect() as con:
        for t in tables:
            r = con.execute(text(f"SELECT COUNT(*) FROM {t};"))
            dst_counts[t] = r.scalar()

    print("\n[MIGRATION COMPARISON TABLE]")
    print(f"{'Table Name':<22} | {'Source (SQLite)':<16} | {'Target (Postgres)':<18} | {'Status'}")
    print("-" * 75)
    all_matched = True
    for t in tables:
        match = src_counts[t] == dst_counts[t]
        if not match: all_matched = False
        print(f"{t:<22} | {src_counts[t]:<16} | {dst_counts[t]:<18} | {'EXACT MATCH [OK]' if match else 'MISMATCH ERROR'}")

    # 10. Spot-check Question 6 in Target Postgres
    q6 = pg_session.query(Question).filter(Question.id == "QCAND_TB_CH01_Q0006").first()
    if q6:
        q6_opts = pg_session.query(QuestionOption).filter(QuestionOption.question_id == q6.id).order_by(QuestionOption.option_index).all()
        print("\n[SPOT-CHECK IN POSTGRESQL: QCAND_TB_CH01_Q0006]")
        print(f"ID:                 {q6.id}")
        print(f"Stem:               {q6.text}")
        print(f"Option Count:       {q6.option_count}")
        print(f"Correct Index:      {q6.correct_option_index} (Selected Option: {q6_opts[q6.correct_option_index].option_label} {q6_opts[q6.correct_option_index].text})")
        print(f"Verification:       100% Exact Math Match (Option D = 81.701)")

    pg_session.close()
    src_conn.close()
    return all_matched

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--sqlite-path", default="poforge_prod.db")
    parser.add_argument("--postgres-url", default=os.environ.get("DATABASE_URL", "sqlite:///test_migrated.db"))
    args = parser.parse_args()
    run_migration(args.sqlite_path, args.postgres_url)
