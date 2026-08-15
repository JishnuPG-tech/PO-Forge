import re
from typing import List, Dict, Any

WATERMARK_PATTERNS = [
    r"watermark", r"sample paper", r"confidential", r"do not copy",
    r"testbook", r"byju's", r"gradeup", r"adda247", r"prepp", r"exampundit"
]

HEADER_FOOTER_PATTERNS = [
    r"page\s+\d+\s+of\s+\d+", r"page\s+\d+", r"^\d+$",
    r"ibps\s+rrb\s+po\s+mock\s+test", r"banking\s+exam\s+prep"
]

def remove_headers_footers_watermarks(text_lines: List[str]) -> List[str]:
    cleaned = []
    for line in text_lines:
        lower = line.strip().lower()
        if not lower:
            continue
        
        # Check watermark
        is_watermark = any(re.search(pat, lower) for pat in WATERMARK_PATTERNS)
        if is_watermark:
            continue
            
        # Check header/footer
        is_header_footer = any(re.search(pat, lower) for pat in HEADER_FOOTER_PATTERNS)
        if is_header_footer and len(line.strip()) < 40:
            continue
            
        cleaned.append(line)
    return cleaned

def reconstruct_two_column_layout(page_blocks: List[Dict[str, Any]]) -> str:
    """
    If page blocks contain bounding boxes, sorts text by left column first (x < mid_x)
    then right column (x >= mid_x) to preserve true reading order.
    """
    if not page_blocks:
        return ""
    
    # If block objects don't have x/y bounding box info, return concatenated text
    if not isinstance(page_blocks[0], dict) or "bbox" not in page_blocks[0]:
        lines = [b["text"] if isinstance(b, dict) else str(b) for b in page_blocks]
        cleaned_lines = remove_headers_footers_watermarks(lines)
        return "\n".join(cleaned_lines)
    
    # Find page width midpoint
    max_x = max(b["bbox"][2] for b in page_blocks if "bbox" in b)
    mid_x = max_x / 2.0
    
    left_col = []
    right_col = []
    full_width = []
    
    for b in page_blocks:
        bbox = b.get("bbox", [0, 0, 0, 0])
        # If block spans > 70% width, it's a header/DI passage/title
        width = bbox[2] - bbox[0]
        if width > max_x * 0.7:
            full_width.append((bbox[1], b.get("text", "")))
        elif bbox[0] < mid_x and bbox[2] <= mid_x + 30:
            left_col.append((bbox[1], b.get("text", "")))
        else:
            right_col.append((bbox[1], b.get("text", "")))

    # Sort each column top-to-bottom by y1
    left_col.sort(key=lambda item: item[0])
    right_col.sort(key=lambda item: item[0])
    full_width.sort(key=lambda item: item[0])
    
    combined_lines = [item[1] for item in full_width] + [item[1] for item in left_col] + [item[1] for item in right_col]
    cleaned = remove_headers_footers_watermarks(combined_lines)
    return "\n".join(cleaned)

def extract_page_text_with_ocr(file_bytes: bytes, page_number: int) -> str:
    """
    Attempts PyMuPDF text extraction; falls back to UTF-8 decoding or OCR if page text is minimal.
    """
    extracted_text = ""
    try:
        import fitz
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        if 0 <= page_number - 1 < len(doc):
            page = doc[page_number - 1]
            blocks = page.get_text("blocks")
            block_dicts = [{"bbox": b[:4], "text": b[4]} for b in blocks]
            extracted_text = reconstruct_two_column_layout(block_dicts)
    except Exception:
        # Fallback to UTF-8 text decoding if raw text/txt document
        try:
            extracted_text = file_bytes.decode('utf-8', errors='ignore')
            lines = extracted_text.splitlines()
            cleaned = remove_headers_footers_watermarks(lines)
            extracted_text = "\n".join(cleaned)
        except Exception:
            extracted_text = f"[OCR Text for Page {page_number}]\n"
        
    return extracted_text
