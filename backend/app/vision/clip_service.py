"""
CLIP Vision Service for waste material classification
"""
import torch
import numpy as np
from PIL import Image
import io
import logging
from typing import List, Dict, Tuple
from transformers import CLIPProcessor, CLIPModel

from app.config import settings

logger = logging.getLogger(__name__)


class VisionService:
    """CLIP-based vision classification service"""
    
    def __init__(self):
        self.model = None
        self.processor = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Material categories for zero-shot classification
        self.material_labels = [
            "plastic PET bottle",
            "plastic HDPE container",
            "paper document",
            "cardboard box",
            "glass bottle",
            "metal can",
            "aluminum can",
            "steel container",
            "electronic waste",
            "battery",
            "general plastic waste",
            "mixed waste",
            "organic waste",
            "textile fabric",
        ]
        
        # Hazard categories
        self.hazard_labels = [
            "battery",
            "broken glass",
            "chemical container",
            "syringe",
            "sharp object",
            "biohazard",
            "no hazard",
        ]
        
        # Cleanliness descriptors
        self.cleanliness_labels = [
            "very clean recyclable material",
            "clean recyclable material",
            "slightly dirty recyclable material",
            "moderately dirty recyclable material",
            "very dirty contaminated material",
        ]
    
    async def initialize(self):
        """Load CLIP model"""
        try:
            logger.info(f"Loading CLIP model: {settings.CLIP_MODEL}")
            
            self.model = CLIPModel.from_pretrained(settings.CLIP_MODEL)
            self.processor = CLIPProcessor.from_pretrained(settings.CLIP_MODEL)
            
            self.model.to(self.device)
            self.model.eval()
            
            logger.info(f"CLIP model loaded on {self.device}")
            
        except Exception as e:
            logger.error(f"Failed to load CLIP model: {e}")
            raise
    
    async def encode_image(self, image_bytes: bytes) -> np.ndarray:
        """Encode image to embedding vector"""
        try:
            if self.model is None:
                await self.initialize()
            
            # Load image
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            
            # Process image
            inputs = self.processor(images=image, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Get image embedding
            with torch.no_grad():
                image_features = self.model.get_image_features(**inputs)
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            
            # Convert to numpy
            embedding = image_features.cpu().numpy()[0]
            
            return embedding
            
        except Exception as e:
            logger.error(f"Failed to encode image: {e}")
            raise
    
    async def encode_text(self, text: str) -> np.ndarray:
        """Encode text to embedding vector"""
        try:
            if self.model is None:
                await self.initialize()
            
            # Process text
            inputs = self.processor(text=[text], return_tensors="pt", padding=True)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Get text embedding
            with torch.no_grad():
                text_features = self.model.get_text_features(**inputs)
                text_features = text_features / text_features.norm(dim=-1, keepdim=True)
            
            # Convert to numpy
            embedding = text_features.cpu().numpy()[0]
            
            return embedding
            
        except Exception as e:
            logger.error(f"Failed to encode text: {e}")
            raise
    
    async def zero_shot_classification(
        self, 
        image_bytes: bytes
    ) -> Dict:
        """
        Perform zero-shot classification for material, hazard, and cleanliness
        """
        try:
            if self.model is None:
                await self.initialize()
            
            # Load image
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            
            # 1. Material Classification
            material_result = await self._classify(image, self.material_labels)
            
            # 2. Hazard Detection
            hazard_result = await self._classify(image, self.hazard_labels)
            
            # 3. Cleanliness Assessment
            cleanliness_result = await self._classify(image, self.cleanliness_labels)
            
            # Process results
            material = material_result["label"]
            material_confidence = material_result["confidence"]
            
            # Map to standard material names
            material_mapped = self._map_material(material)
            
            # Hazard class (if not "no hazard")
            hazard_class = None
            if hazard_result["label"] != "no hazard" and hazard_result["confidence"] > 0.4:
                hazard_class = hazard_result["label"]
            
            # Cleanliness score (0-100)
            cleanliness_score = self._compute_cleanliness_score(cleanliness_result)
            
            return {
                "material": material_mapped,
                "confidence": material_confidence,
                "all_predictions": material_result["all_scores"],
                "cleanliness_score": cleanliness_score,
                "hazard_class": hazard_class,
            }
            
        except Exception as e:
            logger.error(f"Failed to classify image: {e}")
            raise
    
    async def _classify(
        self, 
        image: Image.Image, 
        labels: List[str]
    ) -> Dict:
        """Internal classification method"""
        try:
            # Process inputs
            inputs = self.processor(
                text=labels,
                images=image,
                return_tensors="pt",
                padding=True
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Get predictions
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits_per_image = outputs.logits_per_image
                probs = logits_per_image.softmax(dim=1)
            
            # Get results
            probs_np = probs.cpu().numpy()[0]
            top_idx = probs_np.argmax()
            
            # All scores
            all_scores = [
                {"label": labels[i], "score": float(probs_np[i])}
                for i in range(len(labels))
            ]
            all_scores.sort(key=lambda x: x["score"], reverse=True)
            
            return {
                "label": labels[top_idx],
                "confidence": float(probs_np[top_idx]),
                "all_scores": all_scores
            }
            
        except Exception as e:
            logger.error(f"Classification failed: {e}")
            raise
    
    def _map_material(self, predicted_label: str) -> str:
        """Map CLIP label to standard material name"""
        label_lower = predicted_label.lower()
        
        if "pet" in label_lower:
            return "PET"
        elif "hdpe" in label_lower:
            return "HDPE"
        elif "paper" in label_lower:
            return "Paper"
        elif "cardboard" in label_lower:
            return "Cardboard"
        elif "glass" in label_lower:
            return "Glass"
        elif "aluminum" in label_lower:
            return "Aluminum"
        elif "steel" in label_lower or "metal can" in label_lower:
            return "Steel"
        elif "electronic" in label_lower or "e-waste" in label_lower:
            return "E-Waste"
        elif "battery" in label_lower:
            return "E-Waste"
        elif "plastic" in label_lower:
            return "Plastic"
        else:
            return "Plastic"  # Default
    
    def _compute_cleanliness_score(self, cleanliness_result: Dict) -> float:
        """Compute cleanliness score from 0-100"""
        label = cleanliness_result["label"]
        confidence = cleanliness_result["confidence"]
        
        # Map labels to scores
        score_map = {
            "very clean recyclable material": 95,
            "clean recyclable material": 80,
            "slightly dirty recyclable material": 60,
            "moderately dirty recyclable material": 40,
            "very dirty contaminated material": 20,
        }
        
        base_score = score_map.get(label, 50)
        
        # Adjust by confidence
        final_score = base_score * confidence + 50 * (1 - confidence)
        
        return round(final_score, 1)


# Global vision service instance
vision_service = VisionService()
