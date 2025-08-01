# models/schemas.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from enum import Enum

class AIProvider(str, Enum):
    """Supported AI providers"""
    OPENAI = "openai"
    GOOGLE = "google"

class DataSource(str, Enum):
    """Supported data sources"""
    LOCAL = "local"
    SEMANTIC_SCHOLAR = "semantic"
    ARXIV = "arxiv"

class BaseAIRequest(BaseModel):
    """Base model for AI requests"""
    model_config = {"protected_namespaces": ()}
    
    api_key: str = Field(..., description="API key for the selected provider")
    api_provider: AIProvider = Field(default=AIProvider.GOOGLE, description="AI provider to use")
    model_name: Optional[str] = Field(default=None, description="Specific model name to use")
    
    @validator('api_key')
    def validate_api_key(cls, v):
        if not v or not v.strip():
            raise ValueError('API key cannot be empty')
        return v.strip()

class ResearchRequest(BaseAIRequest):
    """Request model for research summary generation"""
    topic: str = Field(..., description="Research topic to analyze")
    source: DataSource = Field(default=DataSource.SEMANTIC_SCHOLAR, description="Data source to use")
    limit: int = Field(default=5, ge=1, le=20, description="Maximum number of papers to analyze")
    
    @validator('topic')
    def validate_topic(cls, v):
        if not v or not v.strip():
            raise ValueError('Research topic cannot be empty')
        return v.strip()

class RefineProposalRequest(BaseAIRequest):
    """Request model for proposal refinement"""
    original_proposal: str = Field(..., description="Original proposal text")
    user_feedback: str = Field(..., description="User feedback for improvement")
    
    @validator('user_feedback')
    def validate_feedback(cls, v):
        if not v or not v.strip():
            raise ValueError('User feedback cannot be empty')
        return v.strip()

class StructureRequest(BaseAIRequest):
    """Request model for chemical structure generation"""
    proposal_text: str = Field(..., description="Research proposal text")

class FinalProposalRequest(BaseAIRequest):
    """Request model for final document generation"""
    summary_text: str = Field(..., description="Literature summary")
    proposal_text: str = Field(..., description="Research proposal")
    smiles_string: str = Field(..., description="SMILES notation of the molecule")
    structure_image_base64: str = Field(..., description="Base64 encoded structure image")
    molecule_name: str = Field(..., description="Chemical name of the molecule")
    availability_info: Optional[Dict[str, Any]] = Field(default=None, description="Chemical availability information")

# Response Models
class Paper(BaseModel):
    """Model for scientific paper"""
    title: str
    abstract: str
    source: Optional[str] = None

class ResearchResponse(BaseModel):
    """Response model for research analysis"""
    topic: str
    summary: str
    proposal: str
    reason: str
    papers_analyzed: int
    source_used: DataSource

class StructureResponse(BaseModel):
    """Response model for chemical structure"""
    smiles: str
    name: str
    image_base64: str
    availability_info: Optional[Dict[str, Any]] = None
    properties: Optional[Dict[str, Any]] = None
    similar_compounds: Optional[List[Dict[str, Any]]] = None

class RefinedProposalResponse(BaseModel):
    """Response model for refined proposal"""
    new_proposal: str
    refinement_reason: str

class FinalDocumentsResponse(BaseModel):
    """Response model for final documents"""
    full_proposal_text: str
    recipe_file_base64: str
    data_template_base64: str
    proposal_docx_base64: str

class UploadResponse(BaseModel):
    """Response model for file uploads"""
    message: str
    files_uploaded: int
    total_size_mb: float

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None