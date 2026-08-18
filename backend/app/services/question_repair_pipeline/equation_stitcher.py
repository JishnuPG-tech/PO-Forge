import re
from typing import List, Tuple, Optional

class EquationStitcher:
    """
    Detects and reassembles equations that were severed or sliced across
    the question stem and option text during multi-column OCR extraction.
    """
    
    @staticmethod
    def clean_text_symbols(text: str) -> str:
        if not text:
            return ""
        # Strip HTML tags
        cleaned = re.sub(r'<[^>]+>', '', text)
        # Normalize typographic quotes and dashes
        cleaned = cleaned.replace('‘', "'").replace('’', "'").replace('“', '"').replace('”', '"')
        cleaned = cleaned.replace('–', '-').replace('—', '-').replace('−', '-')
        # Strip OCR timing/metadata noise
        cleaned = re.sub(r'TTA\s*:\s*\d+\s*(Seconds|Secs|s)\b', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"'\?'", '?', cleaned)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        return cleaned

    @classmethod
    def stitch_stem_and_options(cls, raw_stem: str, raw_options: List[str]) -> Tuple[str, List[str], bool]:
        """
        Inspects if stem ends abruptly (e.g. '28.314 - 3' or '78.143 - [') and
        options contain the rest of the equation (e.g. '427 + 113.928 = ? + 29.114').
        Returns (reconstructed_stem, cleaned_options, was_repaired).
        """
        stem = cls.clean_text_symbols(raw_stem)
        options = [cls.clean_text_symbols(opt) for opt in raw_options if opt]
        
        repaired = False
        
        # Check if option 0 contains equation fragment: e.g. starts with numbers + operator or '= ?'
        if options and len(options) >= 2:
            opt0 = options[0]
            
            # Case 1: Decimal slice like Stem ends with '28.314 - 3' and Opt0 has '427 + 113.928 = ? + 29.114'
            if re.search(r'[-+×÷]\s*\d+$', stem) and any(k in opt0 for k in ['= ?', '=?', '+', '-']):
                # Find trailing cut digits in stem
                stem_match = re.search(r'^(.*?[-+×÷]\s*)(\d+)$', stem)
                if stem_match:
                    prefix = stem_match.group(1)
                    num_prefix = stem_match.group(2)
                    
                    # Check if opt0 starts with digits and operator
                    opt_match = re.search(r'^(\d+)(\s*[-+×÷].*)$', opt0)
                    if opt_match:
                        full_num = num_prefix + opt_match.group(1)
                        rest_of_eq = opt_match.group(2)
                        
                        stem = prefix + full_num + rest_of_eq
                        # Remove opt0 from options list because it was part of the equation!
                        options = options[1:]
                        repaired = True
                        
            # Case 2: Bracket slice like Stem ends with '- [' and Opt0 has '08 + 3.15 of...'
            elif re.search(r'[-+×÷]\s*\[\s*$', stem) and any(k in opt0 for k in ['of', '+', '-']):
                # Reconstruct inner bracket equation from opt0 and opt1 if needed
                stem = stem + opt0
                options = options[1:]
                repaired = True
                
            # Case 3: Stem ends with dangling single digit: 'following question? 3' and Opt0 has '3.5% of...'
            elif re.search(r'\?\s*(\d+)$', stem):
                digit = re.search(r'\?\s*(\d+)$', stem).group(1)
                stem = re.sub(r'\?\s*\d+$', '?', stem)
                if options and (options[0].startswith('%') or ' of ' in options[0] or options[0].startswith('.')):
                    stem = stem + f"\n\n$${digit}{options[0]}$$"
                    options = options[1:]
                    repaired = True

        return stem, options, repaired
