"""
Impact calculation service
"""
import logging
from typing import Dict
from app.config import settings

logger = logging.getLogger(__name__)


class ImpactService:
    """Service for calculating environmental impact"""
    
    def calculate_credits(
        self,
        material: str,
        weight_kg: float,
        cleanliness_score: float
    ) -> int:
        """
        Calculate credits/tokens for recycling
        
        Formula: base_rate(material) * weight_kg * (cleanliness_score / 100)
        
        Returns:
            Integer credits
        """
        try:
            # Get base rate
            base_rate = settings.MATERIAL_RATES.get(material, 5.0)
            
            # Calculate credits
            credits = base_rate * weight_kg * (cleanliness_score / 100.0)
            
            # Round to integer
            return int(round(credits))
            
        except Exception as e:
            logger.error(f"Failed to calculate credits: {e}")
            return 0
    
    def calculate_co2_saved(self, material: str, weight_kg: float) -> float:
        """
        Calculate CO₂ saved by recycling (in kg)
        
        Formula: impact_factor(material) * weight_kg
        """
        try:
            factor = settings.IMPACT_CO2.get(material, 1.5)
            return round(factor * weight_kg, 2)
        except Exception as e:
            logger.error(f"Failed to calculate CO₂: {e}")
            return 0.0
    
    def calculate_water_saved(self, material: str, weight_kg: float) -> float:
        """
        Calculate water saved by recycling (in liters)
        
        Formula: impact_factor(material) * weight_kg
        """
        try:
            factor = settings.IMPACT_WATER.get(material, 10.0)
            return round(factor * weight_kg, 2)
        except Exception as e:
            logger.error(f"Failed to calculate water: {e}")
            return 0.0
    
    def calculate_landfill_saved(self, material: str, weight_kg: float) -> float:
        """
        Calculate landfill space saved (in kg)
        
        Formula: weight_kg (1:1 for now)
        """
        try:
            factor = settings.IMPACT_LANDFILL.get(material, 1.0)
            return round(factor * weight_kg, 2)
        except Exception as e:
            logger.error(f"Failed to calculate landfill: {e}")
            return 0.0
    
    def calculate_all_impacts(
        self,
        material: str,
        weight_kg: float,
        cleanliness_score: float
    ) -> Dict:
        """
        Calculate all impacts at once
        
        Returns:
            {
                "credits": int,
                "co2_saved_kg": float,
                "water_saved_liters": float,
                "landfill_saved_kg": float
            }
        """
        return {
            "credits": self.calculate_credits(material, weight_kg, cleanliness_score),
            "co2_saved_kg": self.calculate_co2_saved(material, weight_kg),
            "water_saved_liters": self.calculate_water_saved(material, weight_kg),
            "landfill_saved_kg": self.calculate_landfill_saved(material, weight_kg)
        }


# Global impact service instance
impact_service = ImpactService()
