"""
Marketplace API endpoints
"""
from fastapi import APIRouter, HTTPException, Query, Form
from typing import Optional, List
import logging
from datetime import datetime
from bson import ObjectId

from app.marketplace.marketplace_service import marketplace_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/recyclers_nearby")
async def get_recyclers_nearby(
    lat: float = Query(...),
    lon: float = Query(...),
    material: Optional[str] = Query(None),
    weight_kg: float = Query(1.0)
):
    """
    Get nearby recyclers with comprehensive scoring
    """
    try:
        logger.info(f"Finding recyclers near ({lat}, {lon})")
        
        recyclers = await marketplace_service.rank_recyclers(
            user_lat=lat,
            user_lon=lon,
            material=material or "Plastic",
            weight_kg=weight_kg
        )
        
        return {
            "recyclers": [r.model_dump() for r in recyclers],
            "count": len(recyclers)
        }
        
    except Exception as e:
        logger.error(f"Get recyclers nearby failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/schedule_pickup")
async def schedule_pickup(
    user_id: str = Form(...),
    recycler_id: str = Form(...),
    pickup_lat: float = Form(...),
    pickup_lon: float = Form(...),
    pickup_address: str = Form(...),
    scheduled_date: str = Form(...),  # ISO format
    scheduled_time_slot: str = Form(...),
    materials: str = Form(...),  # Comma-separated
    estimated_weight_kg: float = Form(...),
    contact_phone: str = Form(...),
    special_instructions: Optional[str] = Form(None),
    scan_id: Optional[str] = Form(None)
):
    """
    Schedule a pickup with recycler
    """
    try:
        logger.info(f"Scheduling pickup for user {user_id}")
        
        # Parse materials
        materials_list = [m.strip() for m in materials.split(",")]
        
        # Parse date
        scheduled_datetime = datetime.fromisoformat(scheduled_date)
        
        result = await marketplace_service.schedule_pickup(
            user_id=user_id,
            recycler_id=recycler_id,
            pickup_lat=pickup_lat,
            pickup_lon=pickup_lon,
            pickup_address=pickup_address,
            scheduled_date=scheduled_datetime,
            scheduled_time_slot=scheduled_time_slot,
            materials=materials_list,
            estimated_weight_kg=estimated_weight_kg,
            contact_phone=contact_phone,
            special_instructions=special_instructions,
            scan_id=scan_id
        )
        
        return {
            "success": True,
            **result
        }
        
    except Exception as e:
        logger.error(f"Schedule pickup failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
