# services/research_service.py
import os
import requests
import xml.etree.ElementTree as ET
from typing import List, Dict, Any
from fastapi import HTTPException

from models.schemas import Paper, DataSource
from utils.config import settings
from services.file_service import file_service

class ResearchService:
    """Service for fetching and processing research papers"""
    
    def __init__(self):
        self.data_sources = {
            DataSource.LOCAL: self._get_local_papers,
            DataSource.SEMANTIC_SCHOLAR: self._get_semantic_scholar_papers,
            DataSource.ARXIV: self._get_arxiv_papers
        }
    
    async def get_papers(self, topic: str, source: DataSource, limit: int = 5) -> List[Paper]:
        """Get papers from the specified source"""
        try:
            source_func = self.data_sources.get(source)
            if not source_func:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported data source: {source}"
                )
            
            papers = await source_func(topic, limit)
            return papers
            
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=500,
                detail=f"Error fetching papers: {str(e)}"
            )
    
    async def _get_local_papers(self, topic: str, limit: int) -> List[Paper]:
        """Get papers from local knowledge base"""
        try:
            content = file_service.read_knowledge_base()
            
            if not content.strip():
                return []
            
            # For local content, we treat it as one large "paper"
            return [Paper(
                title="Local Knowledge Base",
                abstract=content,
                source="local"
            )]
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error reading local knowledge base: {str(e)}"
            )
    
    async def _get_semantic_scholar_papers(self, topic: str, limit: int) -> List[Paper]:
        """Get papers from Semantic Scholar API"""
        try:
            headers = {}
            api_key = os.environ.get("SEMANTIC_SCHOLAR_API_KEY")
            if api_key:
                headers['x-api-key'] = api_key
            
            url = f"{settings.SEMANTIC_SCHOLAR_BASE_URL}/paper/search"
            params = {
                'query': topic,
                'limit': limit,
                'fields': 'title,abstract,year,authors'
            }
            
            response = requests.get(
                url, 
                params=params, 
                headers=headers, 
                timeout=settings.REQUEST_TIMEOUT
            )
            response.raise_for_status()
            
            data = response.json()
            papers = []
            
            for paper_data in data.get('data', []):
                if paper_data and paper_data.get('abstract'):
                    papers.append(Paper(
                        title=paper_data.get('title', 'Unknown Title'),
                        abstract=paper_data.get('abstract', ''),
                        source="semantic_scholar"
                    ))
            
            return papers
            
        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=503,
                detail=f"Semantic Scholar API error: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing Semantic Scholar response: {str(e)}"
            )
    
    async def _get_arxiv_papers(self, topic: str, limit: int) -> List[Paper]:
        """Get papers from arXiv API"""
        try:
            params = {
                'search_query': f'all:{topic}',
                'start': 0,
                'max_results': limit
            }
            
            response = requests.get(
                settings.ARXIV_BASE_URL,
                params=params,
                timeout=settings.REQUEST_TIMEOUT
            )
            response.raise_for_status()
            
            # Parse XML response
            root = ET.fromstring(response.content)
            namespace = '{http://www.w3.org/2005/Atom}'
            
            papers = []
            for entry in root.findall(f'{namespace}entry'):
                title_elem = entry.find(f'{namespace}title')
                summary_elem = entry.find(f'{namespace}summary')
                
                if title_elem is not None and summary_elem is not None:
                    title = title_elem.text.strip() if title_elem.text else 'Unknown Title'
                    abstract = summary_elem.text.strip() if summary_elem.text else ''
                    
                    if abstract:  # Only include papers with abstracts
                        papers.append(Paper(
                            title=title,
                            abstract=abstract,
                            source="arxiv"
                        ))
            
            return papers
            
        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=503,
                detail=f"arXiv API error: {str(e)}"
            )
        except ET.ParseError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error parsing arXiv response: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing arXiv response: {str(e)}"
            )
    
    def format_papers_for_ai(self, papers: List[Paper]) -> str:
        """Format papers for AI processing"""
        if not papers:
            return ""
        
        formatted_text = []
        for i, paper in enumerate(papers, 1):
            paper_text = f"Paper {i}:\nTitle: {paper.title}\nAbstract: {paper.abstract}"
            if paper.source:
                paper_text += f"\nSource: {paper.source}"
            formatted_text.append(paper_text)
        
        return "\n\n---\n\n".join(formatted_text)

# Global research service instance
research_service = ResearchService()