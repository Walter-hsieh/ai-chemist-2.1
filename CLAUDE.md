# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI Chemistry Research Assistant - a FastAPI-based web application that helps chemists generate comprehensive research proposals with AI assistance. The system analyzes scientific literature, creates novel research proposals, designs molecular structures using RDKit, and produces publication-ready documents.

## Key Commands

### Starting the Application
```bash
python main.py
# or
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Setup
```bash
python setup.py  # Creates directory structure and __init__.py files
pip install -r requirements.txt
```

### RDKit Installation (Chemistry Library)
RDKit is critical but can be challenging to install:
```bash
# Recommended for Windows:
conda install -c conda-forge rdkit

# Alternative:
pip install rdkit
```

### Development Dependencies (Optional)
```bash
# Code quality tools
pip install black flake8 isort pytest pytest-asyncio httpx
```

## Architecture Overview

### Core Application Structure
- **FastAPI Backend**: RESTful API with async support
- **Static Frontend**: HTML/CSS/JavaScript served from `/static`
- **Modular Design**: Separated into routers, services, models, and utilities

### Key Components

#### AI Integration Layer (`services/ai_service.py`)
- Unified interface for OpenAI GPT and Google Gemini models
- Handles API key management and provider switching
- Error handling and timeout configuration

#### Research Pipeline (`services/research_service.py`)
- Literature analysis from Semantic Scholar, arXiv, or local documents
- Document processing (PDF, DOCX, TXT)
- AI-powered research proposal generation

#### Chemistry Module (`services/structure_service.py`) 
**Critical Dependency**: Requires RDKit
- SMILES notation generation and validation
- 2D molecular structure visualization
- Chemical property calculation (MW, LogP, Rule of Five)

#### Document Generation (`services/document_service.py`)
- Word document creation (research proposals)
- Excel spreadsheet generation (synthesis recipes, data templates)
- Base64 encoding for file downloads

### Data Flow
1. User uploads documents or specifies external data source
2. Research service analyzes literature and generates AI proposal
3. Structure service creates molecular structures from proposal
4. Document service generates downloadable files (DOCX, XLSX)

### Configuration (`utils/config.py`)
- Pydantic settings with environment variable support
- AI model defaults: `gpt-4` (OpenAI), `gemini-2.5-flash` (Google)
- File upload limits (50MB max)
- Google AI safety settings configured to BLOCK_NONE

### API Endpoints Structure
- `/api/upload` - File upload handling
- `/api/research` - Literature analysis and proposal generation  
- `/api/structure` - Chemical structure operations
- `/api/documents` - Final document generation

### Frontend Architecture (`static/js/`)
- Component-based JavaScript modules
- Service layer for API communication
- Utility functions and configuration management

## Important Implementation Notes

### AI Provider Configuration
The application supports dual AI providers with fallback capability. API keys are passed per-request, not stored server-side.

### Chemistry Processing Dependencies  
RDKit is essential for molecular structure operations. The application will fail gracefully if RDKit is unavailable, but structure generation features will be non-functional.

### File Processing Pipeline
Local knowledge base supports PDF, DOCX, and TXT files up to 50MB. Files are processed through document parsers before AI analysis.

### Error Handling Strategy
- HTTP exceptions with detailed error messages
- Graceful degradation when optional dependencies are missing
- Timeout handling for external API calls (30s default)

## Development Workflow

1. Ensure RDKit is properly installed before running tests
2. Use the setup script for initial project structure
3. Test with both AI providers (OpenAI and Google) when possible
4. Verify file upload functionality with supported formats
5. Check chemical structure generation with valid SMILES strings