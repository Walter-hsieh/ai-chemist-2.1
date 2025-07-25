# services/document_service.py
import io
import base64
from typing import Dict, Any
from fastapi import HTTPException
import openpyxl
from docx import Document
from docx.shared import Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

from models.schemas import BaseAIRequest, FinalDocumentsResponse
from services.ai_service import ai_service

class DocumentService:
    """Service for generating research documents"""
    
    def __init__(self):
        pass
    
    async def generate_final_documents(
        self, 
        request: BaseAIRequest,
        summary_text: str,
        proposal_text: str,
        smiles_string: str,
        structure_image_base64: str,
        molecule_name: str
    ) -> FinalDocumentsResponse:
        """Generate all final documents for the research proposal"""
        
        try:
            # Generate comprehensive proposal text
            full_proposal = await self._generate_full_proposal(
                request, summary_text, proposal_text, smiles_string, molecule_name
            )
            
            # Generate synthesis recipe
            recipe_base64 = await self._generate_recipe_excel(
                request, proposal_text, smiles_string, molecule_name
            )
            
            # Generate data recording template
            data_template_base64 = self._generate_data_template()
            
            # Generate Word document
            docx_base64 = self._generate_proposal_docx(
                full_proposal, structure_image_base64, molecule_name
            )
            
            return FinalDocumentsResponse(
                full_proposal_text=full_proposal,
                recipe_file_base64=recipe_base64,
                data_template_base64=data_template_base64,
                proposal_docx_base64=docx_base64
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating documents: {str(e)}"
            )
    
    async def _generate_full_proposal(
        self, 
        request: BaseAIRequest,
        summary_text: str,
        proposal_text: str,
        smiles_string: str,
        molecule_name: str
    ) -> str:
        """Generate comprehensive research proposal"""
        
        prompt = f"""You are a PhD-level chemist writing a detailed research proposal. Create a comprehensive, professional proposal that would be suitable for submission to a funding agency or academic institution.

STRUCTURE YOUR PROPOSAL WITH THESE SECTIONS:
1. Title
2. Abstract (150-200 words)
3. Introduction and Background (cite the literature findings)
4. Research Objectives and Hypotheses
5. Methodology and Experimental Design
6. Expected Outcomes and Impact
7. Timeline and Milestones
8. Budget Considerations
9. Risk Assessment and Mitigation
10. Conclusion

CONTEXT INFORMATION:
- Literature Summary: {summary_text}
- Core Research Idea: {proposal_text}
- Target Molecule: {molecule_name}
- Target Molecule SMILES: {smiles_string}

REQUIREMENTS:
- Write in a professional, academic tone
- Include specific experimental procedures
- Reference the literature findings in your introduction
- Make the proposal scientifically rigorous and feasible
- Include safety considerations
- Suggest analytical methods for characterization
- Discuss potential applications and broader impact
- Make it publication-quality writing

Generate a comprehensive research proposal that demonstrates deep understanding of the field and presents a compelling case for funding."""

        try:
            response = await ai_service.generate_response(request, prompt)
            return response
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating full proposal: {str(e)}"
            )
    
    async def _generate_recipe_excel(
        self,
        request: BaseAIRequest,
        proposal_text: str,
        smiles_string: str,
        molecule_name: str
    ) -> str:
        """Generate synthesis recipe as Excel file"""
        
        prompt = f"""Based on the research proposal and target molecule, create a detailed synthesis recipe. Provide a list of chemicals needed with the following information for each:

Chemical Name | Molecular Weight (g/mol) | Amount (mg or mL) | Equivalents | CAS Number | Supplier | Safety Notes

Target Molecule: {molecule_name}
SMILES: {smiles_string}
Research Context: {proposal_text}

Provide realistic amounts for a small-scale laboratory synthesis (1-10 mmol scale). Include:
- Starting materials
- Reagents
- Catalysts
- Solvents
- Purification materials

Format each line as: Chemical Name, Molecular Weight, Amount, Equivalents, CAS Number, Supplier, Safety Notes

Be specific and realistic. If you're not certain about exact procedures, provide reasonable estimates based on similar reactions."""

        try:
            recipe_response = await ai_service.generate_response(request, prompt)
            
            # Create Excel workbook
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = "Synthesis Recipe"
            
            # Add headers
            headers = [
                "Chemical Name", "Molecular Weight (g/mol)", "Amount", 
                "Equivalents", "CAS Number", "Supplier", "Safety Notes"
            ]
            ws.append(headers)
            
            # Style headers
            for cell in ws[1]:
                cell.font = openpyxl.styles.Font(bold=True)
                cell.fill = openpyxl.styles.PatternFill(
                    start_color="CCCCCC", end_color="CCCCCC", fill_type="solid"
                )
            
            # Add recipe data
            lines = recipe_response.strip().split('\n')
            for line in lines:
                if ',' in line and not line.startswith('#'):
                    row_data = [item.strip() for item in line.split(',')]
                    if len(row_data) >= 4:  # At least name, MW, amount, equiv
                        # Pad row to 7 columns if needed
                        while len(row_data) < 7:
                            row_data.append("")
                        ws.append(row_data[:7])  # Take only first 7 columns
            
            # Auto-adjust column widths
            for column in ws.columns:
                max_length = 0
                column_letter = column[0].column_letter
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                adjusted_width = min(max_length + 2, 50)
                ws.column_dimensions[column_letter].width = adjusted_width
            
            # Save to bytes
            buffer = io.BytesIO()
            wb.save(buffer)
            buffer.seek(0)
            
            return base64.b64encode(buffer.getvalue()).decode('utf-8')
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating recipe Excel: {str(e)}"
            )
    
    def _generate_data_template(self) -> str:
        """Generate data recording template Excel file"""
        
        try:
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = "Experimental Data"
            
            # Add headers for experimental tracking
            headers = [
                "Experiment ID", "Date", "Researcher", "Reaction Conditions",
                "Starting Material (mg)", "Reagent 1 (mg)", "Reagent 2 (mg)",
                "Solvent (mL)", "Temperature (°C)", "Reaction Time (h)",
                "Stirring Rate (rpm)", "Atmosphere", "Workup Method",
                "Crude Yield (mg)", "Purified Yield (mg)", "Yield (%)",
                "Purity (NMR/HPLC)", "Melting Point (°C)", "Spectral Data",
                "Notes", "Success Rating (1-5)"
            ]
            
            ws.append(headers)
            
            # Style headers
            for cell in ws[1]:
                cell.font = openpyxl.styles.Font(bold=True)
                cell.fill = openpyxl.styles.PatternFill(
                    start_color="4472C4", end_color="4472C4", fill_type="solid"
                )
                cell.font = openpyxl.styles.Font(color="FFFFFF", bold=True)
            
            # Add some example rows
            example_rows = [
                ["EXP-001", "2024-01-15", "Researcher Name", "Standard conditions", 
                 "100", "50", "25", "10", "80", "2", "500", "N2", "Aqueous workup",
                 "85", "78", "78%", ">95%", "145-147", "See attached", "Good reaction", "4"],
                ["EXP-002", "", "", "", "", "", "", "", "", "", "", "", "",
                 "", "", "", "", "", "", "", ""]
            ]
            
            for row in example_rows:
                ws.append(row)
            
            # Auto-adjust column widths
            for column in ws.columns:
                max_length = 0
                column_letter = column[0].column_letter
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                adjusted_width = min(max_length + 2, 30)
                ws.column_dimensions[column_letter].width = adjusted_width
            
            # Save to bytes
            buffer = io.BytesIO()
            wb.save(buffer)
            buffer.seek(0)
            
            return base64.b64encode(buffer.getvalue()).decode('utf-8')
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating data template: {str(e)}"
            )
    
    def _generate_proposal_docx(
        self,
        full_proposal_text: str,
        structure_image_base64: str,
        molecule_name: str
    ) -> str:
        """Generate Word document with proposal and structure"""
        
        try:
            doc = Document()
            
            # Set document style
            style = doc.styles['Normal']
            style.font.name = 'Times New Roman'
            # Note: Cannot set font size this way in python-docx, skip this line
            
            # Add title
            title = doc.add_heading('AI-Generated Research Proposal', 0)
            title.alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            # Add structure image if available
            if structure_image_base64:
                try:
                    # Decode base64 image
                    img_data = base64.b64decode(structure_image_base64)
                    image_stream = io.BytesIO(img_data)
                    
                    # Add centered paragraph for image
                    img_paragraph = doc.add_paragraph()
                    img_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    run = img_paragraph.runs[0] if img_paragraph.runs else img_paragraph.add_run()
                    run.add_picture(image_stream, width=Inches(4.0))
                    
                    # Add caption
                    caption = doc.add_paragraph(f"Figure 1: Target Molecular Structure - {molecule_name}")
                    caption.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    caption.style = 'Caption'
                    
                except Exception as e:
                    print(f"Could not add image to document: {e}")
                    doc.add_paragraph(f"[Structure image could not be embedded - {molecule_name}]")
            
            doc.add_page_break()
            
            # Process proposal text
            sections = full_proposal_text.split('\n')
            
            for line in sections:
                line = line.strip()
                if not line:
                    continue
                
                # Handle different heading levels
                if line.startswith('# '):
                    doc.add_heading(line[2:], level=1)
                elif line.startswith('## '):
                    doc.add_heading(line[3:], level=2)
                elif line.startswith('### '):
                    doc.add_heading(line[4:], level=3)
                elif line.startswith('#### '):
                    doc.add_heading(line[5:], level=4)
                elif line.upper() in ['ABSTRACT', 'INTRODUCTION', 'METHODOLOGY', 'CONCLUSION', 
                                    'RESULTS', 'DISCUSSION', 'REFERENCES', 'BACKGROUND',
                                    'OBJECTIVES', 'EXPERIMENTAL', 'TIMELINE', 'BUDGET']:
                    doc.add_heading(line.title(), level=2)
                elif ':' in line and len(line.split(':')[0]) < 50:  # Likely a section header
                    parts = line.split(':', 1)
                    if len(parts[0]) < 50:
                        doc.add_heading(parts[0].strip(), level=3)
                        if len(parts) > 1 and parts[1].strip():
                            doc.add_paragraph(parts[1].strip())
                    else:
                        doc.add_paragraph(line)
                else:
                    doc.add_paragraph(line)
            
            # Save to bytes
            buffer = io.BytesIO()
            doc.save(buffer)
            buffer.seek(0)
            
            return base64.b64encode(buffer.getvalue()).decode('utf-8')
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating Word document: {str(e)}"
            )

# Global document service instance
document_service = DocumentService()