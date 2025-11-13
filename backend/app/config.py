"""
Configuration management for ReNova backend
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "renova"
    
    # Milvus
    MILVUS_HOST: str = "localhost"
    MILVUS_PORT: int = 19530
    
    # Groq API (Free LLM)
    GROQ_API_KEY: str
    
    # App Config
    APP_NAME: str = "ReNova"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    SECRET_KEY: str
    
    # Vector DB Choice
    VECTOR_DB: str = "faiss"  # milvus or faiss
    
    # Model Paths
    CLIP_MODEL: str = "openai/clip-vit-base-patch32"
    WHISPER_MODEL: str = "small"  # Using local small model for translation
    
    # OSM APIs
    NOMINATIM_URL: str = "https://nominatim.openstreetmap.org"
    OVERPASS_URL: str = "https://overpass-api.de/api/interpreter"
    OSRM_URL: str = "http://router.project-osrm.org"
    
    # Token Settings
    TOKEN_EXPIRY_HOURS: int = 24
    
    # Fusion Weights
    FUSION_WEIGHT_IMAGE: float = 0.3
    FUSION_WEIGHT_TEXT: float = 0.25
    FUSION_WEIGHT_LOCATION: float = 0.15
    FUSION_WEIGHT_USER: float = 0.2
    FUSION_WEIGHT_TIME: float = 0.1
    
    # Material Base Rates (credits per kg)
    MATERIAL_RATES: dict = {
        "PET": 12.0,
        "HDPE": 10.0,
        "Paper": 5.0,
        "Glass": 4.0,
        "Metal": 15.0,
        "E-Waste": 20.0,
        "Cardboard": 6.0,
        "Aluminum": 18.0,
        "Steel": 8.0,
        "Plastic": 7.0,
    }
    
    # Impact Formulas (per kg)
    IMPACT_CO2: dict = {
        "PET": 2.1,
        "HDPE": 1.8,
        "Paper": 1.5,
        "Glass": 0.8,
        "Metal": 3.2,
        "E-Waste": 5.0,
        "Cardboard": 1.2,
        "Aluminum": 8.0,
        "Steel": 2.5,
        "Plastic": 2.0,
    }
    
    IMPACT_WATER: dict = {
        "PET": 15.0,
        "HDPE": 12.0,
        "Paper": 50.0,
        "Glass": 5.0,
        "Metal": 20.0,
        "E-Waste": 30.0,
        "Cardboard": 40.0,
        "Aluminum": 100.0,
        "Steel": 25.0,
        "Plastic": 18.0,
    }
    
    IMPACT_LANDFILL: dict = {
        "PET": 1.0,
        "HDPE": 1.0,
        "Paper": 1.0,
        "Glass": 1.0,
        "Metal": 1.0,
        "E-Waste": 1.0,
        "Cardboard": 1.0,
        "Aluminum": 1.0,
        "Steel": 1.0,
        "Plastic": 1.0,
    }
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
