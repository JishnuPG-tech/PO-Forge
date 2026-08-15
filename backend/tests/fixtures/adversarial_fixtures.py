from typing import Dict, Any, List

def get_all_adversarial_fixtures() -> List[Dict[str, Any]]:
    return [
        {
            "fixture_id": "ADV_01_MISSING_OPTIONS",
            "description": "Question has only 2 options instead of 4 or 5",
            "question": {
                "text": "What is the capital of India?",
                "options": ["New Delhi", "Mumbai"],
                "correct_option_index": 0,
                "subject_code": "GA_BANKING"
            },
            "expected_rejection_reason": "INVALID_OPTION_COUNT"
        },
        {
            "fixture_id": "ADV_02_SIX_OPTIONS",
            "description": "Question has 6 options",
            "question": {
                "text": "Which of the following is a prime number?",
                "options": ["4", "6", "7", "8", "9", "10"],
                "correct_option_index": 2,
                "subject_code": "QUANT"
            },
            "expected_rejection_reason": "INVALID_OPTION_COUNT"
        },
        {
            "fixture_id": "ADV_03_DUPLICATED_OPTIONS",
            "description": "Question has duplicate option texts",
            "question": {
                "text": "What is 10 + 10?",
                "options": ["20", "20", "30", "40", "50"],
                "correct_option_index": 0,
                "subject_code": "QUANT"
            },
            "expected_rejection_reason": "DUPLICATE_OPTIONS"
        },
        {
            "fixture_id": "ADV_04_MISSING_ANSWER",
            "description": "Question missing correct answer index",
            "question": {
                "text": "Find SI on Rs. 1000 at 10% for 2 years.",
                "options": ["Rs. 100", "Rs. 200", "Rs. 300", "Rs. 400", "Rs. 500"],
                "correct_option_index": None,
                "subject_code": "QUANT"
            },
            "expected_rejection_reason": "MISSING_CORRECT_ANSWER"
        },
        {
            "fixture_id": "ADV_05_BROKEN_SYMBOL_ENCODING",
            "description": "Question containing null bytes and replacement glyphs",
            "question": {
                "text": "Solve: x² + 5x \x00 + 6  = 0",
                "options": ["-2, -3", "2, 3", "-1, -6", "1, 6", "0, 5"],
                "correct_option_index": 0,
                "subject_code": "QUANT"
            },
            "expected_rejection_reason": "UNICODE_CORRUPTION"
        },
        {
            "fixture_id": "ADV_06_OCR_SUBSTITUTION",
            "description": "OCR substituted letter 'O' for zero '0'",
            "question": {
                "text": "Find Simple Interest on Rs. 1OOO at 1O% for 2 years.",
                "options": ["Rs. 2OO", "Rs. 1OO", "Rs. 3OO", "Rs. 4OO", "Rs. 5OO"],
                "correct_option_index": 0,
                "subject_code": "QUANT"
            },
            "expected_rejection_reason": "OCR_NUMERICAL_ANOMALY"
        },
        {
            "fixture_id": "ADV_07_WATERMARK_CONTAMINATION",
            "description": "Question stem contaminated by website watermark",
            "question": {
                "text": "Find the ratio of A to B. Downloaded from www.exam-toppers-portal.com Page 12",
                "options": ["2:3", "3:4", "4:5", "5:6", "1:2"],
                "correct_option_index": 0,
                "subject_code": "QUANT"
            },
            "expected_rejection_reason": "WATERMARK_CONTAMINATION"
        },
        {
            "fixture_id": "ADV_08_MATH_DISCREPANCY",
            "description": "Declared answer (120) contradicts mathematically calculated answer (100)",
            "question": {
                "text": "Calculate 25 * 4 = ?",
                "options": ["100", "120", "140", "160", "180"],
                "correct_option_index": 1, # Points to 120 (wrong)
                "subject_code": "QUANT"
            },
            "expected_rejection_reason": "MATH_DISCREPANCY"
        },
        {
            "fixture_id": "ADV_09_INVALID_TAXONOMY_SUBJECT",
            "description": "Question has non-existent subject code INVALID_MATH",
            "question": {
                "text": "Solve 2 + 2",
                "options": ["4", "5", "6", "7", "8"],
                "correct_option_index": 0,
                "subject_code": "INVALID_MATH"
            },
            "expected_rejection_reason": "TAXONOMY_SUBJECT_INVALID"
        },
        {
            "fixture_id": "ADV_10_EXACT_DUPLICATE",
            "description": "Question text is 100% duplicate of an existing published question",
            "question": {
                "text": "A train 150m long passes a pole in 15 seconds. Find speed of train in km/hr.",
                "options": ["36 km/h", "45 km/h", "54 km/h", "60 km/h", "72 km/h"],
                "correct_option_index": 0,
                "subject_code": "QUANT"
            },
            "expected_rejection_reason": "EXACT_DUPLICATE"
        }
    ]
