# services/template_service.py
from typing import Dict, Any
from services.ai_service import ai_service
from models.schemas import BaseAIRequest

class TemplateService:
    """Service for managing consistent proposal templates and formatting"""
    
    def __init__(self):
        self.enhanced_proposal_template = """You are a PhD-level chemist writing a detailed research proposal. Create a comprehensive, professional proposal that would be suitable for submission to a funding agency or academic institution.

STRUCTURE YOUR PROPOSAL WITH THESE SECTIONS:

# [COMPELLING PROPOSAL TITLE]

## Abstract
Write a 150-200 word abstract that:
- Summarizes the research problem and its significance
- States the main hypothesis and approach
- Outlines expected outcomes and impact
- Uses clear, accessible language for both experts and non-experts

## 1. Introduction and Background
### 1.1 Research Problem
Clearly define the specific problem this research addresses and why it matters.

### 1.2 Literature Review
Based on the literature analysis:
- Summarize current state of the field
- Identify key findings and methodologies from recent studies
- Highlight research gaps this proposal will address
- Cite relevant work (use placeholder citations like [1], [2])

### 1.3 Innovation and Significance
Explain how this work advances the field and its potential impact.

## 2. Research Objectives and Hypotheses
### 2.1 Primary Objectives
List 3-4 specific, measurable objectives

### 2.2 Working Hypotheses
State testable hypotheses with clear rationale

### 2.3 Success Metrics
Define how success will be measured

## 3. Chemical Design and Rationale
### 3.1 Target Compound Selection
**Target Molecule**: {molecule_name}
**SMILES Notation**: {smiles_string}

### 3.2 Design Logic
Explain the scientific reasoning behind choosing this specific compound:
- Structure-activity relationships considered
- Expected properties and behavior
- Why this molecule addresses the research objectives
- Commercial availability and synthetic feasibility

### 3.3 Expected Properties
Based on computational predictions and literature:
- Physical and chemical properties
- Stability and reactivity considerations
- Safety profile and handling requirements

## 4. Methodology and Experimental Design
### 4.1 Synthesis Strategy
Detail the synthetic approach:
- Key synthetic steps and reactions
- Starting materials and reagents
- Expected yields and purification methods
- Scale-up considerations

### 4.2 Characterization Methods
Comprehensive analytical plan:
- NMR spectroscopy (1H, 13C, specialized techniques)
- Mass spectrometry approaches
- X-ray crystallography if applicable
- Other relevant analytical techniques

### 4.3 Performance Evaluation
Methods for testing key properties:
- Relevant assays and measurements
- Control experiments and standards
- Statistical analysis approaches

### 4.4 Safety Protocols
Detailed safety considerations:
- Hazard assessment of materials
- Personal protective equipment requirements
- Waste disposal protocols
- Emergency procedures

## 5. Expected Outcomes and Impact
### 5.1 Scientific Contributions
- New knowledge expected to be generated
- Methodological advances
- Publications anticipated

### 5.2 Broader Impact
- Applications in relevant fields
- Potential commercialization opportunities
- Societal benefits

## 6. Project Timeline and Milestones
### Phase 1 (Months 1-6): Synthesis and Initial Characterization
- Detailed monthly milestones
- Key deliverables and checkpoints

### Phase 2 (Months 7-12): Performance Evaluation and Optimization
- Testing protocols and validation
- Data analysis and interpretation

### Phase 3 (Months 13-18): Advanced Studies and Applications
- Extended applications and collaborations
- Publication and dissemination

## 7. Resource Requirements
### 7.1 Personnel
- Principal investigator responsibilities
- Required expertise and training
- Collaboration needs

### 7.2 Equipment and Facilities
- Specialized instrumentation required
- Access to core facilities
- Computational resources if needed

### 7.3 Budget Considerations
- Estimated costs for major categories
- Justification for major expenses
- Cost-effectiveness analysis

## 8. Risk Assessment and Mitigation
### 8.1 Technical Risks
- Potential synthetic challenges
- Alternative approaches
- Contingency plans

### 8.2 Timeline Risks
- Factors that could delay progress
- Buffer time and parallel work streams

### 8.3 Resource Risks
- Equipment availability and maintenance
- Supply chain considerations

## 9. Conclusion and Future Directions
### 9.1 Summary
Concise restatement of the proposal's significance and feasibility

### 9.2 Long-term Vision
How this work fits into a broader research program

### 9.3 Next Steps
Immediate actions upon funding approval

---

IMPORTANT REQUIREMENTS:
- Write in professional, academic language appropriate for peer review
- Include specific experimental details and methodologies
- Make realistic claims about feasibility and timelines
- Ensure internal consistency throughout the document
- Focus on the scientific merit and innovation
- Address potential reviewer concerns proactively
- Use clear, precise chemical nomenclature
- Include quantitative details where possible

Generate a comprehensive research proposal following this structure and incorporating all provided information."""

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
        
        # Prepare the template with context
        template = self.enhanced_proposal_template.format(
            molecule_name=molecule_name,
            smiles_string=smiles_string
        )
        
        # Add availability information if available
        availability_context = ""
        if availability_info:
            availability_score = availability_info.get("availability_score", 0)
            commercial_status = availability_info.get("commercial_availability", "unknown")
            
            if availability_score >= 70:
                availability_context = f"""
**Chemical Availability**: This compound appears to be commercially available (availability score: {availability_score}/100). 
Commercial sources should be verified before synthesis planning."""
            elif availability_score >= 40:
                availability_context = f"""
**Chemical Availability**: This compound may be commercially available (availability score: {availability_score}/100). 
Recommend checking multiple suppliers before pursuing synthesis."""
            else:
                availability_context = f"""
**Chemical Availability**: This compound likely requires synthesis (availability score: {availability_score}/100). 
Synthetic route development is a key component of this project."""
        
        # Build the comprehensive prompt
        prompt = f"""{template}

CONTEXT INFORMATION:
Literature Summary: {summary_text}

Core Research Idea: {proposal_text}

Target Molecule: {molecule_name}
SMILES: {smiles_string}

{availability_context}

Generate a comprehensive, publication-quality research proposal that addresses all sections in detail. Ensure the chemical design rationale is scientifically sound and the methodology is practically feasible."""

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
        """Generate detailed chemical design rationale"""
        
        prompt = f"""As an expert medicinal/synthetic chemist, provide a detailed scientific rationale for the selection of this specific molecular target. 

Target Molecule: {molecule_name}
SMILES: {smiles_string}
Research Context: {proposal_context}

Provide a comprehensive analysis covering:

1. **Structure-Activity Relationships (SAR)**
   - Key structural features and their predicted functions
   - How the molecular architecture relates to the intended application
   - Comparison with known active compounds in this space

2. **Computational Predictions**
   - Expected physical and chemical properties
   - ADMET considerations if relevant
   - Stability and reactivity predictions

3. **Synthetic Feasibility**
   - Assessment of synthetic accessibility
   - Key synthetic challenges and solutions
   - Scalability considerations

4. **Commercial Considerations**"""
        
        if availability_info:
            availability_score = availability_info.get("availability_score", 0)
            if availability_score >= 70:
                prompt += f"""
   - High commercial availability (score: {availability_score}/100)
   - Recommend supplier verification and quality assessment
   - Cost-effectiveness analysis vs. in-house synthesis"""
            elif availability_score >= 40:
                prompt += f"""
   - Moderate commercial availability (score: {availability_score}/100)
   - Should evaluate both purchase and synthesis options
   - Risk assessment for supply chain reliability"""
            else:
                prompt += f"""
   - Low commercial availability (score: {availability_score}/100)
   - Synthesis route development required
   - Opportunity for IP development and method optimization"""
        else:
            prompt += """
   - Commercial availability assessment needed
   - Recommend database searches and supplier queries
   - Evaluate purchase vs. synthesis economics"""

        prompt += """

5. **Safety and Handling**
   - Predicted hazards and safety classification
   - Special handling or storage requirements
   - Waste disposal considerations

6. **Alternative Considerations**
   - Brief discussion of alternative molecular targets
   - Why this specific compound was selected over alternatives
   - Risk mitigation if this compound proves problematic

Provide a scientifically rigorous analysis that demonstrates deep understanding of the molecular design principles."""

        try:
            response = await ai_service.generate_response(request, prompt)
            return response
        except Exception as e:
            raise Exception(f"Error generating design rationale: {str(e)}")

# Global template service instance
template_service = TemplateService()