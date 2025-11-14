"""
Main FastAPI application
"""
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from datetime import datetime
from typing import Optional, List
from bson import ObjectId

from app.config import settings
from app.services.database import db
from app.services.vector_db import global_rag_vector_db, personal_rag_vector_db

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events"""
    # Startup
    logger.info("Starting ReNova backend...")
    
    # Connect to MongoDB
    await db.connect_db()
    
    # Initialize vector databases
    await global_rag_vector_db.initialize()
    await personal_rag_vector_db.initialize()
    
    # Initialize AI services
    from app.voice.whisper_service import voice_service
    from app.vision.clip_service import vision_service
    
    logger.info("Initializing Whisper model for voice transcription...")
    try:
        await voice_service.initialize()
        logger.info("✓ Whisper initialized")
    except Exception as e:
        logger.warning(f"Whisper initialization failed: {e}. Voice features may not work.")
    
    logger.info("Initializing CLIP model for image classification...")
    try:
        await vision_service.initialize()
        logger.info("✓ CLIP initialized")
    except Exception as e:
        logger.warning(f"CLIP initialization failed: {e}. Image scan may not work.")
    
    logger.info("ReNova backend started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down ReNova backend...")
    await db.close_db()
    logger.info("ReNova backend shutdown complete")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-driven waste intelligence system with RAG, vision, and marketplace",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Import routers
from app.api import user_routes, recycler_routes, marketplace_routes, scan_routes, token_routes, impact_routes, credit_routes, bhashini_routes

app.include_router(user_routes.router, prefix="/api", tags=["User"])
app.include_router(scan_routes.router, prefix="/api/scan", tags=["Scan"])
app.include_router(recycler_routes.router, prefix="/api/recycler", tags=["Recycler"])
app.include_router(marketplace_routes.router, prefix="/api", tags=["Marketplace"])
app.include_router(token_routes.router, prefix="/api", tags=["Tokens"])
app.include_router(impact_routes.router, prefix="/api", tags=["Impact"])
app.include_router(credit_routes.router, prefix="/api", tags=["Credits"])
app.include_router(bhashini_routes.router, prefix="/api/bhashini", tags=["Bhashini Translation"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "message": "ReNova Waste Intelligence API"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check MongoDB connection
        await db.client.admin.command('ping')
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
