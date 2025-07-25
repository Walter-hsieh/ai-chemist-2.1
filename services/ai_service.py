# services/ai_service.py
import openai
import google.generativeai as genai
from typing import Dict, Any
from fastapi import HTTPException

from models.schemas import AIProvider, BaseAIRequest
from utils.config import settings

class AIService:
    """Service for handling AI provider interactions"""
    
    def __init__(self):
        self.providers = {
            AIProvider.OPENAI: self._call_openai,
            AIProvider.GOOGLE: self._call_google
        }
    
    async def generate_response(self, request: BaseAIRequest, prompt: str) -> str:
        """Generate AI response using the specified provider"""
        try:
            provider_func = self.providers.get(request.api_provider)
            if not provider_func:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Unsupported AI provider: {request.api_provider}"
                )
            
            return await provider_func(request, prompt)
            
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=500,
                detail=f"AI service error: {str(e)}"
            )
    
    async def _call_openai(self, request: BaseAIRequest, prompt: str) -> str:
        """Call OpenAI API"""
        try:
            openai.api_key = request.api_key
            model = request.model_name or settings.DEFAULT_OPENAI_MODEL
            
            completion = openai.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                timeout=settings.REQUEST_TIMEOUT
            )
            
            return completion.choices[0].message.content
            
        except openai.AuthenticationError:
            raise HTTPException(status_code=401, detail="Invalid OpenAI API key")
        except openai.RateLimitError:
            raise HTTPException(status_code=429, detail="OpenAI rate limit exceeded")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OpenAI error: {str(e)}")
    
    async def _call_google(self, request: BaseAIRequest, prompt: str) -> str:
        """Call Google Gemini API"""
        try:
            genai.configure(api_key=request.api_key)
            model_name = request.model_name or settings.DEFAULT_GOOGLE_MODEL
            model = genai.GenerativeModel(model_name)
            
            response = model.generate_content(
                prompt,
                safety_settings=settings.GOOGLE_SAFETY_SETTINGS
            )
            
            return response.text
            
        except Exception as e:
            if "API_KEY_INVALID" in str(e):
                raise HTTPException(status_code=401, detail="Invalid Google API key")
            elif "QUOTA_EXCEEDED" in str(e):
                raise HTTPException(status_code=429, detail="Google API quota exceeded")
            else:
                raise HTTPException(status_code=500, detail=f"Google AI error: {str(e)}")

# Global AI service instance
ai_service = AIService()