# utils/config.py
from pydantic_settings import BaseSettings
from typing import Dict, Any
from google.generativeai.types import HarmCategory, HarmBlockThreshold

class Settings(BaseSettings):
    """Application settings and configuration"""
    
    # Directories
    KNOWLEDGE_BASE_DIR: str = "knowledge_base"
    STATIC_DIR: str = "static"
    
    # API Configuration
    DEFAULT_OPENAI_MODEL: str = "gpt-4"
    DEFAULT_GOOGLE_MODEL: str = "gemini-2.5-flash"
    DEFAULT_OLLAMA_MODEL: str = "llama3.1:latest"
    DEFAULT_OLLAMA_URL: str = "http://localhost:11434"
    
    # File Upload Limits
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_EXTENSIONS: set = {".pdf", ".docx", ".txt"}
    
    # AI Model Configuration
    MAX_RETRIES: int = 3
    REQUEST_TIMEOUT: int = 30
    OLLAMA_REQUEST_TIMEOUT: int = 120  # Ollama might need more time for local processing
    
    # Google AI Safety Settings
    GOOGLE_SAFETY_SETTINGS: Dict[HarmCategory, HarmBlockThreshold] = {
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
    }
    
    # Research Configuration
    DEFAULT_PAPER_LIMIT: int = 5
    SEMANTIC_SCHOLAR_BASE_URL: str = "https://api.semanticscholar.org/graph/v1"
    ARXIV_BASE_URL: str = "http://export.arxiv.org/api/query"
    
    class Config:
        env_file = ".env"

# Global settings instance
settings = Settings()