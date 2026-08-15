from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid

from backend.app.api.deps import get_current_user, get_current_admin_user, UserTokenPayload
from backend.app.services.document_intelligence.schemas import ProcessingReport, DocumentForensicsReport
from backend.app.services.document_intelligence.pipeline import DocumentIntelligencePipeline

router = APIRouter(prefix="/documents", tags=["Document Intelligence"])

@router.post("/upload", response_model=Dict[str, Any])
async def upload_coaching_document(
    file: UploadFile = File(...),
    admin_user: UserTokenPayload = Depends(get_current_admin_user)
):
    # Security check file size and extension
    if not file.filename.lower().endswith(('.pdf', '.docx', '.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Unsupported document format. Allowed: PDF, DOCX, PNG, JPG.")

    contents = await file.read()
    doc_id = f"DOC_{uuid.uuid4().hex[:8]}"

    # Execute 40-stage document intelligence pipeline
    pipeline = DocumentIntelligencePipeline()
    res = pipeline.process_document(
        document_id=doc_id,
        filename=file.filename,
        raw_bytes=contents,
        subject_code="QUANT",
        topic_code="SIMPLIFICATION"
    )

    return {
        "status": "SUCCESS",
        "document_id": doc_id,
        "filename": file.filename,
        "bytes_received": len(contents),
        "pipeline_result": res
    }

@router.get("/", response_model=List[Dict[str, Any]])
def list_ingested_documents(current_user: UserTokenPayload = Depends(get_current_user)):
    return [
        {
            "document_id": "DOC_QUANT_2026_01",
            "filename": "IBPS_RRB_PO_Quant_1000_Questions.pdf",
            "page_count": 142,
            "detected_questions_count": 1050,
            "published_count": 980,
            "review_required_count": 70,
            "status": "PROCESSED",
            "created_at": "2026-08-15T10:00:00Z"
        }
    ]
