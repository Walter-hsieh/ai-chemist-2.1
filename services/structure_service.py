# services/structure_service.py
import io
import base64
import re
from typing import Dict, Any, Tuple

from fastapi import HTTPException
from rdkit import Chem
from rdkit.Chem import Draw, Descriptors, Lipinski
from rdkit.Chem import rdDepictor

from models.schemas import BaseAIRequest, StructureResponse
from services.ai_service import ai_service
from services.chemical_info_service import chemical_info_service
from utils.config import settings

class StructureService:
    """Service for generating and processing chemical structures."""

    def __init__(self):
        """Initializes the service with image settings."""
        self.image_size = (400, 400)
        self.image_format = 'PNG'

    async def generate_structure(self, request: BaseAIRequest, proposal_text: str) -> StructureResponse:
        """
        Generates a chemical structure from proposal text, retrying on failure.
        """
        for attempt in range(settings.MAX_RETRIES):
            try:
                # Generate SMILES and name using AI
                smiles, name = await self._generate_smiles_and_name(request, proposal_text)

                # Validate and generate structure image
                image_base64 = self._generate_structure_image(smiles)
                
                # Verify chemical availability
                availability_info = await chemical_info_service.verify_chemical_availability(smiles, name)
                
                # Get molecular properties
                properties = self.get_molecule_properties(smiles)
                
                # If availability is low, suggest similar compounds
                similar_compounds = []
                if availability_info["availability_score"] < 50:
                    similar_compounds = await chemical_info_service.search_similar_compounds(smiles)

                return StructureResponse(
                    smiles=smiles,
                    name=name,
                    image_base64=image_base64,
                    availability_info=availability_info,
                    properties=properties,
                    similar_compounds=similar_compounds
                )

            except ValueError as e:
                if attempt == settings.MAX_RETRIES - 1:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Failed to generate valid structure after {settings.MAX_RETRIES} attempts: {str(e)}"
                    )
                continue
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"An unexpected error occurred while generating the structure: {str(e)}"
                )

        raise HTTPException(
            status_code=500,
            detail="Failed to generate structure after multiple attempts."
        )

    async def _generate_smiles_and_name(self, request: BaseAIRequest, proposal_text: str) -> Tuple[str, str]:
        """Generates a SMILES string and chemical name using an AI service."""
        prompt = f"""Based on the following research proposal, identify a commercially available or well-documented chemical compound relevant to the research goals.

Respond ONLY in this exact format:
SMILES: [valid SMILES string]
NAME: [chemical name - IUPAC or common name]
SOURCE: [e.g., PubChem CID, Sigma-Aldrich catalog number, DOI of a relevant paper]

Requirements:
- The compound must be commercially available or have a published, reproducible synthesis.
- Provide a specific source (e.g., PubChem CID, catalog number, or DOI) to verify the compound's existence and availability.
- The compound's function must be directly relevant to the stated research proposal.
- Prioritize compounds with established safety and handling protocols.

Research Proposal:
{proposal_text}"""

        try:
            response = await ai_service.generate_response(request, prompt)
            return self._parse_ai_response(response)
        except Exception as e:
            # Re-raising as a standard exception to be caught by the calling function
            raise Exception(f"Error calling AI service for SMILES and name: {str(e)}")

    def _parse_ai_response(self, response: str) -> Tuple[str, str]:
        """Parses the AI response to extract a SMILES string and chemical name."""
        try:
            lines = [line.strip() for line in response.split('\n') if line.strip()]
            smiles, name = None, None

            for line in lines:
                if line.startswith("SMILES:"):
                    smiles = line.replace("SMILES:", "").strip().replace("`", "")
                elif line.startswith("NAME:"):
                    name = line.replace("NAME:", "").strip()

            if not smiles:
                raise ValueError("No SMILES string found in AI response")
            if not name:
                raise ValueError("No chemical name found in AI response")

            # Clean up SMILES string to remove any invalid characters
            smiles = re.sub(r'[^A-Za-z0-9@+\-\[\]()=#$:/.\\]', '', smiles)

            if not smiles:
                raise ValueError("Invalid SMILES string after cleaning")

            return smiles, name
        except Exception as e:
            # Correctly raise a ValueError with a detailed message for parsing failures
            raise ValueError(f"Failed to parse AI response: {str(e)}. Response: '{response}'")

    def _generate_structure_image(self, smiles: str) -> str:
        """Generates a base64-encoded structure image from a SMILES string."""
        try:
            mol = Chem.MolFromSmiles(smiles)
            if mol is None:
                raise ValueError(f"Invalid SMILES string provided: {smiles}")

            # Generate 2D coordinates for a better drawing
            rdDepictor.Compute2DCoords(mol)

            # Generate the image
            img = Draw.MolToImage(mol, size=self.image_size)

            # Convert image to base64
            buffer = io.BytesIO()
            img.save(buffer, format=self.image_format)
            image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

            return image_base64
        except Exception as e:
            # Raise as ValueError to indicate an issue with image generation
            raise ValueError(f"Failed to generate structure image: {str(e)}")

    def validate_smiles(self, smiles: str) -> bool:
        """Validates if a SMILES string is chemically valid using RDKit."""
        try:
            mol = Chem.MolFromSmiles(smiles)
            return mol is not None
        except:
            return False

    def get_molecule_properties(self, smiles: str) -> Dict[str, Any]:
        """Calculates basic molecular properties from a SMILES string."""
        try:
            mol = Chem.MolFromSmiles(smiles)
            if mol is None:
                return {}

            properties = {
                "molecular_weight": round(Descriptors.MolWt(mol), 2),
                "num_atoms": mol.GetNumAtoms(),
                "num_bonds": mol.GetNumBonds(),
                "num_rings": Descriptors.RingCount(mol),
                "lipinski_hbd": Lipinski.NumHDonors(mol),
                "lipinski_hba": Lipinski.NumHAcceptors(mol),
                "logp": round(Descriptors.MolLogP(mol), 2)
            }
            return properties
        except Exception as e:
            print(f"Error calculating molecular properties: {e}")
            return {}

# Global structure service instance, created correctly
structure_service = StructureService()