"""
Bhashini Translation Service
Integrates with Government of India's Bhashini API for Indian language translation
"""
import logging
import httpx
import json
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)


class BhashiniService:
    """Service for translating text using Bhashini API"""
    
    def __init__(self):
        self.api_key = settings.BHASHINI_API_KEY
        self.user_id = settings.BHASHINI_USER_ID
        self.pipeline_endpoint = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
        
        # Language codes mapping
        self.language_codes = {
            "hi": "hi",  # Hindi
            "en": "en",  # English
            "pa": "pa",  # Punjabi
            "bn": "bn",  # Bengali
            "ta": "ta",  # Tamil
            "te": "te",  # Telugu
            "mr": "mr",  # Marathi
            "gu": "gu",  # Gujarati
            "kn": "kn",  # Kannada
            "ml": "ml",  # Malayalam
            "or": "or",  # Odia
            "as": "as",  # Assamese
        }
    
    async def translate(
        self,
        text: str,
        source_language: str = "en",
        target_language: str = "hi"
    ) -> Optional[str]:
        """
        Translate text from source to target language using Bhashini
        
        Args:
            text: Text to translate
            source_language: Source language code (en, hi, etc.)
            target_language: Target language code (en, hi, etc.)
        
        Returns:
            Translated text or None if translation fails
        """
        try:
            # Validate language codes
            if source_language not in self.language_codes:
                logger.warning(f"Unsupported source language: {source_language}, defaulting to 'en'")
                source_language = "en"
            
            if target_language not in self.language_codes:
                logger.warning(f"Unsupported target language: {target_language}, defaulting to 'hi'")
                target_language = "hi"
            
            # Skip translation if source and target are same
            if source_language == target_language:
                return text
            
            logger.info(f"Translating from {source_language} to {target_language} via Bhashini")
            
            # Prepare request payload
            payload = {
                "pipelineTasks": [
                    {
                        "taskType": "translation",
                        "config": {
                            "language": {
                                "sourceLanguage": source_language,
                                "targetLanguage": target_language
                            }
                        }
                    }
                ],
                "inputData": {
                    "input": [
                        {
                            "source": text
                        }
                    ]
                }
            }
            
            headers = {
                "Authorization": self.api_key,
                "Content-Type": "application/json",
                "userID": self.user_id
            }
            
            # Make API request
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.pipeline_endpoint,
                    json=payload,
                    headers=headers
                )
                
                if response.status_code == 200:
                    try:
                        result = response.json()
                        
                        # Extract translated text from response
                        if "pipelineResponse" in result:
                            translated = result["pipelineResponse"][0]["output"][0]["target"]
                            logger.info(f"Translation successful: {len(text)} chars -> {len(translated)} chars")
                            return translated
                        else:
                            logger.error(f"Unexpected Bhashini response format: {result}")
                            return None
                    except json.JSONDecodeError as json_err:
                        logger.error(f"Bhashini returned invalid JSON: {json_err}")
                        logger.error(f"Response text: {response.text[:200]}")
                        return None
                else:
                    logger.error(f"Bhashini API error: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Bhashini translation failed: {e}")
            return None
    
    async def translate_with_fallback(
        self,
        text: str,
        source_language: str = "en",
        target_language: str = "hi"
    ) -> str:
        """
        Translate text with fallback to original text if translation fails
        
        Args:
            text: Text to translate
            source_language: Source language code
            target_language: Target language code
        
        Returns:
            Translated text or original text if translation fails
        """
        translated = await self.translate(text, source_language, target_language)
        
        if translated:
            return translated
        else:
            logger.warning("Translation failed, returning original text")
            return text
    
    def get_supported_languages(self) -> dict:
        """Get list of supported language codes and names"""
        return {
            "en": "English",
            "hi": "Hindi",
            "pa": "Punjabi",
            "bn": "Bengali",
            "ta": "Tamil",
            "te": "Telugu",
            "mr": "Marathi",
            "gu": "Gujarati",
            "kn": "Kannada",
            "ml": "Malayalam",
            "or": "Odia",
            "as": "Assamese"
        }


# Singleton instance
bhashini_service = BhashiniService()
