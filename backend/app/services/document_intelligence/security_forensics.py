import hashlib
from typing import Tuple
from backend.app.services.document_intelligence.schemas import DocumentForensicsReport

def calculate_file_hash(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()

def detect_document_type(filename: str, file_bytes: bytes) -> str:
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    header = file_bytes[:10]
    
    if header.startswith(b"%PDF"):
        return "PDF"
    elif header.startswith(b"PK\x03\x04") or ext == "docx":
        return "DOCX"
    elif header.startswith(b"\xff\xd8\xff") or header.startswith(b"\x89PNG") or ext in ["jpg", "jpeg", "png"]:
        return "IMAGE"
    elif ext == "txt":
        return "TEXT"
    return "UNKNOWN"

def inspect_file_security_and_integrity(file_bytes: bytes, filename: str) -> Tuple[bool, str]:
    if not file_bytes or len(file_bytes) == 0:
        return False, "File is empty (0 bytes)."
    
    # Check suspicious macro/executable headers inside binary
    suspicious_patterns = [b"<script>", b"exec(", b"eval(", b"MZ\x90\x00"]
    for pat in suspicious_patterns:
        if pat in file_bytes[:4096]:
            return False, f"File security inspection failed: suspicious pattern '{pat.decode('ascii', 'ignore')}' detected."
            
    return True, "Security check passed."

def run_pdf_forensics(file_bytes: bytes, filename: str) -> DocumentForensicsReport:
    file_hash = calculate_file_hash(file_bytes)
    sec_passed, sec_msg = inspect_file_security_and_integrity(file_bytes, filename)
    doc_type = detect_document_type(filename, file_bytes)
    
    page_count = 1
    is_encrypted = False
    has_scanned = False
    
    # Simple PyMuPDF / standard PDF inspection if PyMuPDF available
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=file_bytes, filetype="pdf" if doc_type == "PDF" else "txt")
        page_count = len(doc)
        is_encrypted = doc.is_encrypted
        
        # Check text length per page to determine if scanned
        scanned_pages = 0
        for page in doc:
            txt = page.get_text()
            if len(txt.strip()) < 50:
                scanned_pages += 1
        if scanned_pages > page_count * 0.5:
            has_scanned = True
            doc_type = "SCANNED_PDF"
    except Exception:
        # Fallback if text or image file
        pass

    return DocumentForensicsReport(
        file_name=filename,
        file_hash=file_hash,
        file_size_bytes=len(file_bytes),
        doc_type=doc_type,
        page_count=page_count,
        is_encrypted=is_encrypted,
        has_scanned_pages=has_scanned,
        security_passed=sec_passed
    )
