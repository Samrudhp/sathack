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
            # Plastics
            "plastic PET bottle",
            "plastic HDPE container",
            "general plastic waste",
            "plastic bag",
            "plastic wrapper",
            
            # Paper & Cardboard
            "paper document",
            "cardboard box",
            "newspaper",
            
            # Glass & Metals
            "glass bottle",
            "aluminum can",
            "metal can",
            "steel container",
            "metal scrap",
            
            # Electronics & Batteries
            "headphones or earbuds",
            "mobile phone or smartphone",
            "laptop or computer",
            "charger or power adapter",
            "electrical cable or wire",
            "electronic circuit board",
            "battery",
            "electronic waste",
            
            # Organic/Bio Waste (Enhanced)
            "fruit peel and food scraps",
            "vegetable waste and peels",
            "apple peel or banana peel",
            "orange peel or citrus waste",
            "rotten fruit or spoiled food",
            "kitchen food waste",
            "garden leaves and plant waste",
            "organic compostable waste",
            "cooked food leftovers",
            "raw vegetable scraps",
            
            # Other
            "textile fabric",
            "mixed waste",
        ]
        
        # Hazard categories - be specific to avoid false positives on organic waste
        self.hazard_labels = [
            "lithium battery or power cell",
            "broken glass with sharp edges",
            "chemical container or toxic bottle",
            "medical syringe or needle",
            "metal knife or blade",
            "medical biohazard waste",
            "safe recyclable material with no hazard",
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
            
            # Process text with truncation to respect CLIP's 77 token limit
            inputs = self.processor(
                text=[text], 
                return_tensors="pt", 
                padding=True,
                truncation=True,
                max_length=77
            )
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
            
            # Get top 3 predictions for richer context
            top_predictions = material_result["all_scores"][:3]
            
            # Map to standard material names
            material_mapped = self._map_material(material)
            
            # Create detailed description based on what CLIP sees
            detailed_description = self._create_detailed_description(
                top_predictions,
                hazard_result,
                cleanliness_result
            )
            
            # Hazard class (if not "no hazard" or "safe")
            hazard_class = None
            hazard_label = hazard_result["label"].lower()
            if ("safe" not in hazard_label and "no hazard" not in hazard_label 
                and hazard_result["confidence"] > 0.5):  # Higher threshold to reduce false positives
                hazard_class = hazard_result["label"]
            
            # Cleanliness score (0-100)
            cleanliness_score = self._compute_cleanliness_score(cleanliness_result)
            
            return {
                "material": material_mapped,
                "confidence": material_confidence,
                "detailed_description": detailed_description,  # NEW: Rich context for RAG
                "raw_detection": material,  # What CLIP actually detected
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
    
    def _create_detailed_description(
        self,
        top_predictions: List[Dict],
        hazard_result: Dict,
        cleanliness_result: Dict
    ) -> str:
        """
        Create a detailed, human-readable description of what CLIP detected.
        This provides rich context for the RAG system instead of just keywords.
        """
        parts = []
        
        # Main detection with confidence
        primary = top_predictions[0]
        parts.append(f"I detect {primary['label']}")
        
        # Add confidence qualifier
        if primary['score'] > 0.7:
            parts.append("with high confidence")
        elif primary['score'] > 0.5:
            parts.append("with moderate confidence")
        else:
            parts.append("but I'm not entirely certain")
        
        # Alternative interpretations if they're close
        if len(top_predictions) > 1:
            second = top_predictions[1]
            if second['score'] > 0.3:  # If second prediction is significant
                parts.append(f", though it could also be {second['label']}")
                
                if len(top_predictions) > 2:
                    third = top_predictions[2]
                    if third['score'] > 0.2:
                        parts.append(f" or {third['label']}")
        
        description = "".join(parts) + "."
        
        # Add cleanliness context
        clean_label = cleanliness_result['label']
        if "dirty" in clean_label or "contaminated" in clean_label:
            description += f" The item appears {clean_label.replace('recyclable material', '').strip()}."
        elif "clean" in clean_label:
            description += f" The item appears {clean_label.replace('recyclable material', '').strip()}."
        
        # Add hazard warning if detected (with higher threshold)
        hazard_label = hazard_result['label'].lower()
        if ("safe" not in hazard_label and "no hazard" not in hazard_label 
            and hazard_result['confidence'] > 0.5):  # Higher threshold
            description += f" ⚠️ Warning: This may be {hazard_result['label']}."
        
        return description
    
    def _map_material(self, predicted_label: str) -> str:
        """Map CLIP label to standard material name"""
        label_lower = predicted_label.lower()
        
        # Organic/Bio Waste (check first since it's commonly misclassified)
        if any(keyword in label_lower for keyword in [
            "fruit", "vegetable", "peel", "food", "kitchen", 
            "organic", "compost", "garden", "leaves", "plant",
            "apple", "banana", "orange", "citrus", "rotten", "spoiled",
            "cooked", "leftovers", "scraps"
        ]):
            return "Organic/Bio Waste"
        
        # Plastics
        elif "pet" in label_lower:
            return "PET"
        elif "hdpe" in label_lower:
            return "HDPE"
        elif "plastic" in label_lower:
            return "Plastic"
        
        # Paper & Cardboard
        elif "paper" in label_lower or "newspaper" in label_lower:
            return "Paper"
        elif "cardboard" in label_lower:
            return "Cardboard"
        
        # Glass & Metals
        elif "glass" in label_lower:
            return "Glass"
        elif "aluminum" in label_lower:
            return "Aluminum"
        elif "steel" in label_lower or "metal" in label_lower:
            return "Steel"
        
        # Electronics & Batteries
        elif any(keyword in label_lower for keyword in [
            "electronic", "e-waste", "electrical", "headphone", "earbuds",
            "phone", "smartphone", "laptop", "computer", "charger", 
            "adapter", "cable", "wire", "circuit"
        ]):
            return "E-Waste"
        elif "battery" in label_lower:
            return "E-Waste"
        
        # Textiles
        elif "textile" in label_lower or "fabric" in label_lower:
            return "Textile"
        
        # Default to mixed waste (not plastic)
        else:
            return "Mixed Waste"
    
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
