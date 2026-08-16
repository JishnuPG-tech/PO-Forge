import re
from typing import List, Dict, Any, Optional, Tuple
from .schemas import (
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
        
        if label not in seen_labels and len(opt_text) > 0:
            seen_labels.add(label)
            options.append(ExtractedOption(
                index=idx,
                label=label,
                text=opt_text
            ))
            idx += 1
            
    # Fallback line-by-line check if regex missed inline options
    if len(options) < 4:
        lines = text.split('\n')
        for line in lines:
            line_s = line.strip()
            line_match = re.match(r'^(?:\(?([A-Ea-e])\)?[\.\)])\s*(.+)$', line_s)
            if line_match:
                lbl = f"({line_match.group(1).upper()})"
                otext = line_match.group(2).strip()
                if lbl not in seen_labels and len(otext) > 0:
                    seen_labels.add(lbl)
                    options.append(ExtractedOption(
                        index=len(options),
                        label=lbl,
                        text=otext
                    ))
    
    # Sort by standard (A), (B), (C), (D), (E) order
    order_map = {"(A)": 0, "(B)": 1, "(C)": 2, "(D)": 3, "(E)": 4}
    options.sort(key=lambda o: order_map.get(o.label, 99))
    for i, opt in enumerate(options):
        opt.index = i
        
    return options

def parse_answer_and_explanation(block_text: str, options: List[ExtractedOption]) -> Tuple[Optional[int], Optional[str], Optional[str]]:
    correct_idx = None
    explanation = None
    shortcut = None
    
    # Find Answer Label
    ans_match = ANSWER_PATTERN.search(block_text)
    if ans_match:
        char = (ans_match.group(1) or ans_match.group(2) or "").upper()
        if char:
            target_label = f"({char})"
            for opt in options:
                if opt.label == target_label:
                    correct_idx = opt.index
                    opt.is_correct = True
                    break
                    
    # Find Explanation
    exp_match = EXPLANATION_PATTERN.search(block_text)
    if exp_match:
        raw_exp = exp_match.group(1).strip()
        # Split shortcut if present
        if "Shortcut" in raw_exp:
            parts = re.split(r'Shortcut(?:\s+Method)?\s*[:\-\s]*', raw_exp, flags=re.IGNORECASE)
            explanation = parts[0].strip()
            if len(parts) > 1:
                shortcut = parts[1].strip()
        else:
            explanation = raw_exp
            
    return correct_idx, explanation, shortcut

def segment_questions_from_pages(pages_dict: Dict[int, str], document_id: str) -> List[QuestionCandidate]:
    candidates: List[QuestionCandidate] = []
    
    # Pre-extract DI context blocks across pages
    di_contexts: Dict[int, str] = {}
    for page_num, text in pages_dict.items():
        di_matches = DI_SET_PATTERN.findall(text)
        for dim in di_matches:
            q_start, q_end, di_body = int(dim[0]), int(dim[1]), dim[2].strip()
            for q_num in range(q_start, q_end + 1):
                di_contexts[q_num] = di_body
                
    total_q_count = 0
    
    for page_num in sorted(pages_dict.keys()):
        page_text = pages_dict[page_num]
        
        # Split page into potential question chunks using Question delimiters
        splits = re.split(r'\n(?=(?:Q(?:uestion)?[\.\s]*\d+|\d+[\.\)]|Q\d+)\s+)', page_text, flags=re.IGNORECASE)
        
        for idx, block in enumerate(splits):
            block_s = block.strip()
            if len(block_s) < 20:
                continue
                
            q_match = re.match(r'^(?:Q(?:uestion)?[\.\s]*(\d+)|(\d+)[\.\)]|Q(\d+))\s*', block_s, flags=re.IGNORECASE)
            q_num_str = None
            if q_match:
                q_num_str = q_match.group(1) or q_match.group(2) or q_match.group(3)
                
            # Extract TTA if present
            tta_val = 60
            tta_match = TTA_PATTERN.search(block_s)
            if tta_match:
                tta_val = int(tta_match.group(1))
                
            # Extract Options
            options = parse_options_from_block(block_s)
            
            # Extract Answer & Solution
            correct_idx, explanation, shortcut = parse_answer_and_explanation(block_s, options)
            
            # Determine Question Stem
            first_opt_label = options[0].label if options else "(A)"
            first_opt_char = first_opt_label.strip("()")
            
            # Split stem cleanly before options block
            stem_split = re.split(rf'(?:\n|\s{2,})(?:\({first_opt_char}\)|{first_opt_char}\.|\({first_opt_char.lower()}\)|{first_opt_char.lower()}\.)\s+', block_s, maxsplit=1)
            raw_stem = stem_split[0].strip() if stem_split else block_s
            
            # Strip initial Q1. / 1. prefix from stem
            clean_stem = re.sub(r'^(?:Q(?:uestion)?[\.\s]*\d+|\d+[\.\)]|Q\d+)\s*', '', raw_stem, flags=re.IGNORECASE).strip()
            
            if len(clean_stem) < 8:
                continue
                
            subj, topic, subtopic = classify_question_topic(clean_stem)
            
            q_num_int = int(q_num_str) if q_num_str and q_num_str.isdigit() else (total_q_count + 1)
            di_body = di_contexts.get(q_num_int)
            
            # Determine Option Status
            opt_status = OptionStatus.VALID_5 if len(options) == 5 else (
                OptionStatus.VALID_4 if len(options) == 4 else OptionStatus.INVALID_COUNT
            )
            
            ans_status = AnswerStatus.FOUND if correct_idx is not None else AnswerStatus.MISSING
            struct_status = StructureStatus.COMPLETE if (len(options) >= 4 and ans_status == AnswerStatus.FOUND) else StructureStatus.PAGE_CONTINUED
            
            total_q_count += 1
            cid = f"QCAND_{document_id[:8]}_P{page_num:03d}_Q{total_q_count:04d}"
            
            candidate = QuestionCandidate(
                candidate_id=cid,
                raw_text=block_s,
                normalized_text=f"{clean_stem}\n" + "\n".join(f"{o.label} {o.text}" for o in options),
                structured_text=clean_stem,
                source="DOCUMENT_INGESTED",
                di_set_id=f"DI_P{page_num}_{q_num_int}" if di_body else None,
                di_context_text=di_body,
                options=options,
                option_count=len(options),
                correct_option_index=correct_idx,
                explanation_text=explanation,
                shortcut_text=shortcut,
                subject_code=subj,
                topic_code=topic,
                subtopic_code=subtopic,
                difficulty="HARD" if tta_val > 90 else ("EASY" if tta_val < 40 else "MEDIUM"),
                est_time_seconds=tta_val,
                target_time_seconds=tta_val,
                has_table="table" in clean_stem.lower() or (di_body is not None and "table" in di_body.lower()),
                has_diagram="graph" in clean_stem.lower() or "chart" in clean_stem.lower(),
                has_equations="x^2" in clean_stem or "=" in clean_stem,
                extraction_status=ExtractionStatus.SUCCESS,
                structure_status=struct_status,
                option_status=opt_status,
                answer_status=ans_status,
                confidence_score=0.95 if struct_status == StructureStatus.COMPLETE else 0.70,
                source_location=ExtractedSourceLocation(
                    document_id=document_id,
                    page_number=page_num,
                    original_question_number=str(q_num_int)
                )
            )
            candidates.append(candidate)
            
    return candidates
