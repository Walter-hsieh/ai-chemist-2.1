# routers/upload.py
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from models.schemas import UploadResponse, ErrorResponse
from services.file_service import file_service

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_files(files: List[UploadFile] = File(...)):
    """Upload files to the knowledge base"""
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")
        
        result = await file_service.upload_files(files)
        
        return UploadResponse(
            message=f"Successfully uploaded {result['files_uploaded']} files ({result['total_size_mb']:.2f} MB)",
            files_uploaded=result['files_uploaded'],
            total_size_mb=result['total_size_mb']
        )
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/knowledge-base/stats")
async def get_knowledge_base_stats():
    """Get statistics about the current knowledge base"""
    try:
        stats = file_service.get_knowledge_base_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")

@router.delete("/knowledge-base/clear")
async def clear_knowledge_base():
    """Clear all files from the knowledge base"""
    try:
        result = file_service.clear_knowledge_base()
        return result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error clearing knowledge base: {str(e)}")