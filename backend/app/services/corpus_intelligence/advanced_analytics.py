import re
from typing import List, Dict, Any, Tuple
from backend.app.services.document_intelligence.schemas import QuestionCandidate

def compute_topic_coverage_and_gaps(candidates: List[QuestionCandidate]) -> Dict[str, Any]:
    """
    Computes topic coverage statistics across validated candidates and identifies thin/zero coverage gaps.
    """
    topic_counts: Dict[str, int] = {}
    for cand in candidates:
        topic = cand.topic_code or "UNCLASSIFIED"
        topic_counts[topic] = topic_counts.get(topic, 0) + 1
        
    known_topics = [
        "SIMPLIFICATION",
        "SPEED_TIME_DISTANCE",
        "PROFIT_LOSS",
        "TIME_WORK",
        "MENSURATION",
        "DATA_INTERPRETATION",
        "NUMBER_SERIES",
        "QUADRATIC_EQUATIONS"
    ]
    
    analysis = {}
    recommendations = []
    
    for top in known_topics:
        cnt = topic_counts.get(top, 0)
        if cnt == 0:
            analysis[top] = {"status": "ZERO_COVERAGE", "count": 0}
            recommendations.append(f"Zero verified questions for {top} — consider uploading source materials for this topic.")
        elif cnt < 10:
            analysis[top] = {"status": "THIN_COVERAGE", "count": cnt}
            recommendations.append(f"Thin coverage in {top} ({cnt} questions) — extra corpus material recommended to train robust templates.")
        else:
            analysis[top] = {"status": "STRONG_COVERAGE", "count": cnt}
            
    return {
        "total_evaluated": len(candidates),
        "topic_breakdown": topic_counts,
        "coverage_analysis": analysis,
        "actionable_recommendations": recommendations
    }

def extract_source_style_fingerprint(text: str, filename: str) -> Dict[str, Any]:
    """
    Extracts a house-style fingerprint to avoid blending conflicting option conventions.
    """
    fn_lower = filename.lower()
    if "testbook" in fn_lower:
        return {
            "source_id": "TESTBOOK_4000",
            "option_prefix_style": "UPPERCASE_PAREN", # A), B), C)...
            "has_tta_metadata": True,
            "formatting_density": "SPACED_LEVELS",
            "font_family": "Arial/Verdana"
        }
    elif "ace quant" in fn_lower:
        return {
            "source_id": "ACE_QUANT",
            "option_prefix_style": "LOWERCASE_PAREN", # (a), (b), (c)...
            "has_tta_metadata": False,
            "formatting_density": "DENSE_ALGEBRA",
            "font_family": "Times/Calibri"
        }
    else:
        return {
            "source_id": "STANDARD",
            "option_prefix_style": "UPPERCASE_PAREN",
            "has_tta_metadata": False,
            "formatting_density": "BALANCED",
            "font_family": "System"
        }

def compute_structural_difficulty_score(cand: QuestionCandidate) -> float:
    """
    Computes an empirical difficulty metric based on measurable question properties:
    - Number of operators (+, -, *, /, ^, root)
    - Bracket depth ((), [], {})
    - Count of distinct numerical quantities
    - Presence of decimal/fraction/approximation
    """
    text = cand.normalized_text or ""
    
    # 1. Operator count
    operators = len(re.findall(r'[\+\-\*\/\÷\×\^√]', text))
    
    # 2. Bracket depth
    bracket_matches = re.findall(r'[\(\[\{\)\]\}]', text)
    bracket_score = len(bracket_matches) * 0.75
    
    # 3. Quantity count
    quantities = len(re.findall(r'\b\d+(?:\.\d+)?%?', text))
    
    # 4. Approximation / Decimal flag
    approx_flag = 1.5 if ("approx" in text.lower() or "." in text or "%" in text) else 0.0
    
    score = (operators * 1.5) + bracket_score + (quantities * 0.5) + approx_flag
    return round(score, 2)

def calibrate_topic_difficulty_terciles(candidates: List[QuestionCandidate], topic_code: str = "SIMPLIFICATION") -> Dict[str, Any]:
    """
    Buckets verified questions of a topic into EASY, MEDIUM, and HARD terciles based on empirical difficulty metrics.
    """
    topic_cands = [c for c in candidates if (c.topic_code or "SIMPLIFICATION") == topic_code]
    if not topic_cands:
        topic_cands = candidates # Fallback to all candidates if topic specific is small
        
    scored_cands = []
    for c in topic_cands:
        score = compute_structural_difficulty_score(c)
        scored_cands.append((c, score))
        
    scored_cands.sort(key=lambda x: x[1])
    
    n = len(scored_cands)
    if n == 0:
        return {"EASY": [], "MEDIUM": [], "HARD": []}
        
    tercile_size = n // 3
    easy_bucket = scored_cands[:tercile_size] if tercile_size > 0 else scored_cands[:1]
    medium_bucket = scored_cands[tercile_size:2*tercile_size] if tercile_size > 0 else scored_cands[:1]
    hard_bucket = scored_cands[2*tercile_size:] if tercile_size > 0 else scored_cands[:1]
    
    def format_bucket(bucket):
        return [
            {
                "candidate_id": c.candidate_id,
                "stem": c.normalized_text,
                "score": score,
                "operator_count": len(re.findall(r'[\+\-\*\/\÷\×\^√]', c.normalized_text or "")),
                "bracket_count": len(re.findall(r'[\(\[\{\)\]\}]', c.normalized_text or "")),
                "has_approximation": "approx" in (c.normalized_text or "").lower() or "." in (c.normalized_text or "")
            }
            for c, score in bucket
        ]
        
    return {
        "topic": topic_code,
        "total_questions": n,
        "buckets": {
            "EASY": format_bucket(easy_bucket),
            "MEDIUM": format_bucket(medium_bucket),
            "HARD": format_bucket(hard_bucket)
        }
    }
