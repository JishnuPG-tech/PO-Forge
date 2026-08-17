import sqlite3
import json
import re
import os
import sys
from typing import List, Dict, Any

# Ensure project root is in sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app.services.math_verifier import verify_question_mathematically, solve_equation_for_unknown
from backend.app.services.document_intelligence.schemas import ExtractedOption

def rescan_database_math(db_path: str = "poforge_prod.db"):
    print("=========================================================")
    print(f"   RE-SCANNING DATABASE FOR MATH VERIFICATION: {db_path} ")
    print("=========================================================")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Query all questions, options, and solutions
    cursor.execute("""
        SELECT q.id, q.text, q.subject_id, q.topic_id, q.publication_status,
               q.correct_option_index, s.detailed_solution, s.shortcut_method
        FROM questions q
        LEFT JOIN question_solutions s ON q.id = s.question_id
        ORDER BY q.id
    """)
    questions_raw = cursor.fetchall()

    print(f"Total questions in database: {len(questions_raw)}")

    command_verb_pattern = re.compile(
        r'^\s*(?:Q\d+[\.\:\)]*|\d+[\.\)]*)?\s*(?:Calculate|Find|Solve|Evaluate|What\s+is|Determine|Compute|Simplify|Value\s+of)',
        re.IGNORECASE
    )

    scanned_count = 0
    command_verb_count = 0
    math_equation_count = 0
    verified_pass_count = 0
    discrepancy_count = 0
    inconclusive_count = 0

    discrepancy_details = []
    verified_details = []

    for q_row in questions_raw:
        q_id, stem, subj, topic, pub_status, q_correct_idx, exp, shortcut = q_row
        scanned_count += 1

        # Fetch options
        cursor.execute("""
            SELECT option_index, option_label, text, is_correct
            FROM question_options
            WHERE question_id = ?
            ORDER BY option_index
        """, (q_id,))
        options_raw = cursor.fetchall()

        options: List[ExtractedOption] = []
        correct_idx = q_correct_idx

        for opt_row in options_raw:
            opt_idx, label, opt_text, is_correct = opt_row
            options.append(ExtractedOption(
                index=opt_idx,
                label=label or f"({chr(65+opt_idx)})",
                text=opt_text or "",
                is_correct=bool(is_correct)
            ))
            if is_correct and correct_idx is None:
                correct_idx = opt_idx

        is_command_stem = bool(command_verb_pattern.search(stem))
        if is_command_stem:
            command_verb_count += 1

        has_equation = "=" in stem or any(op in stem for op in ["×", "÷", "% of", "+", "-"])
        if has_equation:
            math_equation_count += 1

        # Run math verifier
        is_math_valid, math_msg, verified_idx = verify_question_mathematically(stem, options, correct_idx)

        if not is_math_valid:
            discrepancy_count += 1
            discrepancy_details.append({
                "question_id": q_id,
                "stem": stem[:120],
                "options": [f"{o.label}: {o.text}" for o in options],
                "marked_correct_idx": correct_idx,
                "verified_idx": verified_idx,
                "error_message": math_msg
            })
        elif "SymPy math verified" in math_msg:
            verified_pass_count += 1
            verified_details.append({
                "question_id": q_id,
                "stem": stem[:80],
                "message": math_msg
            })
        else:
            inconclusive_count += 1

    conn.close()

    print("---------------------------------------------------------")
    print(f"Scanned Questions:             {scanned_count}")
    print(f"Command-Verb Stems:            {command_verb_count}")
    print(f"Equation/Math Stems:           {math_equation_count}")
    print(f"SymPy Verified Mathematically: {verified_pass_count}")
    print(f"Deterministic Inconclusive:    {inconclusive_count}")
    print(f"Math Discrepancies Flagged:    {discrepancy_count}")
    print("---------------------------------------------------------")

    if discrepancy_count > 0:
        print("\n[ALERT] DISCREPANCIES DETECTED IN PRODUCTION DB:")
        for d in discrepancy_details:
            print(f"- Question {d['question_id']}: {d['error_message']}")
            print(f"  Stem: {d['stem']}")
            print(f"  Options: {d['options']}")
    else:
        print("\n[CONFIRMED] Zero mathematical discrepancies detected across all production questions.")

    if verified_details:
        print(f"\nSample of {len(verified_details)} SymPy Mathematically Verified Questions:")
        for v in verified_details[:5]:
            print(f"  - [{v['question_id']}] {v['stem']} -> {v['message']}")

    return {
        "scanned_count": scanned_count,
        "command_verb_count": command_verb_count,
        "verified_pass_count": verified_pass_count,
        "discrepancy_count": discrepancy_count,
        "discrepancies": discrepancy_details
    }

if __name__ == "__main__":
    rescan_database_math()
