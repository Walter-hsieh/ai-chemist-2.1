# main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

from routers import upload, research, structure, documents
from utils.config import settings

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="AI Chemistry Research Assistant",
    description="Generate research proposals with AI assistance",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(research.router, prefix="/api", tags=["research"])
app.include_router(structure.router, prefix="/api", tags=["structure"])
app.include_router(documents.router, prefix="/api", tags=["documents"])

# Create knowledge base directory
os.makedirs(settings.KNOWLEDGE_BASE_DIR, exist_ok=True)

@app.get("/")
async def read_root():
    """Serve the main application page"""
    return FileResponse('static/index.html')

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "2.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)