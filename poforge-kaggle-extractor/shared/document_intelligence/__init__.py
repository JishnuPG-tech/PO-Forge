"""Document intelligence package for MinerU extraction and boundary parsing."""
from .boundary_parser import segment_questions_from_pages, parse_options_from_block, classify_question_topic
from .schemas import (
    QuestionCandidate, ExtractedOption, ExtractedSourceLocation,
    ExtractionStatus, StructureStatus, OptionStatus, AnswerStatus, BoundingBox
)

__all__ = [
    "segment_questions_from_pages",
    "parse_options_from_block",
    "classify_question_topic",
    "QuestionCandidate",
    "ExtractedOption",
    "ExtractedSourceLocation",
    "ExtractionStatus",
    "StructureStatus",
    "OptionStatus",
    "AnswerStatus",
    "BoundingBox",
]
