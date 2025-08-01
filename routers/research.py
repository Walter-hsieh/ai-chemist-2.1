# routers/research.py
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from models.schemas import (
    ResearchRequest, ResearchResponse, RefineProposalRequest, 
    RefinedProposalResponse, DataSource, AIProvider
)
from services.research_service import research_service
from services.ai_service import ai_service
from services.history_service import history_service

router = APIRouter()

@router.get("/research/summarize", response_model=ResearchResponse)
async def generate_research_summary(
    topic: str = Query(..., description="Research topic to analyze"),
    source: DataSource = Query(default=DataSource.SEMANTIC_SCHOLAR, description="Data source to use"),
    api_key: str = Query(..., description="API key for AI provider"),
    api_provider: AIProvider = Query(default=AIProvider.GOOGLE, description="AI provider to use"),
    model_name: Optional[str] = Query(default=None, description="Specific model to use"),
    limit: int = Query(default=5, ge=1, le=20, description="Maximum papers to analyze")
):
    """Generate literature summary and research proposal"""
    try:
        # Create request object for AI service
        ai_request = ResearchRequest(
            topic=topic,
            source=source,
            api_key=api_key,
            api_provider=api_provider,
            model_name=model_name,
            limit=limit
        )
        
        # Create research session for history tracking
        session_id = history_service.create_research_session(
            topic=topic,
            source=source.value,
            api_provider=api_provider.value
        )
        
        # Fetch papers from selected source
        papers = await research_service.get_papers(topic, source, limit)
        
        if not papers:
            # Update session with failure status
            history_service.update_research_session(
                session_id,
                status="failed",
                papers_analyzed=0,
                error="No papers found"
            )
            
            if source == DataSource.LOCAL:
                return ResearchResponse(
                    topic=topic,
                    summary="Your local knowledge base is empty. Please upload some documents first.",
                    proposal="",
                    papers_analyzed=0,
                    source_used=source
                )
            else:
                return ResearchResponse(
                    topic=topic,
                    summary="Could not find any relevant papers from the selected source.",
                    proposal="",
                    papers_analyzed=0,
                    source_used=source
                )
        
        # Format papers for AI processing
        papers_text = research_service.format_papers_for_ai(papers)
        
        # Generate summary
        if source == DataSource.LOCAL:
            summary_prompt = f"""Summarize the key findings and themes from the following documents for a chemist. The user is interested in the topic: '{topic}'.

Focus on:
- Main research themes and findings
- Key methodologies mentioned
- Important chemical compounds or materials
- Research gaps or opportunities

Documents:
{papers_text}"""
        else:
            summary_prompt = f"""Analyze these research papers about '{topic}' and provide a comprehensive summary for a chemist.

Focus on:
- Current state of the field
- Key findings and breakthroughs
- Main research methodologies
- Important chemical compounds or materials
- Research trends and gaps

Papers:
{papers_text}"""
        
        summary_text = await ai_service.generate_response(ai_request, summary_prompt)
        
        # Generate research proposal
        proposal_prompt = f"""Based on the following literature summary, propose a novel and feasible research direction that addresses identified gaps or builds upon current findings.

Your proposal should:
- Be scientifically innovative but achievable
- Address a clear research need
- Suggest specific materials or compounds to investigate
- Be suitable for academic or industrial research

Literature Summary:
{summary_text}

Generate a compelling research proposal (2-3 paragraphs) that a chemist could pursue."""
        
        proposal_text = await ai_service.generate_response(ai_request, proposal_prompt)
        
        reason_prompt = f"""Based on the following literature summary and research proposal, provide a concise (1-2 paragraphs) justification for why the proposed chemical or material is a good choice for the research topic.

Focus on how it addresses the identified research gaps or builds upon existing work.

Literature Summary:
{summary_text}

Research Proposal:
{proposal_text}

Provide a clear and compelling reason for selecting the proposed material."""

        reason_text = await ai_service.generate_response(ai_request, reason_prompt)

        # Update session with successful completion
        history_service.update_research_session(
            session_id,
            status="completed",
            papers_analyzed=len(papers),
            summary=summary_text[:500] + "..." if len(summary_text) > 500 else summary_text,  # Truncate for storage
            proposal=proposal_text[:500] + "..." if len(proposal_text) > 500 else proposal_text  # Truncate for storage
        )
        
        return ResearchResponse(
            topic=topic,
            summary=summary_text,
            proposal=proposal_text,
            reason=reason_text,
            papers_analyzed=len(papers),
            source_used=source
        )
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error generating research summary: {str(e)}")

@router.post("/research/refine", response_model=RefinedProposalResponse)
async def refine_research_proposal(request: RefineProposalRequest):
    """Refine research proposal based on user feedback"""
    try:
        refine_prompt = f"""A user has provided feedback on a research proposal. Generate an improved version that addresses their concerns.

Original Proposal:
{request.original_proposal}

User Feedback:
{request.user_feedback}

Instructions:
- Address the specific concerns raised in the feedback
- Maintain scientific rigor and feasibility
- Keep the core research direction but modify based on feedback
- Ensure the new proposal is compelling and well-structured

Generate an improved research proposal that incorporates the user's feedback while maintaining scientific excellence."""
        
        new_proposal = await ai_service.generate_response(request, refine_prompt)
        
        return RefinedProposalResponse(
            new_proposal=new_proposal,
            refinement_reason=request.user_feedback
        )
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error refining proposal: {str(e)}")