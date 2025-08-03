# services/template_service.py
from typing import Dict, Any
from services.ai_service import ai_service
from models.schemas import BaseAIRequest

class TemplateService:
    """Service for managing consistent proposal templates and formatting"""
    
    def __init__(self):
        self.enhanced_proposal_template = """You are a PhD-level chemist writing a research proposal. Create a clear, professional proposal suitable for academic or industrial research.

# {molecule_name} - Research Proposal

## Executive Summary
Write a concise 150-word summary covering:
- The research problem and why it matters
- Your proposed solution using {molecule_name} (SMILES: {smiles_string})
- Expected outcomes and impact

## 1. Background & Objectives
### Current Challenge
- What problem does this research address?
- Why is this problem important now?

### Research Objectives
- List 3 main objectives (be specific and measurable)
- State your hypothesis clearly

### Innovation
- What makes this approach novel?
- How does it improve on existing solutions?

## 2. Technical Approach
### Why {molecule_name}?
- Explain why this specific molecule was chosen
- Key structural features and expected properties
- How it addresses the research objectives
{availability_context}

### Synthesis Plan
- Main synthetic route (3-5 key steps)
- Starting materials and key reagents
- Expected challenges and solutions
- Estimated timeline: X weeks/months

### Characterization & Testing
- How will you confirm successful synthesis? (NMR, MS, etc.)
- What properties will you measure?
- What defines success for this project?

## 3. Experimental Details
### Materials & Methods
- List main equipment needed
- Key experimental conditions
- Safety considerations

### Work Plan
- Phase 1 (Months 1-3): Initial synthesis and optimization
- Phase 2 (Months 4-6): Scale-up and characterization  
- Phase 3 (Months 7-9): Application testing and analysis

## 4. Expected Impact
### Scientific Contributions
- What new knowledge will this generate?
- Potential publications or patents

### Practical Applications
- Who will benefit from this research?
- Potential commercial or societal impact

## 5. Resources & Feasibility
### Requirements
- Key equipment and facilities needed
- Estimated material costs
- Required expertise

### Risk Mitigation
- Main technical risks
- Backup plans if primary approach fails

---

WRITING GUIDELINES:
- Be concise but thorough (aim for 3-4 pages total)
- Use clear, professional language
- Include specific details where possible
- Focus on feasibility and practical outcomes
- Avoid jargon when simpler terms work
- Make it compelling but realistic

Generate a research proposal that is both scientifically sound and practically achievable."""

    async def generate_enhanced_proposal(
        self,
        request: BaseAIRequest,
        summary_text: str,
        proposal_text: str,
        smiles_string: str,
        molecule_name: str,
        availability_info: Dict[str, Any] = None
    ) -> str:
        """Generate enhanced proposal using the comprehensive template"""
        
        # Simple availability context
        availability_context = ""
        if availability_info and availability_info.get("availability_score", 0) >= 70:
            availability_context = "\n- Note: This compound appears to be commercially available, which may accelerate research timelines."
        elif availability_info and availability_info.get("availability_score", 0) >= 40:
            availability_context = "\n- Note: This compound may be commercially available. Verify with suppliers before synthesis."
        else:
            availability_context = "\n- Note: This compound likely requires custom synthesis."
        
        # Fill in the template
        filled_template = self.enhanced_proposal_template.format(
            molecule_name=molecule_name,
            smiles_string=smiles_string,
            availability_context=availability_context
        )
        
        # Build the prompt
        prompt = f"""{filled_template}

CONTEXT TO INCORPORATE:
Research Topic Summary: {summary_text[:500]}...

Initial Proposal Idea: {proposal_text[:300]}...

Create a focused, practical research proposal that a graduate student or research team could actually execute."""

        try:
            response = await ai_service.generate_response(request, prompt)
            return response
        except Exception as e:
            raise Exception(f"Error generating enhanced proposal: {str(e)}")

    async def generate_design_rationale(
        self,
        request: BaseAIRequest,
        smiles_string: str,
        molecule_name: str,
        proposal_context: str,
        availability_info: Dict[str, Any] = None
    ) -> str:
        """Generate simple chemical design rationale"""
        
        prompt = f"""As a chemistry expert, explain why {molecule_name} (SMILES: {smiles_string}) is a good choice for this research.

Research Context: {proposal_context[:200]}...

Provide a brief but compelling explanation covering:
1. Key structural features that make this molecule suitable
2. Expected properties and behavior
3. Synthesis feasibility (is it reasonably easy to make?)
4. Safety considerations
5. Why this is better than obvious alternatives

Keep it concise (2-3 paragraphs) but scientifically sound."""

        try:
            response = await ai_service.generate_response(request, prompt)
            return response
        except Exception as e:
            raise Exception(f"Error generating design rationale: {str(e)}")

# Global template service instance
template_service = TemplateService()