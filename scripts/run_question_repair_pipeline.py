import os
import sys
import json
import sqlite3

# Set utf-8 output encoding
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.services.question_repair_pipeline import QuestionSanitizationEngine

def run_pipeline():
    print("=================================================================")
    print("[*] LAUNCHING POFORGE QUESTION REPAIR & RESTRUCTURING PIPELINE")
    print("=================================================================")

    repaired_records = []
    quarantined_records = []

    # 1. Ingest from batch_output.json if present
    batch_file = os.path.join('kaggle_run_logs', 'output', 'batch_output.json')
    
    if os.path.exists(batch_file):
        print(f"Reading raw extracted questions from {batch_file}...")
        with open(batch_file, 'r', encoding='utf-8') as f:
            raw_content = json.load(f)
            
        questions_list = raw_content.get("published_questions", []) if isinstance(raw_content, dict) else raw_content
        print(f"Loaded {len(questions_list)} raw questions from batch output. Processing through pipeline...")
        
        for raw_q in questions_list:
            if isinstance(raw_q, dict):
                res = QuestionSanitizationEngine.process_raw_question(raw_q)
                if res.is_valid:
                    repaired_records.append(res.model_dump())
                else:
                    quarantined_records.append(res.model_dump())
                    
        print(f"[+] Successfully Repaired & Structured: {len(repaired_records)} questions")
        print(f"[-] Quarantined / Unfixable Fragments: {len(quarantined_records)} questions")

    # 2. Ingest & Repair from poforge_prod.db
    db_path = 'poforge_prod.db'
    if os.path.exists(db_path):
        print("\n[*] Processing questions from poforge_prod.db...")
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        
        db_qs = c.execute("SELECT id, text, correct_option_index, difficulty, publication_status FROM questions").fetchall()
        print(f"Found {len(db_qs)} total questions in DB.")
        
        db_repaired_count = 0
        db_quarantine_count = 0
        
        for q_id, text, corr_idx, diff, pub_status in db_qs:
            raw_opts = c.execute("SELECT text FROM question_options WHERE question_id = ? ORDER BY option_index", (q_id,)).fetchall()
            options_text_list = [o[0] for o in raw_opts]
            
            raw_dict = {
                "id": q_id,
                "text": text,
                "options": options_text_list,
                "correct_option_index": corr_idx or 0,
                "difficulty": diff or "MEDIUM"
            }
            
            res = QuestionSanitizationEngine.process_raw_question(raw_dict)
            
            if res.is_valid:
                # Update as PUBLISHED with clean text
                c.execute("UPDATE questions SET text = ?, publication_status = 'PUBLISHED' WHERE id = ?", (res.text, q_id))
                c.execute("DELETE FROM question_options WHERE question_id = ?", (q_id,))
                for opt_idx, opt_text in enumerate(res.options):
                    label = f"({chr(65 + opt_idx)})"
                    opt_id = f"{q_id}_OPT_{opt_idx}"
                    is_correct_val = 1 if opt_idx == res.correct_option_index else 0
                    c.execute("INSERT OR REPLACE INTO question_options (id, question_id, option_label, text, option_index, is_correct) VALUES (?, ?, ?, ?, ?, ?)",
                              (opt_id, q_id, label, opt_text, opt_idx, is_correct_val))
                db_repaired_count += 1
            else:
                # Mark as QUARANTINED
                c.execute("UPDATE questions SET publication_status = 'QUARANTINED' WHERE id = ?", (q_id,))
                db_quarantine_count += 1
                
        conn.commit()
        
        # Summary
        status_summary = c.execute("SELECT publication_status, count(*) FROM questions GROUP BY publication_status").fetchall()
        print("\n[*] Database Summary After Full Pipeline Execution:")
        for status, count in status_summary:
            print(f"   • {status:20}: {count}")
            
        conn.close()

    # Save output verified dataset
    output_dir = os.path.join('backend', 'data')
    os.makedirs(output_dir, exist_ok=True)
    out_file = os.path.join(output_dir, 'verified_questions_dataset.json')
    
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(repaired_records, f, indent=2, ensure_ascii=False)
    print(f"\n[+] Saved verified dataset ({len(repaired_records)} items) to {out_file}")

    print("\n=================================================================")
    print("[+] QUESTION REPAIR & SANITIZATION PIPELINE COMPLETE")
    print("=================================================================")

if __name__ == '__main__':
    run_pipeline()
