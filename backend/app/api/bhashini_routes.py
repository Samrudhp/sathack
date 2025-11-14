"""
Bhashini Translation API endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging

from app.services.bhashini_service import bhashini_service

logger = logging.getLogger(__name__)
router = APIRouter()


class TranslateRequest(BaseModel):
    text: str
    source_language: str = "en"
    target_language: str = "hi"


@router.post("/translate")
async def translate_text(request: TranslateRequest):
    """
    Translate text using Bhashini API
    
    Supported languages:
    - en: English
    - hi: Hindi
    - pa: Punjabi
    - bn: Bengali
    - ta: Tamil
    - te: Telugu
    - mr: Marathi
    - gu: Gujarati
    - kn: Kannada
    - ml: Malayalam
    - or: Odia
    - as: Assamese
    """
    try:
        translated = await bhashini_service.translate_with_fallback(
            text=request.text,
            source_language=request.source_language,
            target_language=request.target_language
        )
        
        return {
            "original": request.text,
            "translated": translated,
            "source_language": request.source_language,
            "target_language": request.target_language
        }
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/supported-languages")
async def get_supported_languages():
    """Get list of supported languages"""
    return {
        "languages": bhashini_service.get_supported_languages()
    }
