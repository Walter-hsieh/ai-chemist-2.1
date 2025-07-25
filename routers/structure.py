# routers/structure.py
from fastapi import APIRouter, HTTPException

from models.schemas import StructureRequest, StructureResponse
from services.structure_service import structure_service

router = APIRouter()

@router.post("/structure/generate", response_model=StructureResponse)
async def generate_chemical_structure(request: StructureRequest):
    """Generate a chemical structure from research proposal text"""
    try:
        structure_response = await structure_service.generate_structure(
            request, request.proposal_text
        )
        
        return structure_response
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error generating structure: {str(e)}")

@router.get("/structure/validate")
async def validate_smiles(smiles: str):
    """Validate a SMILES string"""
    try:
        is_valid = structure_service.validate_smiles(smiles)
        properties = {}
        
        if is_valid:
            properties = structure_service.get_molecule_properties(smiles)
        
        return {
            "smiles": smiles,
            "is_valid": is_valid,
            "properties": properties
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating SMILES: {str(e)}")

@router.get("/structure/properties")
async def get_molecule_properties(smiles: str):
    """Get molecular properties from SMILES string"""
    try:
        if not structure_service.validate_smiles(smiles):
            raise HTTPException(status_code=400, detail="Invalid SMILES string")
        
        properties = structure_service.get_molecule_properties(smiles)
        
        return {
            "smiles": smiles,
            "properties": properties
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error getting properties: {str(e)}")