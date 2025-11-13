"""
Voice processing service using OpenAI Whisper
"""
import whisper
import numpy as np
import io
import logging
from pydub import AudioSegment
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)


class VoiceService:
    """Whisper-based speech recognition service"""
    
    def __init__(self):
        self.model = None
        self.model_name = settings.WHISPER_MODEL
    
    async def initialize(self):
        """Load Whisper model"""
        try:
            logger.info(f"Loading Whisper model: {self.model_name}")
            
            self.model = whisper.load_model(self.model_name)
            
            logger.info(f"Whisper model loaded: {self.model_name}")
            
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            raise
    
    async def transcribe_audio(
        self, 
        audio_bytes: bytes,
        language: Optional[str] = None
    ) -> dict:
        """
        Transcribe audio to text
        
        Args:
            audio_bytes: Audio file bytes
            language: Optional language code (en/hi)
        
        Returns:
            {
                "text": str,
                "language": str,
                "confidence": float
            }
        """
        try:
            if self.model is None:
                await self.initialize()
            
            # Convert audio to format Whisper expects
            audio = AudioSegment.from_file(io.BytesIO(audio_bytes))
            
            # Convert to mono and 16kHz if needed
            audio = audio.set_channels(1).set_frame_rate(16000)
            
            # Export to WAV
            wav_io = io.BytesIO()
            audio.export(wav_io, format="wav")
            wav_io.seek(0)
            
            # Save temporarily (Whisper needs file path)
            import tempfile
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_file.write(wav_io.read())
                temp_path = temp_file.name
            
            # Transcribe
            result = self.model.transcribe(
                temp_path,
                language=language,
                fp16=False
            )
            
            # Clean up temp file
            import os
            os.unlink(temp_path)
            
            return {
                "text": result["text"].strip(),
                "language": result.get("language", language or "en"),
                "confidence": self._compute_confidence(result)
            }
            
        except Exception as e:
            logger.error(f"Failed to transcribe audio: {e}")
            raise
    
    def _compute_confidence(self, whisper_result: dict) -> float:
        """Compute average confidence from Whisper segments"""
        try:
            if "segments" in whisper_result:
                segments = whisper_result["segments"]
                if segments:
                    # Average log probability
                    avg_logprob = sum(s.get("avg_logprob", -1.0) for s in segments) / len(segments)
                    # Convert to confidence (0-1)
                    confidence = np.exp(avg_logprob)
                    return float(confidence)
            
            return 0.8  # Default confidence
            
        except Exception:
            return 0.8


# Global voice service instance
voice_service = VoiceService()
