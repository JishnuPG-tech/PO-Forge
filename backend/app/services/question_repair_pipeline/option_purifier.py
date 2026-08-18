import re
from typing import List, Tuple

class OptionPurifier:
    """
    Cleans, normalizes, and validates options into the strict 5-choice
    banking exam format (A, B, C, D, E).
    """

    @classmethod
    def clean_single_option(cls, opt: str) -> str:
        if not opt:
            return ""
        
        cleaned = opt.strip()
        # Strip HTML tags
        cleaned = re.sub(r'<[^>]+>', '', cleaned)
        # Strip leading letter markers: "A) ", "(A) ", "A. ", "A - ", "[A] "
        cleaned = re.sub(r'^(\(?[A-Ea-e]\)?[\.\:\-\)]\s*|\[[A-Ea-e]\]\s*)', '', cleaned).strip()
        # Strip trailing OCR column collision letters: "81.711 B" -> "81.711", "24 m D" -> "24 m"
        cleaned = re.sub(r'\s+[A-Ea-e]$', '', cleaned).strip()
        # Standardize negative signs
        cleaned = cleaned.replace('–', '-').replace('—', '-').replace('−', '-')
        
        return cleaned

    @classmethod
    def purify_options_list(cls, raw_options: List[str]) -> Tuple[List[str], bool, str]:
        """
        Purifies a list of raw options.
        Returns (clean_options, is_valid, error_reason).
        """
        cleaned_list = []
        for opt in raw_options:
            c = cls.clean_single_option(opt)
            if c and c not in cleaned_list:
                cleaned_list.append(c)

        # Reject if any option contains equation fragments or operators
        for opt in cleaned_list:
            if opt in ["None of these", "None of the above", "Cannot be determined"]:
                continue
            if any(frag in opt for frag in ['= ?', '=?', '=', '÷', '×', '% of', ' of ', '+ ', ' +', '- [', ' -', '[', ']', '(', ')']):
                return [], False, f"Option contains operator/equation fragment: {opt}"
            if len(opt) > 80:
                return [], False, f"Option text is abnormally long: {opt[:30]}..."

        # Standardize to 5 options for banking format
        if len(cleaned_list) == 4:
            if "None of these" not in cleaned_list and "None of the above" not in cleaned_list:
                cleaned_list.append("None of these")
        elif len(cleaned_list) < 4:
            return cleaned_list, False, f"Insufficient options: only {len(cleaned_list)} options found"
        elif len(cleaned_list) > 5:
            cleaned_list = cleaned_list[:5]

        return cleaned_list, True, "OK"
