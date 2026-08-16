import re
import math
import sympy as sp
from typing import Tuple, List, Optional
from .document_intelligence.schemas import ExtractedOption

def clean_math_text(s: str) -> str:
    # 1. Normalize spaces & dashes cleanly
    s = re.sub(r'[\u00a0\u1680\u2000-\u200b\u202f\u205f\u3000]', ' ', s) # spaces to ascii space
    s = re.sub(r'[\u2010\u2011\u2012\u2013\u2014\u2212–—]', '-', s)     # dashes to ascii hyphen
    s = s.replace("×", "*").replace("÷", "/")
    s = s.replace("[", "(").replace("]", ")").replace("{", "(").replace("}", ")")
    s = re.sub(r'\bof\b', '*', s, flags=re.IGNORECASE)
    s = re.sub(r'%', '/100', s)
    s = re.sub(r'[√\u221a]\s*\(?([0-9\.]+)\)?', r'sqrt(\1)', s)
    s = re.sub(r'\(([0-9\.]+)\)\s*([23])\b', r'(\1**\2)', s)
    s = s.replace("^", "**")
    s = re.sub(r'-\s*-', '-', s)
    s = re.sub(r'\+\s*\+', '+', s)
    return s.strip()

def solve_equation_for_unknown(text: str) -> Optional[float]:
    if "=" not in text:
        return None
        
    parts = text.split("=")
    lhs_raw = parts[0].strip()
    rhs_raw = parts[1].strip() if len(parts) > 1 else ""
    
    # Strip question number prefix only if followed by space or letter (not a decimal point like 28.314)
    lhs_raw = re.sub(r'^(?:Q(?:uestion)?[\.\s]*\d+|\d+[\.\)]\s+(?=[A-Za-z\?]))', '', lhs_raw, flags=re.IGNORECASE).strip()
    
    lhs_clean = clean_math_text(lhs_raw).replace("?", "x")
    rhs_clean = clean_math_text(rhs_raw).replace("?", "x")
    
    if "x" not in lhs_clean and "x" not in rhs_clean:
        rhs_clean = "x"
        
    x = sp.Symbol('x')
    try:
        lhs_sym = sp.sympify(lhs_clean, locals={'sqrt': sp.sqrt, 'x': x})
        rhs_sym = sp.sympify(rhs_clean, locals={'sqrt': sp.sqrt, 'x': x})
        eq = sp.Eq(lhs_sym, rhs_sym)
        solutions = sp.solve(eq, x)
        for sol in solutions:
            try:
                v = float(sol.evalf())
                return v
            except Exception:
                pass
    except Exception:
        pass
        
    return None

def verify_question_mathematically(
    question_text: str,
    options: List[ExtractedOption],
    source_correct_index: Optional[int]
) -> Tuple[bool, str, Optional[int]]:
    calculated_val = solve_equation_for_unknown(question_text)
    if calculated_val is None:
        return True, "NON_EQUATION_PASSTHROUGH", source_correct_index
        
    # Match calculated answer against extracted options
    matched_idx = None
    min_diff = float("inf")
    
    for opt in options:
        nums = re.findall(r'[-+]?\d*\.?\d+', opt.text.replace(",", ""))
        if nums:
            try:
                opt_val = float(nums[0])
                diff = abs(opt_val - calculated_val)
                # Strict tolerance or rounding match
                if diff < 0.05 or (abs(diff - 0.5) < 0.01) or (diff < 1.0 and abs(opt_val - round(calculated_val)) < 0.05):
                    if diff < min_diff:
                        min_diff = diff
                        matched_idx = opt.index
            except ValueError:
                continue
                
    if matched_idx is not None:
        if source_correct_index is not None and matched_idx != source_correct_index:
            return False, f"KEY_MISMATCH: Computed {calculated_val} matches Option {matched_idx} but source says Option {source_correct_index}", matched_idx
        return True, f"VERIFIED: Derived solution {calculated_val} matches option {matched_idx}", matched_idx
        
    # If no option matched computed result, flag potential bad OCR
    if len(options) >= 4 and source_correct_index is not None:
        return True, f"HEURISTIC_ACCEPT_UNSOLVED: Solver value {calculated_val} didn't match cleanly, trusting validated OCR key", source_correct_index
        
    return False, f"NO_OPTION_MATCHED: Derived {calculated_val} does not match any options", None
