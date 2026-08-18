from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from .equation_stitcher import EquationStitcher
from .option_purifier import OptionPurifier
from .math_solver_verifier import MathSolverVerifier

class RepairedQuestion(BaseModel):
    id: str
    subject_code: str
    topic_code: str
    text: str
    options: List[str]
    correct_option_index: int
    explanation: str
    shortcut: Optional[str] = None
    common_trap: Optional[str] = None
    difficulty: str
    is_valid: bool
    repair_notes: List[str]

class QuestionSanitizationEngine:
    """
    End-to-end self-healing pipeline that ingests raw/corrupted questions
    and transforms them into clean, structured, mathematically verified questions.
    """

    @classmethod
    def process_raw_question(cls, raw_data: Dict[str, Any]) -> RepairedQuestion:
        q_id = raw_data.get("id") or raw_data.get("question_id", "Q_UNSET")
        subj = raw_data.get("subject_code", "QUANT")
        topic = raw_data.get("topic_code", "SIMPLIFICATION")
        diff = raw_data.get("difficulty", "MEDIUM")
        raw_stem = raw_data.get("text") or raw_data.get("stem_text", "")
        raw_options = raw_data.get("options", [])
        
        # Convert dict options to string list if needed
        if raw_options and isinstance(raw_options[0], dict):
            raw_options = [opt.get("text", "") for opt in raw_options]

        notes = []

        # Stage 1: Stitch severed equations across stem and options
        stitched_stem, remaining_options, was_stitched = EquationStitcher.stitch_stem_and_options(raw_stem, raw_options)
        if was_stitched:
            notes.append("Stitched severed equation across stem and options")

        # Stage 2: Clean and purify options to standard 5 choices
        clean_opts, opts_valid, opt_err = OptionPurifier.purify_options_list(remaining_options)
        if not opts_valid:
            notes.append(f"Option validation failed: {opt_err}")

        # Stage 3: Mathematical verification and proof generation
        sol_data = MathSolverVerifier.verify_simplification_question(stitched_stem, clean_opts)
        corr_idx = raw_data.get("correct_option_index", 0)
        
        explanation = raw_data.get("explanation") or raw_data.get("explanation_text")
        if sol_data:
            notes.append(f"Mathematically verified value: {sol_data['calculated_value']}")
            if sol_data['matched_option_index'] is not None:
                corr_idx = sol_data['matched_option_index']
            if not explanation:
                explanation = sol_data['explanation']

        if not explanation:
            explanation = f"Step 1: Analyze given problem constraints.\nStep 2: Apply core standard formulas for {topic}.\nStep 3: Option {chr(65 + corr_idx)} satisfies the solution."

        # Stage 4: Structure stem with clean display formatting
        final_stem = stitched_stem
        if "=" in final_stem and not final_stem.startswith("$$") and ("√" in final_stem or "×" in final_stem or "^" in final_stem or "%" in final_stem):
            # Put equation in clean display block if not already formatted
            lines = final_stem.split("\n")
            formatted_lines = []
            for l in lines:
                if "=" in l and ("+" in l or "-" in l or "×" in l or "÷" in l or "%" in l):
                    formatted_lines.append(f"\n$${l.strip()}$$\n")
                else:
                    formatted_lines.append(l)
            final_stem = "\n".join(formatted_lines).strip()

        is_valid = opts_valid and len(clean_opts) == 5 and len(final_stem) >= 15

        return RepairedQuestion(
            id=q_id,
            subject_code=subj,
            topic_code=topic,
            text=final_stem,
            options=clean_opts,
            correct_option_index=corr_idx,
            explanation=explanation,
            shortcut=raw_data.get("shortcut"),
            common_trap=raw_data.get("common_trap"),
            difficulty=diff,
            is_valid=is_valid,
            repair_notes=notes
        )
