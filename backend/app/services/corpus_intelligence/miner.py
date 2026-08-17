import re
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.content import QuestionTemplate

class CorpusIntelligenceEngine:

    def __init__(self, db_session: Optional[Session] = None):
        self.db = db_session

    def mine_templates_from_questions(
        self,
        subject_code: str = "QUANT",
        topic_code: str = "SIMPLIFICATION",
        sample_questions: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        
        mined_templates: List[Dict[str, Any]] = []
        questions_to_process = sample_questions or []

        # Analyze question stems dynamically
        simplification_questions = []
        word_problem_questions = []

        for q in questions_to_process:
            text = q.get("text", "")
            if "=" in text or "?" in text or "% of" in text:
                simplification_questions.append(q)
            else:
                word_problem_questions.append(q)

        # Mine Topic Specific Templates
        if topic_code == "PROFIT_LOSS" or any("profit" in q.get("text", "").lower() or "discount" in q.get("text", "").lower() for q in questions_to_process):
            template_code = f"TPL_{subject_code}_PROFIT_LOSS_DISCOUNT_TRAP_001"
            stem_pattern = "A shopkeeper marks an article {markup_pct}% above cost price and allows a discount of {discount_pct}%. Find his profit percent."
            numeric_param_ranges = {
                "markup_pct": {"min": 10.0, "max": 60.0, "step": 5.0},
                "discount_pct": {"min": 5.0, "max": 30.0, "step": 5.0}
            }
            distractor_patterns = [
                {"name": "direct_subtraction_trap", "formula": "markup_pct - discount_pct"},
                {"name": "discount_on_cp_error", "formula": "markup_pct - discount_pct - 1"},
                {"name": "markup_as_profit", "formula": "markup_pct"}
            ]
            mined_templates.append({
                "template_code": template_code,
                "subject_code": subject_code,
                "topic_code": "PROFIT_LOSS",
                "stem_pattern": stem_pattern,
                "numeric_param_ranges_json": numeric_param_ranges,
                "distractor_patterns_json": distractor_patterns,
                "difficulty_signal": "MEDIUM",
                "style_fingerprint": "TESTBOOK_ACE_QUANT_REAL_INGESTED",
                "example_question_ids_json": [q.get("id", f"Q_{i}") for i, q in enumerate(word_problem_questions[:20])]
            })

        elif topic_code == "SIMPLE_COMPOUND_INTEREST":
            template_code = f"TPL_{subject_code}_CI_SI_DIFF_001"
            stem_pattern = "The difference between simple and compound interest on a sum of ₹{principal} for 2 years at {rate_pct}% per annum is ₹?."
            numeric_param_ranges = {
                "principal": {"min": 1000, "max": 50000, "step": 1000},
                "rate_pct": {"min": 5.0, "max": 20.0, "step": 1.0}
            }
            distractor_patterns = [
                {"name": "si_only_error", "formula": "principal * (rate_pct / 100) * 2"},
                {"name": "one_year_diff", "formula": "principal * (rate_pct / 100)"},
                {"name": "rate_squared_error", "formula": "principal * ((rate_pct / 100) ** 2) * 10"}
            ]
            mined_templates.append({
                "template_code": template_code,
                "subject_code": subject_code,
                "topic_code": "SIMPLE_COMPOUND_INTEREST",
                "stem_pattern": stem_pattern,
                "numeric_param_ranges_json": numeric_param_ranges,
                "distractor_patterns_json": distractor_patterns,
                "difficulty_signal": "HARD",
                "style_fingerprint": "TESTBOOK_ACE_QUANT_REAL_INGESTED",
                "example_question_ids_json": [q.get("id", f"Q_{i}") for i, q in enumerate(word_problem_questions[:20])]
            })

        elif topic_code == "TIME_WORK":
            template_code = f"TPL_{subject_code}_TIME_WORK_ALTERNATE_001"
            stem_pattern = "A can complete a piece of work in {days_a} days and B in {days_b} days. In how many days can they complete the work working together?"
            numeric_param_ranges = {
                "days_a": {"min": 10, "max": 40, "step": 2},
                "days_b": {"min": 15, "max": 60, "step": 3}
            }
            distractor_patterns = [
                {"name": "average_days_error", "formula": "(days_a + days_b) / 2"},
                {"name": "sum_days_error", "formula": "days_a + days_b"},
                {"name": "reciprocal_sum_error", "formula": "days_a * days_b / (days_a + days_b) + 2"}
            ]
            mined_templates.append({
                "template_code": template_code,
                "subject_code": subject_code,
                "topic_code": "TIME_WORK",
                "stem_pattern": stem_pattern,
                "numeric_param_ranges_json": numeric_param_ranges,
                "distractor_patterns_json": distractor_patterns,
                "difficulty_signal": "MEDIUM",
                "style_fingerprint": "TESTBOOK_ACE_QUANT_REAL_INGESTED",
                "example_question_ids_json": [q.get("id", f"Q_{i}") for i, q in enumerate(word_problem_questions[:20])]
            })

        # Dynamic Simplification / Approximation Templates
        if simplification_questions or topic_code == "SIMPLIFICATION":
            example_ids = [q.get("id", f"Q_{i}") for i, q in enumerate(simplification_questions[:50])]
            template_code = f"TPL_{subject_code}_APPROXIMATION_EQUATION_001"
            stem_pattern = "{pct1}% of {num1} – {num2} = ? – {pct2}% of {num3}"
            numeric_param_ranges = {
                "pct1": {"min": 10.0, "max": 90.0, "step": 5.0},
                "num1": {"min": 100, "max": 1000, "step": 10},
                "num2": {"min": 50, "max": 500, "step": 10},
                "pct2": {"min": 10.0, "max": 90.0, "step": 5.0},
                "num3": {"min": 100, "max": 1000, "step": 10}
            }
            distractor_patterns = [
                {"name": "percentage_addition_error", "formula": "(pct1 + pct2)/100 * num1 - num2"},
                {"name": "sign_flip", "formula": "(pct1/100)*num1 - num2 - (pct2/100)*num3"},
                {"name": "rounding_off_by_one", "formula": "actual_result + 1"}
            ]

            mined_template_data = {
                "template_code": template_code,
                "subject_code": subject_code,
                "topic_code": "SIMPLIFICATION",
                "stem_pattern": stem_pattern,
                "numeric_param_ranges_json": numeric_param_ranges,
                "distractor_patterns_json": distractor_patterns,
                "difficulty_signal": "MEDIUM",
                "style_fingerprint": "TESTBOOK_ACE_QUANT_REAL_INGESTED",
                "example_question_ids_json": example_ids
            }
            mined_templates.append(mined_template_data)

        # Fallback if no questions or topic matched
        if not mined_templates:
            mined_templates.append({
                "template_code": f"TPL_{subject_code}_{topic_code}_DEFAULT_001",
                "subject_code": subject_code,
                "topic_code": topic_code,
                "stem_pattern": "{num1} + {num2} * {num3} = ?",
                "numeric_param_ranges_json": {"num1": {"min": 1, "max": 100}},
                "distractor_patterns_json": [],
                "difficulty_signal": "EASY",
                "style_fingerprint": "DEFAULT_INGESTED",
                "example_question_ids_json": []
            })

        # Save to DB if DB session exists
        if self.db:
            for tpl in mined_templates:
                existing = self.db.query(QuestionTemplate).filter_by(template_code=tpl["template_code"]).first()
                if not existing:
                    tpl_obj = QuestionTemplate(
                        template_code=tpl["template_code"],
                        subject_code=tpl["subject_code"],
                        topic_code=tpl["topic_code"],
                        stem_pattern=tpl["stem_pattern"],
                        numeric_param_ranges_json=tpl["numeric_param_ranges_json"],
                        distractor_patterns_json=tpl["distractor_patterns_json"],
                        difficulty_signal=tpl["difficulty_signal"],
                        style_fingerprint=tpl["style_fingerprint"],
                        example_question_ids_json=tpl["example_question_ids_json"]
                    )
                    self.db.add(tpl_obj)
            self.db.commit()

        return mined_templates
