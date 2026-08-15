import re
from typing import List, Dict, Any, Optional, Tuple
from backend.app.services.document_intelligence.schemas import (
    QuestionCandidate, ExtractedOption, ExtractedSourceLocation,
    ExtractionStatus, StructureStatus, OptionStatus, AnswerStatus, BoundingBox
)

QUESTION_START_PATTERN = re.compile(
    r'^(?:Q(?:uestion)?[\.\s]*(\d+)|(\d+)[\.\)]|Q(\d+))\s*',
    re.IGNORECASE | re.MULTILINE
)

# Strictly match letter option prefixes (A), (B), (C), (D), (E), (a), (b), (c), (d), (e), A), B), C), D), E), A., B., C., D., E.
OPTION_PATTERN = re.compile(
    r'(?:^|\n|\s{2,})(?:\(?([A-Ea-e])\)?[\.\)])\s*([^\n\r]+?)(?=(?:\s{2,}|\n)(?:\(?([A-Ea-e])\)?[\.\)])|\n|$)',
    re.DOTALL
)

ANSWER_PATTERN = re.compile(
    r'(?:^|\n|\s*)(?:\d+[\.\)]\s*)?\(?([A-Ea-e])\)?\s*[:;\)]\s*|(?:Ans(?:wer)?|Correct\s+Option|Sol(?:ution)?)\s*[:;\-\s]*\(?([A-Ea-e])\)?',
    re.IGNORECASE
)

EXPLANATION_PATTERN = re.compile(
    r'(?:Sol(?:ution)?|Explanation|Shortcut(?:\s+Method)?)\s*[:\-\s]*(.*)',
    re.IGNORECASE | re.DOTALL
)

DI_SET_PATTERN = re.compile(
    r'Directions?\s*\((?:Q|Questions?)[\.\s]*(\d+)\s*[\-\sto]+\s*(\d+)\)\s*[:\-\s]*(.*?)(?=(?:Q\d+|\d+\.|$))',
    re.IGNORECASE | re.DOTALL
)

TTA_PATTERN = re.compile(
    r'TTA\s*:\s*(\d+)\s*Seconds?',
    re.IGNORECASE
)

def classify_question_topic(stem: str) -> Tuple[str, str, str]:
    text = stem.lower()
    
    if any(k in text for k in ["table", "bar graph", "pie chart", "line graph", "chart", "given below shows", "study the following"]):
        return "QUANT", "DATA_INTERPRETATION", "TABLE_DI"
    elif any(k in text for k in ["missing number", "wrong number", "series", "sequence", "find the wrong term"]):
        return "QUANT", "NUMBER_SERIES", "MISSING_NUMBER"
    elif any(k in text for k in ["x^2", "y^2", "x2", "y2", "equation i", "equation ii", "relationship between x"]):
        return "QUANT", "QUADRATIC_EQUATIONS", "ROOT_COMPARISON"
    elif any(k in text for k in ["cost price", "selling price", "marked price", "profit", "discount", "loss"]):
        return "QUANT", "PROFIT_LOSS", "MARKUP_DISCOUNT"
    elif any(k in text for k in ["compound interest", "simple interest", "principal", "compounded", "annum", "rate of interest"]):
        return "QUANT", "SIMPLE_COMPOUND_INTEREST", "CI_SI_DIFF"
    elif any(k in text for k in ["train", "speed", "km/h", "stream", "boat", "upstream", "downstream", "distance"]):
        return "QUANT", "SPEED_TIME_DISTANCE", "TRAINS_BOATS"
    elif any(k in text for k in ["pipe", "cistern", "days", "efficiency", "work done", "together can finish"]):
        return "QUANT", "TIME_WORK", "PIPES_CISTERNS"
    elif any(k in text for k in ["ratio", "proportion", "mixture", "allegation", "share"]):
        return "QUANT", "RATIO_PROPORTION", "MIXTURES"
    elif any(k in text for k in ["average", "mean"]):
        return "QUANT", "AVERAGE", "WEIGHTED_AVERAGE"
    elif any(k in text for k in ["probability", "marbles", "balls", "cards", "dice", "ways"]):
        return "QUANT", "PROBABILITY", "CARD_MARBLE_PROBABILITY"
    elif any(k in text for k in ["mensuration", "area", "volume", "perimeter", "radius", "cylinder", "cone"]):
        return "QUANT", "MENSURATION", "2D_3D_GEOMETRY"
    else:
        return "QUANT", "SIMPLIFICATION", "APPROXIMATION"

def parse_options_from_block(text: str) -> List[ExtractedOption]:
    matches = OPTION_PATTERN.findall(text)
    options = []
    seen_labels = set()
    
    idx = 0
    for match in matches:
        raw_label = match[0].upper()
        label = f"({raw_label})"
        opt_text = match[1].strip()
        
        # Clean trailing stem junk or TTA noise
        opt_text = re.split(r'\s*(?:TTA\s*:|\d+\.\s*What|Ans|Sol|Explanation|Directions)', opt_text, flags=re.IGNORECASE)[0].strip()
        
        if label not in seen_labels and idx < 5 and opt_text:
            seen_labels.add(label)
            options.append(ExtractedOption(
                index=idx,
                label=label,
                text=opt_text
            ))
            idx += 1
            
    return options

def parse_answer_key(text: str) -> Optional[int]:
    match = ANSWER_PATTERN.search(text)
    if match:
        ans_str = (match.group(1) or match.group(2)).upper()
        char_map = {"A": 0, "B": 1, "C": 2, "D": 3, "E": 4}
        return char_map.get(ans_str)
    return None

def extract_tta_time_seconds(text: str) -> Optional[int]:
    match = TTA_PATTERN.search(text)
    if match:
        try:
            return int(match.group(1))
        except ValueError:
            return None
    return None

def extract_explanation_and_shortcut(text: str) -> Tuple[Optional[str], Optional[str]]:
    match = EXPLANATION_PATTERN.search(text)
    if match:
        full_sol = match.group(1).strip()
        shortcut = None
        if "Shortcut" in full_sol:
            parts = re.split(r'Shortcut(?:\s+Method)?\s*[:\-\s]*', full_sol, flags=re.IGNORECASE)
            full_sol = parts[0].strip()
            shortcut = parts[1].strip() if len(parts) > 1 else None
        return full_sol, shortcut
    return None, None

def detect_tables_and_equations(text: str) -> Tuple[bool, bool]:
    has_table = "|" in text or "\t" in text or "Table" in text
    has_equations = any(sym in text for sym in ["√", "²", "³", "∫", "∑", "±", "≤", "≥", "="])
    return has_table, has_equations

def segment_questions_from_pages(pages_text: Dict[int, str], document_id: str = "DOC_001") -> List[QuestionCandidate]:
    candidates = []
    
    combined_full_text = "\n--- PAGE BREAK ---\n".join([pages_text[p] for p in sorted(pages_text.keys())])
    
    di_sets = {}
    for di_match in DI_SET_PATTERN.finditer(combined_full_text):
        q_start = int(di_match.group(1))
        q_end = int(di_match.group(2))
        context_text = di_match.group(3).strip()
        di_id = f"DI_SET_{q_start:04d}_{q_end:04d}"
        for q_num in range(q_start, q_end + 1):
            di_sets[q_num] = (di_id, context_text)

    chunks = re.split(r'\n+\s*(?=(?:Q(?:uestion)?[\.\s]*\d+|\d+[\.\)]|Q\d+)\b)', combined_full_text, flags=re.IGNORECASE)
    
    candidate_counter = 1
    current_page = 1
    
    for chunk in chunks:
        chunk_clean = chunk.strip()
        if not chunk_clean:
            continue
            
        match_start = QUESTION_START_PATTERN.search(chunk_clean)
        if not match_start:
            continue
            
        q_num_str = match_start.group(1) or match_start.group(2) or match_start.group(3) or str(candidate_counter)
        q_num = int(q_num_str) if q_num_str.isdigit() else candidate_counter
        
        di_id, di_context = di_sets.get(q_num, (None, None))
        
        options = parse_options_from_block(chunk_clean)
        correct_ans_index = parse_answer_key(chunk_clean)
        sol_text, shortcut_text = extract_explanation_and_shortcut(chunk_clean)
        target_tta_seconds = extract_tta_time_seconds(chunk_clean)
        has_tbl, has_eq = detect_tables_and_equations(chunk_clean)
        
        # Dynamic taxonomy classification
        subj_code, top_code, subtop_code = classify_question_topic(chunk_clean)
        
        if len(options) == 4:
            opt_status = OptionStatus.VALID_4
        elif len(options) == 5:
            opt_status = OptionStatus.VALID_5
        elif len(options) == 0:
            opt_status = OptionStatus.MISSING_OPTIONS
        else:
            opt_status = OptionStatus.INVALID_COUNT
            
        if correct_ans_index is not None and 0 <= correct_ans_index < len(options):
            options[correct_ans_index].is_correct = True
            ans_status = AnswerStatus.FOUND
        elif correct_ans_index is not None:
            ans_status = AnswerStatus.OUT_OF_BOUNDS
        else:
            ans_status = AnswerStatus.MISSING

        # Isolate clean stem
        q_stem = re.split(r'\n+\s*(?:--- PAGE BREAK ---|(?:\d+[\.\)]|Q\d+|\bDirections\b))', chunk_clean, flags=re.IGNORECASE)[0]
        if options and options[0].text in q_stem:
            q_stem = q_stem.split(options[0].text)[0]
        q_stem = re.split(r'\n+\s*(?:\(?([A-Ea-e])\)?[\.\)])\s*', q_stem)[0]
        q_stem = re.sub(r'\s*TTA\s*:\s*\d+\s*Seconds?', '', q_stem, flags=re.IGNORECASE).strip()
        q_stem = re.sub(r'^--- PAGE BREAK ---\s*', '', q_stem, flags=re.IGNORECASE).strip()

        candidate = QuestionCandidate(
            candidate_id=f"QCAND_{q_num:04d}",
            raw_text=chunk_clean,
            normalized_text=q_stem,
            structured_text=q_stem,
            di_set_id=di_id,
            di_context_text=di_context,
            options=options,
            option_count=len(options),
            correct_option_index=correct_ans_index,
            explanation_text=sol_text,
            shortcut_text=shortcut_text,
            target_time_seconds=target_tta_seconds,
            subject_code=subj_code,
            topic_code=top_code,
            subtopic_code=subtop_code,
            has_table=has_tbl,
            has_equations=has_eq,
            extraction_status=ExtractionStatus.SUCCESS,
            structure_status=StructureStatus.COMPLETE,
            option_status=opt_status,
            answer_status=ans_status,
            source_location=ExtractedSourceLocation(
                document_id=document_id,
                page_number=current_page,
                original_question_number=str(q_num)
            )
        )
        candidates.append(candidate)
        candidate_counter += 1
        
    return candidates
