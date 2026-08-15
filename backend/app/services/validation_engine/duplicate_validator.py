import hashlib
from typing import List, Dict, Optional
from backend.app.services.document_intelligence.schemas import QuestionCandidate
from backend.app.services.validation_engine.schemas import (
    ValidationRuleResult, ValidationStageName, RuleStatus
)

def compute_text_hash(text: str) -> str:
    cleaned = "".join(text.lower().split())
    return hashlib.md5(cleaned.encode("utf-8")).hexdigest()

def compute_jaccard_similarity(text1: str, text2: str) -> float:
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    if not words1 or not words2:
        return 0.0
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    return len(intersection) / len(union)

def validate_duplicate_rules(candidate: QuestionCandidate, existing_candidates: List[QuestionCandidate] = None) -> List[ValidationRuleResult]:
    results = []
    if not existing_candidates:
        results.append(ValidationRuleResult(
            rule_id="DUP_01",
            stage=ValidationStageName.DUPLICATE,
            rule_name="Duplicate Detection",
            status=RuleStatus.PASS,
            is_mandatory=True,
            details="No existing candidates to check against."
        ))
        return results

    cand_hash = compute_text_hash(candidate.normalized_text)
    
    is_exact = False
    is_near = False
    matched_id = None

    for existing in existing_candidates:
        if existing.candidate_id == candidate.candidate_id:
            continue
            
        ex_hash = compute_text_hash(existing.normalized_text)
        if cand_hash == ex_hash:
            is_exact = True
            matched_id = existing.candidate_id
            break
            
        sim = compute_jaccard_similarity(candidate.normalized_text, existing.normalized_text)
        if sim >= 0.85:
            is_near = True
            matched_id = existing.candidate_id
            break

    if is_exact:
        results.append(ValidationRuleResult(
            rule_id="DUP_01",
            stage=ValidationStageName.DUPLICATE,
            rule_name="Exact Duplicate Check",
            status=RuleStatus.FAIL,
            is_mandatory=True,
            details=f"Exact duplicate question detected matching candidate {matched_id}."
        ))
    elif is_near:
        results.append(ValidationRuleResult(
            rule_id="DUP_02",
            stage=ValidationStageName.DUPLICATE,
            rule_name="Near Duplicate Check",
            status=RuleStatus.WARNING,
            is_mandatory=False,
            details=f"Near-duplicate question (Jaccard > 85%) matching candidate {matched_id}."
        ))
    else:
        results.append(ValidationRuleResult(
            rule_id="DUP_01",
            stage=ValidationStageName.DUPLICATE,
            rule_name="Duplicate Check",
            status=RuleStatus.PASS,
            is_mandatory=True,
            details="No exact or near duplicates detected."
        ))

    return results
