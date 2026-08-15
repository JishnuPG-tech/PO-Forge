import re
from typing import Tuple, List

# Preserved banking exam math & currency symbols
PRESERVED_SYMBOLS = {
    '₹', '%', '×', '÷', '−', '+', '=', '≤', '≥', '√', '²', '³', 
    'π', '∞', '°', '→', '∴', '∵', '½', '⅓', '⅔', '¼', '¾'
}

CORRUPTION_PATTERNS = [
    (r'\ufffd', "REPLACEMENT_CHARACTER_DETECTED"),
    (r'\?\?\?', "TRIPLE_QUESTION_MARK_CORRUPTION"),
    (r'\b\d+\s+\.\s*\d+\b', "BROKEN_DECIMAL_POINT"),
    (r'\b\d{1,3}(?:\s+\d{3})+\b', "BROKEN_NUMBER_SEPARATOR"),
    (r'[^\x00-\x7F\u2000-\u206F\u2070-\u209F\u20A0-\u20CF\u2100-\u214F\u2190-\u21FF\u2200-\u22FF\u25A0-\u25FF\u0900-\u097F]', "UNHANDLED_SPECIAL_UNICODE")
]

def check_and_preserve_unicode(text: str) -> Tuple[str, List[str]]:
    """
    Normalizes text while preserving all math and currency symbols exactly.
    NEVER silently removes or replaces unrecognized characters.
    Flags all suspicious corruptions.
    """
    anomalies = []
    
    # Check corruptions
    for pat, anomaly_label in CORRUPTION_PATTERNS:
        if re.search(pat, text):
            anomalies.append(anomaly_label)
            
    # Check OCR number typos like 'Rs. 1O00' or '12O' (capital O instead of zero 0)
    if re.search(r'\b\d+O\d*\b', text) or re.search(r'\bO\d+\b', text):
        anomalies.append("OCR_TYPO_CAPITAL_O_FOR_ZERO")
        
    # Standardize whitespace while preserving all math symbols
    lines = text.split("\n")
    cleaned_lines = []
    for line in lines:
        # Collapse multiple spaces into single space, keep symbols intact
        l_clean = re.sub(r'[ \t]+', ' ', line.strip())
        cleaned_lines.append(l_clean)
        
    normalized_text = "\n".join(cleaned_lines)
    return normalized_text, anomalies
