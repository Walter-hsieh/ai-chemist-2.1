# services/file_service.py
import os
import shutil
from pathlib import Path
from typing import List, Dict, Any
from fastapi import UploadFile, HTTPException
import pypdf
from docx import Document

from utils.config import settings

class FileService:
    """Service for handling file operations"""
    
    def __init__(self):
        self.knowledge_base_dir = Path(settings.KNOWLEDGE_BASE_DIR)
        self.knowledge_base_dir.mkdir(exist_ok=True)
    
    async def upload_files(self, files: List[UploadFile]) -> Dict[str, Any]:
        """Upload and save files to knowledge base"""
        uploaded_files = []
        total_size = 0
        
        for file in files:
            try:
                # Validate file extension
                file_ext = Path(file.filename).suffix.lower()
                if file_ext not in settings.ALLOWED_EXTENSIONS:
                    raise HTTPException(
                        status_code=400,
                        detail=f"File type {file_ext} not supported. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
                    )
                
                # Check file size
                file_size = 0
                content = await file.read()
                file_size = len(content)
                
                if file_size > settings.MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=400,
                        detail=f"File {file.filename} exceeds maximum size of {settings.MAX_FILE_SIZE / (1024*1024):.1f}MB"
                    )
                
                # Save file
                file_path = self.knowledge_base_dir / file.filename
                with open(file_path, "wb") as buffer:
                    buffer.write(content)
                
                uploaded_files.append(file.filename)
                total_size += file_size
                
            except Exception as e:
                if isinstance(e, HTTPException):
                    raise e
                raise HTTPException(
                    status_code=500,
                    detail=f"Error uploading {file.filename}: {str(e)}"
                )
            finally:
                await file.close()
        
        return {
            "files_uploaded": len(uploaded_files),
            "total_size_mb": total_size / (1024 * 1024),
            "uploaded_files": uploaded_files
        }
    
    def read_knowledge_base(self) -> str:
        """Read all documents from knowledge base and combine them"""
        combined_content = ""
        
        for file_path in self.knowledge_base_dir.iterdir():
            if file_path.is_file():
                try:
                    content = self._read_file_content(file_path)
                    if content:
                        combined_content += f"--- Document: {file_path.name} ---\n{content}\n\n"
                except Exception as e:
                    print(f"Error reading {file_path}: {e}")
                    continue
        
        return combined_content
    
    def _read_file_content(self, file_path: Path) -> str:
        """Read content from a single file based on its extension"""
        file_ext = file_path.suffix.lower()
        
        try:
            if file_ext == ".pdf":
                return self._read_pdf(file_path)
            elif file_ext == ".docx":
                return self._read_docx(file_path)
            elif file_ext == ".txt":
                return self._read_txt(file_path)
            else:
                return ""
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return ""
    
    def _read_pdf(self, file_path: Path) -> str:
        """Read text from PDF file"""
        try:
            reader = pypdf.PdfReader(str(file_path))
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error reading PDF {file_path}: {e}")
            return ""
    
    def _read_docx(self, file_path: Path) -> str:
        """Read text from DOCX file"""
        try:
            doc = Document(str(file_path))
            text = []
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text.append(paragraph.text.strip())
            return "\n".join(text)
        except Exception as e:
            print(f"Error reading DOCX {file_path}: {e}")
            return ""
    
    def _read_txt(self, file_path: Path) -> str:
        """Read text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read().strip()
        except Exception as e:
            print(f"Error reading TXT {file_path}: {e}")
            return ""
    
    def get_knowledge_base_stats(self) -> Dict[str, Any]:
        """Get statistics about the knowledge base"""
        files = list(self.knowledge_base_dir.iterdir())
        file_count = len([f for f in files if f.is_file()])
        
        total_size = sum(
            f.stat().st_size for f in files 
            if f.is_file()
        )
        
        file_types = {}
        for f in files:
            if f.is_file():
                ext = f.suffix.lower()
                file_types[ext] = file_types.get(ext, 0) + 1
        
        return {
            "total_files": file_count,
            "total_size_mb": total_size / (1024 * 1024),
            "file_types": file_types,
            "has_content": file_count > 0
        }
    
    def clear_knowledge_base(self) -> Dict[str, Any]:
        """Clear all files from knowledge base"""
        try:
            files_removed = 0
            for file_path in self.knowledge_base_dir.iterdir():
                if file_path.is_file():
                    file_path.unlink()
                    files_removed += 1
            
            return {
                "message": f"Cleared {files_removed} files from knowledge base",
                "files_removed": files_removed
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error clearing knowledge base: {str(e)}"
            )

# Global file service instance
file_service = FileService()