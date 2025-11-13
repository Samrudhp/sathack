"""
Impact statistics API endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging
from datetime import datetime, date
from bson import ObjectId

from app.services.database import get_impact_stats_collection

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/impact_stats")
async def get_impact_stats(
    user_id: Optional[str] = Query(None),
    scope: str = Query("user"),  # user/recycler/ward/city/global
    period: str = Query("all_time")  # daily/weekly/monthly/all_time
):
    """
    Get environmental impact statistics
    """
    try:
        impact_collection = get_impact_stats_collection()
        
        # Build query
        query = {
            "scope": scope,
            "period": period
        }
        
        if user_id and scope == "user":
            query["scope_id"] = user_id
        
        stats = await impact_collection.find_one(query)
        
        if not stats:
            # Return empty stats
            return {
                "total_scans": 0,
                "total_weight_kg": 0.0,
                "co2_saved_kg": 0.0,
                "water_saved_liters": 0.0,
                "landfill_saved_kg": 0.0,
                "total_credits": 0,
                "message": "No stats found"
            }
        
        # Convert ObjectId
        if "_id" in stats:
            stats["_id"] = str(stats["_id"])
        
        return stats
        
    except Exception as e:
        logger.error(f"Get impact stats failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
