import re
import math
from typing import Optional, Dict, Any, List

class MathSolverVerifier:
    """
    Safely parses and evaluates simplification and arithmetic expressions,
    verifies option accuracy, and generates step-by-step mathematical proofs.
    """

    @classmethod
    def evaluate_safe_arithmetic(cls, expr: str) -> Optional[float]:
        try:
            # Replace mathematical operators with python equivalents
            cleaned = expr.replace('×', '*').replace('÷', '/').replace('^', '**')
            cleaned = re.sub(r'√\s*(\d+(\.\d+)?)', r'math.sqrt(\1)', cleaned)
            cleaned = re.sub(r'(\d+(\.\d+)?)\s*%\s*of\s*(\d+(\.\d+)?)', r'((\1/100)*\3)', cleaned)
            
            # Restrict globals for security
            allowed_names = {"math": math, "sqrt": math.sqrt}
            result = eval(cleaned, {"__builtins__": None}, allowed_names)
            return float(result)
        except Exception:
            return None

    @classmethod
    def verify_simplification_question(cls, stem: str, options: List[str]) -> Optional[Dict[str, Any]]:
        """
        Attempts to extract equation 'LHS = RHS' where one side has '?' and solve it.
        """
        # Look for equation pattern: Expr1 = Expr2
        eq_match = re.search(r'([0-9\.\s\+\-\*\/\(\)\^\%\√\×\÷]+)\s*=\s*([0-9\.\s\+\-\*\/\(\)\^\%\√\×\÷\?]+)', stem)
        if not eq_match:
            return None

        lhs_raw = eq_match.group(1).strip()
        rhs_raw = eq_match.group(2).strip()

        # If RHS is '?' or '? + C'
        if rhs_raw == '?':
            calculated_val = cls.evaluate_safe_arithmetic(lhs_raw)
            if calculated_val is not None:
                # Find matching option
                best_idx = None
                for idx, opt in enumerate(options):
                    opt_num = re.search(r'[-+]?\d+(\.\d+)?', opt)
                    if opt_num:
                        val = float(opt_num.group(0))
                        if abs(val - calculated_val) < 0.05 or abs(val - round(calculated_val)) < 0.05:
                            best_idx = idx
                            break
                
                return {
                    "calculated_value": round(calculated_val, 2),
                    "matched_option_index": best_idx,
                    "explanation": f"Step 1: Evaluate LHS expression: {lhs_raw}.\nStep 2: Computed result = {round(calculated_val, 2)}.\nStep 3: Matches Option {chr(65 + best_idx) if best_idx is not None else 'None'}."
                }
        return None
