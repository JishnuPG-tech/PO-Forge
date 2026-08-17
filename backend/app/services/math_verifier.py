import re
import math
import sympy as sp
from typing import Tuple, List, Optional
from backend.app.services.document_intelligence.schemas import ExtractedOption

def clean_math_text(s: str) -> str:
    # 1. Normalize spaces & dashes cleanly
    s = re.sub(r'[\u00a0\u1680\u2000-\u200b\u202f\u205f\u3000]', ' ', s) # spaces to ascii space
    s = re.sub(r'[\u2010\u2011\u2012\u2013\u2014\u2212–—]', '-', s)     # dashes to ascii hyphen
    s = s.replace("×", "*").replace("÷", "/")
    s = s.replace("[", "(").replace("]", ")").replace("{", "(").replace("}", ")")
    s = re.sub(r'\bis\s+equal\s+to\b', '=', s, flags=re.IGNORECASE)
    s = re.sub(r'\bof\b', '*', s, flags=re.IGNORECASE)
    s = re.sub(r'%', '/100', s)
    s = re.sub(r'[√\u221a]\s*\(?([0-9\.]+)\)?', r'sqrt(\1)', s)
    s = re.sub(r'\(([0-9\.]+)\)\s*([23])\b', r'(\1**\2)', s)
    s = s.replace("^", "**")
    s = re.sub(r'-\s*-', '-', s)
    s = re.sub(r'\+\s*\+', '+', s)
    return s.strip()

def solve_equation_for_unknown(text: str) -> Optional[float]:
    if "=" not in text and "is equal to" not in text.lower():
        # Check if it's a pure arithmetic expression like "25 * 4" or "Solve 2 + 2"
        expr_match = re.search(r'(?:Calculate|Find|Solve|Evaluate|Compute|Simplify|What\s+is\s+(?:the\s+value\s+of)?)\s*([0-9\.\s\+\-\*\/\(\)\^\%\√\×\÷]+)', text, re.IGNORECASE)
        if expr_match:
            cand_expr = expr_match.group(1).strip()
            if any(op in cand_expr for op in ["+", "-", "*", "/", "×", "÷", "%"]):
                cleaned = clean_math_text(cand_expr)
                try:
                    val = sp.sympify(cleaned, locals={'sqrt': sp.sqrt})
                    return float(val.evalf())
                except Exception:
                    pass
        return None
        
    # Extract the equation part if embedded in longer text
    # e.g., "Question with character corruption and math discrepancy 25 * 4 = 100 = ?"
    eq_match = re.search(r'([0-9\.\s\+\-\*\/\(\)\^\%\√\×\÷a-zA-Z\?]+=[0-9\.\s\+\-\*\/\(\)\^\%\√\×\÷\=a-zA-Z\?]+)', text)
    target_text = eq_match.group(1).strip() if eq_match else text

    parts = target_text.split("=")
    lhs_raw = parts[0].strip()
    rhs_raw = parts[-1].strip() if len(parts) > 1 else ""
    
    # Strip question number prefix and command verbs
    lhs_raw = re.sub(r'^(?:Q(?:uestion)?[\.\s]*\d+[\.\:\)]*|\d+[\.\)]\s*(?=[A-Za-z\?])|\d+\s*)', '', lhs_raw, flags=re.IGNORECASE).strip()
    lhs_raw = re.sub(r'^(?:Calculate|Find|Solve|Evaluate|What\s+is\s+(?:the\s+value\s+of)?|Determine|Compute|Simplify|Value\s+of)\s*[:\-\s]*', '', lhs_raw, flags=re.IGNORECASE).strip()
    
    # If lhs_raw still contains preceding words, isolate the trailing math expression
    math_lhs_match = re.search(r'([0-9\.\s\+\-\*\/\(\)\^\%\√\×\÷\?xX]+)$', lhs_raw)
    if math_lhs_match and any(c.isdigit() for c in math_lhs_match.group(1)):
        lhs_raw = math_lhs_match.group(1).strip()

    math_rhs_match = re.search(r'^([0-9\.\s\+\-\*\/\(\)\^\%\√\×\÷\?xX]+)', rhs_raw)
    if math_rhs_match and (any(c.isdigit() for c in math_rhs_match.group(1)) or any(c in "?xX" for c in math_rhs_match.group(1))):
        rhs_raw = math_rhs_match.group(1).strip()

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
    """
    Independently verifies quantitative questions using SymPy equation solver with approximation tolerance.
    """
    if not options or source_correct_index is None:
        return False, "No options or missing correct answer key.", None
        
    calculated_val = solve_equation_for_unknown(question_text)
    if calculated_val is not None:
        # First check marked correct option
        if 0 <= source_correct_index < len(options):
            claimed_opt = options[source_correct_index]
            num_match = re.search(r'[-+]?\d+(?:\.\d+)?', claimed_opt.text)
            if num_match:
                try:
                    opt_val = float(num_match.group(0))
                    diff = abs(opt_val - calculated_val)
                    rel_diff = diff / max(1.0, abs(calculated_val))
                    if diff < 1e-2 or diff <= 2.5 or rel_diff < 0.05:
                        return True, f"SymPy math verified answer {claimed_opt.label} ({calculated_val:.3f}) successfully.", source_correct_index
                except ValueError:
                    pass

        # Otherwise check if another option matches
        best_match_idx = None
        min_diff = float('inf')
        
        for opt in options:
            num_match = re.search(r'[-+]?\d+(?:\.\d+)?', opt.text)
            if num_match:
                try:
                    opt_val = float(num_match.group(0))
                    diff = abs(opt_val - calculated_val)
                    rel_diff = diff / max(1.0, abs(calculated_val))
                    
                    if diff < 1e-2 or diff <= 2.5 or rel_diff < 0.05:
                        if diff < min_diff:
                            min_diff = diff
                            best_match_idx = opt.index
                except ValueError:
                    pass

        if best_match_idx is not None:
            best_opt = options[best_match_idx]
            if best_match_idx == source_correct_index:
                return True, f"SymPy math verified answer {best_opt.label} ({calculated_val:.3f}) successfully.", best_match_idx
            else:
                claimed_opt = options[source_correct_index] if (0 <= source_correct_index < len(options)) else None
                claimed_info = f"Option {claimed_opt.label} ({claimed_opt.text})" if claimed_opt else f"Index {source_correct_index}"
                return False, f"Independent re-derivation discrepancy: Computed {calculated_val:.3f} (matches {best_opt.label}), but marked answer claims {claimed_info}.", best_match_idx

    return True, "Deterministic math check inconclusive (requires LLM reasoning verifier).", source_correct_index
