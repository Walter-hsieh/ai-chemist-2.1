# routers/documents.py
from fastapi import APIRouter, HTTPException
import logging

from models.schemas import FinalProposalRequest, FinalDocumentsResponse
from services.document_service import document_service

router = APIRouter()

@router.post("/documents/generate", response_model=FinalDocumentsResponse)
async def generate_final_documents(request: FinalProposalRequest):
    """Generate final research proposal documents"""
    try:
        # Log the request for debugging
        logging.info(f"Generating documents for molecule: {request.molecule_name}")
        
        documents_response = await document_service.generate_final_documents(
            request=request,
            summary_text=request.summary_text,
            proposal_text=request.proposal_text,
            smiles_string=request.smiles_string,
            structure_image_base64=request.structure_image_base64,
            molecule_name=request.molecule_name,
            availability_info=getattr(request, 'availability_info', None)
        )
        
        return documents_response
        
    except ValueError as e:
        # Handle validation errors
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except Exception as e:
        # Log the full error for debugging
        logging.error(f"Error generating documents: {str(e)}", exc_info=True)
        
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error generating documents: {str(e)}")