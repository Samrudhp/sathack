"""
Fusion layer for combining multimodal embeddings
"""
import torch
import torch.nn as nn
import numpy as np
import logging
from typing import Optional, Dict

from app.config import settings

logger = logging.getLogger(__name__)


class FusionLayer(nn.Module):
    """
    Neural fusion layer for combining multiple embeddings
    Uses MLPs to expand smaller embeddings + weighted sum + LayerNorm
    """
    
    def __init__(
        self,
        target_dim: int = 768,
        loc_dim: int = 128,
        user_dim: int = 256,
        time_dim: int = 64
    ):
        super().__init__()
        
        self.target_dim = target_dim
        
        # Expansion MLPs for smaller embeddings
        self.loc_mlp = nn.Sequential(
            nn.Linear(loc_dim, 256),
            nn.ReLU(),
            nn.Linear(256, target_dim)
        )
        
        self.user_mlp = nn.Sequential(
            nn.Linear(user_dim, 384),
            nn.ReLU(),
            nn.Linear(384, target_dim)
        )
        
        self.time_mlp = nn.Sequential(
            nn.Linear(time_dim, 128),
            nn.ReLU(),
            nn.Linear(128, target_dim)
        )
        
        # Layer normalization
        self.layer_norm = nn.LayerNorm(target_dim)
        
        # Learnable fusion weights (or use config)
        self.w_img = settings.FUSION_WEIGHT_IMAGE
        self.w_text = settings.FUSION_WEIGHT_TEXT
        self.w_loc = settings.FUSION_WEIGHT_LOCATION
        self.w_user = settings.FUSION_WEIGHT_USER
        self.w_time = settings.FUSION_WEIGHT_TIME
    
    def forward(
        self,
        v_img: Optional[torch.Tensor] = None,
        v_text: Optional[torch.Tensor] = None,
        v_loc: Optional[torch.Tensor] = None,
        v_user: Optional[torch.Tensor] = None,
        v_time: Optional[torch.Tensor] = None
    ) -> torch.Tensor:
        """
        Fuse embeddings with weighted combination
        
        Args:
            v_img: [batch, 768] - CLIP image embedding
            v_text: [batch, 768] - CLIP text embedding
            v_loc: [batch, 128] - Location features
            v_user: [batch, 256] - User history features
            v_time: [batch, 64] - Time features
        
        Returns:
            v_fused: [batch, 768] - Fused embedding
        """
        batch_size = (v_img.shape[0] if v_img is not None 
                     else v_text.shape[0] if v_text is not None
                     else 1)
        
        # Initialize with zeros
        v_fused = torch.zeros(batch_size, self.target_dim, device=self.get_device())
        
        # Add weighted components
        if v_img is not None:
            v_fused += self.w_img * v_img
        
        if v_text is not None:
            v_fused += self.w_text * v_text
        
        if v_loc is not None:
            v_loc_expanded = self.loc_mlp(v_loc)
            v_fused += self.w_loc * v_loc_expanded
        
        if v_user is not None:
            v_user_expanded = self.user_mlp(v_user)
            v_fused += self.w_user * v_user_expanded
        
        if v_time is not None:
            v_time_expanded = self.time_mlp(v_time)
            v_fused += self.w_time * v_time_expanded
        
        # Normalize
        v_fused = self.layer_norm(v_fused)
        
        return v_fused
    
    def get_device(self):
        """Get device of model parameters"""
        return next(self.parameters()).device


class FusionService:
    """Service for embedding fusion"""
    
    def __init__(self):
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
    
    async def initialize(self):
        """Initialize fusion model"""
        try:
            logger.info("Initializing fusion layer")
            
            self.model = FusionLayer()
            self.model.to(self.device)
            self.model.eval()
            
            logger.info(f"Fusion layer initialized on {self.device}")
            
        except Exception as e:
            logger.error(f"Failed to initialize fusion layer: {e}")
            raise
    
    async def fuse(
        self,
        v_img: Optional[np.ndarray] = None,
        v_text: Optional[np.ndarray] = None,
        v_loc: Optional[np.ndarray] = None,
        v_user: Optional[np.ndarray] = None,
        v_time: Optional[np.ndarray] = None
    ) -> np.ndarray:
        """
        Fuse embeddings from multiple modalities
        
        Args:
            v_img: [768] - CLIP image embedding
            v_text: [768] - CLIP text embedding
            v_loc: [128] - Location features
            v_user: [256] - User history features
            v_time: [64] - Time features
        
        Returns:
            v_fused: [768] - Fused embedding
        """
        try:
            if self.model is None:
                await self.initialize()
            
            # Convert numpy to torch tensors
            def to_tensor(arr):
                if arr is not None:
                    return torch.from_numpy(arr).float().unsqueeze(0).to(self.device)
                return None
            
            v_img_t = to_tensor(v_img)
            v_text_t = to_tensor(v_text)
            v_loc_t = to_tensor(v_loc)
            v_user_t = to_tensor(v_user)
            v_time_t = to_tensor(v_time)
            
            # Fuse
            with torch.no_grad():
                v_fused_t = self.model(
                    v_img=v_img_t,
                    v_text=v_text_t,
                    v_loc=v_loc_t,
                    v_user=v_user_t,
                    v_time=v_time_t
                )
            
            # Convert back to numpy
            v_fused = v_fused_t.cpu().numpy()[0]
            
            return v_fused
            
        except Exception as e:
            logger.error(f"Fusion failed: {e}")
            raise
    
    def create_location_features(
        self,
        osm_context: Dict,
        road_difficulty: float = 0.5
    ) -> np.ndarray:
        """
        Create location feature vector from OSM context
        
        Returns:
            [128] dimensional vector
        """
        features = np.zeros(128, dtype=np.float32)
        
        # Feature slots:
        # [0-10]: One-hot encoded region type
        # [11-20]: Road difficulty features
        # [21-40]: Nearby POI features
        # [41-128]: Reserved for other location metadata
        
        # Road difficulty
        features[11] = road_difficulty
        
        # Number of nearby recyclers (normalized)
        nearby_count = len(osm_context.get("nearby_recyclers", []))
        features[21] = min(nearby_count / 10.0, 1.0)
        
        # Hash ward/locality for embedding (simple hash)
        ward = osm_context.get("ward", "")
        if ward:
            ward_hash = hash(ward) % 50
            features[30 + ward_hash % 50] = 1.0
        
        return features
    
    def create_user_features(
        self,
        user_behavior: Optional[Dict],
        recent_scans_count: int = 0,
        avg_cleanliness: float = 0.0
    ) -> np.ndarray:
        """
        Create user history feature vector
        
        Returns:
            [256] dimensional vector
        """
        features = np.zeros(256, dtype=np.float32)
        
        # Feature slots:
        # [0-9]: Recent scan count (normalized)
        # [10-19]: Average cleanliness score
        # [20-49]: Common materials (one-hot)
        # [50-256]: Reserved
        
        # Recent activity
        features[0] = min(recent_scans_count / 100.0, 1.0)
        
        # Cleanliness
        features[10] = avg_cleanliness / 100.0
        
        # Common materials from user behavior
        if user_behavior:
            common_materials = user_behavior.get("common_materials", [])
            material_map = {
                "PET": 20, "HDPE": 21, "Paper": 22, "Glass": 23,
                "Metal": 24, "E-Waste": 25, "Cardboard": 26
            }
            for material in common_materials[:5]:
                if material in material_map:
                    features[material_map[material]] = 1.0
        
        return features
    
    def create_time_features(
        self,
        hour: int,
        day_of_week: int,
        is_weekend: bool = False
    ) -> np.ndarray:
        """
        Create time context feature vector
        
        Args:
            hour: Hour of day (0-23)
            day_of_week: Day (0=Monday, 6=Sunday)
            is_weekend: Weekend flag
        
        Returns:
            [64] dimensional vector
        """
        features = np.zeros(64, dtype=np.float32)
        
        # Feature slots:
        # [0-23]: One-hot hour of day
        # [24-30]: One-hot day of week
        # [31]: Weekend flag
        # [32-63]: Reserved
        
        # Hour of day
        if 0 <= hour < 24:
            features[hour] = 1.0
        
        # Day of week
        if 0 <= day_of_week < 7:
            features[24 + day_of_week] = 1.0
        
        # Weekend
        features[31] = 1.0 if is_weekend else 0.0
        
        return features


# Global fusion service instance
fusion_service = FusionService()
