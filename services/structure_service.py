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
from utils.config import settings

class StructureService:
    """Service for generating and processing chemical structures."""

    def __init__(self):
        """Initializes the service with image settings."""
        self.image_size = (400, 400)
        self.image_format = 'PNG'

    def _validate_smiles_rings(self, smiles: str) -> bool:
        """
        Validate that all ring closures in SMILES are properly paired.
        Returns True if valid, False if there are unclosed rings.
        """
        import re
        
        # Find all ring closure numbers (digits after certain atoms)
        ring_pattern = r'[A-Za-z\])](\d+)'
        ring_numbers = re.findall(ring_pattern, smiles)
        
        # Count occurrences of each ring number
        ring_counts = {}
        for ring_num in ring_numbers:
            ring_counts[ring_num] = ring_counts.get(ring_num, 0) + 1
        
        # Each ring number should appear exactly twice
        for ring_num, count in ring_counts.items():
            if count != 2:
                return False
        
        return True

    def _fix_common_smiles_errors(self, smiles: str) -> str:
        """
        Attempt to fix common SMILES errors.
        """
        # Remove any trailing/leading whitespace
        smiles = smiles.strip()
        
        # Remove any non-SMILES characters (except valid ones)
        valid_chars = set('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@+\\-[]()=#$:/.%')
        smiles = ''.join(c for c in smiles if c in valid_chars)
        
        # Try to fix unbalanced parentheses
        open_parens = smiles.count('(')
        close_parens = smiles.count(')')
        if open_parens > close_parens:
            smiles += ')' * (open_parens - close_parens)
        elif close_parens > open_parens:
            smiles = '(' * (close_parens - open_parens) + smiles
        
        return smiles

    async def generate_structure(self, request: BaseAIRequest, proposal_text: str) -> StructureResponse:
        """
        Generates a chemical structure from proposal text, with enhanced error handling.
        """
        for attempt in range(settings.MAX_RETRIES):
            try:
                # Generate SMILES and name using AI with improved prompt
                smiles, name = await self._generate_smiles_and_name(request, proposal_text, attempt)

                # Validate and fix SMILES if needed
                smiles = self._fix_common_smiles_errors(smiles)
                
                # Validate ring closures
                if not self._validate_smiles_rings(smiles):
                    raise ValueError(f"SMILES has unclosed rings: {smiles}")

                # Validate with RDKit
                if not self.validate_smiles(smiles):
                    raise ValueError(f"Invalid SMILES string: {smiles}")

                # Generate structure image
                image_base64 = self._generate_structure_image(smiles)

                return StructureResponse(
                    smiles=smiles,
                    name=name,
                    image_base64=image_base64
                )

            except ValueError as e:
                if attempt == settings.MAX_RETRIES - 1:
                    # On final attempt, try to generate a simple fallback structure
                    try:
                        fallback_smiles, fallback_name = await self._generate_fallback_structure(request, proposal_text)
                        if self.validate_smiles(fallback_smiles):
                            image_base64 = self._generate_structure_image(fallback_smiles)
                            return StructureResponse(
                                smiles=fallback_smiles,
                                name=fallback_name,
                                image_base64=image_base64
                            )
                    except:
                        pass
                    
                    raise HTTPException(
                        status_code=400,
                        detail=f"Failed to generate valid structure after {settings.MAX_RETRIES} attempts. Last error: {str(e)}"
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

    async def _generate_smiles_and_name(self, request: BaseAIRequest, proposal_text: str, attempt: int = 0) -> Tuple[str, str]:
        """Generates a SMILES string and chemical name using an AI service with improved prompts."""
        
        # Adjust prompt based on attempt number
        complexity_guidance = ""
        if attempt > 0:
            complexity_guidance = "\n- Prefer SIMPLER structures with fewer rings\n- Avoid complex polycyclic systems\n- Use basic functional groups"
        
        prompt = f"""Based on the following research proposal, generate a chemically valid compound for synthesis.

CRITICAL REQUIREMENTS:
- The SMILES string MUST be chemically valid and parseable by RDKit
- All ring closures must be properly paired (each number appears exactly twice)
- Avoid overly complex polycyclic structures
- Structure should be synthetically accessible{complexity_guidance}

Respond ONLY in this exact format:
SMILES: [valid SMILES string]
NAME: [chemical name - IUPAC or common name]

Research Proposal:
{proposal_text}

Examples of GOOD SMILES patterns:
- Simple rings: c1ccccc1 (benzene)
- Functional groups: CC(=O)O (acetic acid)
- Moderate complexity: c1ccc2c(c1)cccc2 (naphthalene)

AVOID complex patterns that may have ring closure errors."""

        try:
            response = await ai_service.generate_response(request, prompt)
            return self._parse_ai_response(response)
        except Exception as e:
            raise Exception(f"Error calling AI service for SMILES and name: {str(e)}")

    async def _generate_fallback_structure(self, request: BaseAIRequest, proposal_text: str) -> Tuple[str, str]:
        """Generate a simple fallback structure when complex generation fails."""
        
        prompt = f"""Generate a VERY SIMPLE chemical compound related to this research. 

REQUIREMENTS:
- Use ONLY simple, well-known structures
- No complex ring systems
- Maximum 2 rings if any
- Common functional groups only

Respond ONLY in this format:
SMILES: [simple SMILES]
NAME: [simple chemical name]

Research area: {proposal_text[:200]}...

Example simple structures:
- Benzene: c1ccccc1
- Toluene: Cc1ccccc1  
- Benzoic acid: O=C(O)c1ccccc1
- Phenol: Oc1ccccc1"""

        try:
            response = await ai_service.generate_response(request, prompt)
            return self._parse_ai_response(response)
        except Exception as e:
            # Ultimate fallback - return a known good structure
            return "c1ccccc1", "Benzene (fallback structure)"

    def _parse_ai_response(self, response: str) -> Tuple[str, str]:
        """Parses the AI response to extract a SMILES string and chemical name."""
        try:
            lines = [line.strip() for line in response.split('\n') if line.strip()]
            smiles, name = None, None

            for line in lines:
                if line.startswith("SMILES:"):
                    smiles = line.replace("SMILES:", "").strip().replace("`", "").replace("'", "").replace('"', '')
                elif line.startswith("NAME:"):
                    name = line.replace("NAME:", "").strip()

            if not smiles:
                raise ValueError("No SMILES string found in AI response")
            if not name:
                raise ValueError("No chemical name found in AI response")

            # Clean up SMILES string more thoroughly
            smiles = re.sub(r'[^A-Za-z0-9@+\-\[\]()=#$:/.\\%]', '', smiles)

            if not smiles:
                raise ValueError("Invalid SMILES string after cleaning")

            return smiles, name
        except Exception as e:
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

# Global structure service instance
structure_service = StructureService()