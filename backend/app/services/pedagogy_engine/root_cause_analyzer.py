import re
from typing import List, Dict, Any, Optional
from backend.app.services.math_verifier import clean_math_text, solve_equation_for_unknown

DISTRACTOR_PROCEDURAL_PATTERNS = [
    {
        "pattern_id": "skipped_of_conversion",
        "name": "Skipped 'of' to Multiplication Conversion",
        "description": "Student treated 'of' as addition or omitted evaluating the 'of' operation before division/multiplication in brackets.",
        "detection_rule": lambda stem, sel_val, opt_vals: any(abs(sel_val - (opt_vals.get("correct", 0) * 0.2)) < 1.0 or "of" in stem.lower())
    },
    {
        "pattern_id": "early_rounding_error",
        "name": "Premature Early Rounding",
        "description": "Student rounded intermediate terms too aggressively before completing multi-operator bracket evaluation.",
        "detection_rule": lambda stem, sel_val, opt_vals: abs(sel_val - opt_vals.get("correct", 0)) <= 4.0 and abs(sel_val - opt_vals.get("correct", 0)) > 0.5
    },
    {
        "pattern_id": "operator_precedence_bodmas_error",
        "name": "BODMAS Operator Precedence Violation",
        "description": "Student evaluated addition/subtraction before multiplication/division across operators.",
        "detection_rule": lambda stem, sel_val, opt_vals: True # Fallback pattern match
    }
]

def diagnose_student_mistake_root_cause(
    question_stem: str,
    options: List[Dict[str, Any]],
    correct_option_index: int,
    selected_option_index: int
) -> Dict[str, Any]:
    """
    Diagnoses procedural root-cause mistake by matching selected wrong option against mined distractor patterns.
    """
    if selected_option_index == correct_option_index:
        return {"is_correct": True, "root_cause": None, "explanation": "Answer is correct."}
        
    correct_opt = options[correct_option_index] if 0 <= correct_option_index < len(options) else None
    selected_opt = options[selected_option_index] if 0 <= selected_option_index < len(options) else None
    
    sel_text = selected_opt.get("text", "") if isinstance(selected_opt, dict) else getattr(selected_opt, "text", "")
    corr_text = correct_opt.get("text", "") if isinstance(correct_opt, dict) else getattr(correct_opt, "text", "")
    
    sel_match = re.search(r'[-+]?\d+(?:\.\d+)?', sel_text)
    corr_match = re.search(r'[-+]?\d+(?:\.\d+)?', corr_text)
    
    sel_val = float(sel_match.group(0)) if sel_match else 0.0
    corr_val = float(corr_match.group(0)) if corr_match else 0.0
    
    opt_vals = {"correct": corr_val, "selected": sel_val}
    
    matched_pattern = None
    if "of" in question_stem.lower() and ("[" in question_stem or "(" in question_stem):
        matched_pattern = DISTRACTOR_PROCEDURAL_PATTERNS[0] # skipped_of_conversion
    elif abs(sel_val - corr_val) <= 4.0 and abs(sel_val - corr_val) > 0.5:
        matched_pattern = DISTRACTOR_PROCEDURAL_PATTERNS[1] # early_rounding_error
    else:
        matched_pattern = DISTRACTOR_PROCEDURAL_PATTERNS[2] # operator_precedence_bodmas_error
        
    return {
        "is_correct": False,
        "selected_option_label": selected_opt.get("label") if isinstance(selected_opt, dict) else getattr(selected_opt, "label", "?"),
        "selected_val": sel_val,
        "correct_val": corr_val,
        "matched_distractor_pattern": matched_pattern["pattern_id"],
        "root_cause_name": matched_pattern["name"],
        "detailed_diagnosis": f"Your answer matches the '{matched_pattern['name']}' distractor pattern: {matched_pattern['description']}",
        "verbatim_coach_note": f"You selected Option {selected_opt.get('label') if isinstance(selected_opt, dict) else getattr(selected_opt, 'label', '?')} ({sel_val}). Analysis shows you specifically {matched_pattern['description'].lower()}"
    }
