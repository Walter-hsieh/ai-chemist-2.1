# routers/documents.py
from fastapi import APIRouter, HTTPException

from models.schemas import FinalProposalRequest, FinalDocumentsResponse
from services.document_service import document_service

router = APIRouter()

@router.post("/documents/generate", response_model=FinalDocumentsResponse)
async def generate_final_documents(request: FinalProposalRequest):
    """Generate final research proposal documents"""
    try:
        documents_response = await document_service.generate_final_documents(
            request=request,
            summary_text=request.summary_text,
            proposal_text=request.proposal_text,
            smiles_string=request.smiles_string,
            structure_image_base64=request.structure_image_base64,
            molecule_name=request.molecule_name
        )
        
        return documents_response
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error generating documents: {str(e)}")