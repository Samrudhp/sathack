"""
Recycler-related API endpoints
"""
from fastapi import APIRouter, HTTPException, Query, Form
from typing import Optional
import logging
from datetime import datetime
from bson import ObjectId

from app.services.database import (
    get_recyclers_collection,
    get_pending_items_collection,
    get_recycler_submissions_collection,
    get_completed_scans_collection
)
from app.models.recycler_models import RecyclerModel, RecyclerSubmissionModel
from app.models.scan_models import CompletedScanModel
from app.impact.impact_service import impact_service
from app.tokens.token_service import token_service
from app.utils.fraud_service import fraud_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/items_pending")
async def get_pending_items(
    recycler_id: str = Query(...),
    limit: int = Query(20, le=100)
):
    """
    Get pending scans for recycler to process
    """
    try:
        pending_collection = get_pending_items_collection()
        
        # Get items near recycler's location
        recyclers_collection = get_recyclers_collection()
        recycler = await recyclers_collection.find_one({"_id": ObjectId(recycler_id)})
        
        if not recycler:
            raise HTTPException(status_code=404, detail="Recycler not found")
        
        # Find pending items
        cursor = pending_collection.find({
            "status": "pending"
        }).sort("created_at", -1).limit(limit)
        
        items = []
        async for item in cursor:
            item["_id"] = str(item["_id"])
            item["user_id"] = str(item["user_id"])
            items.append(item)
        
        return {
            "items": items,
            "count": len(items)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get pending items failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/submit")
async def submit_recycler_processing(
    recycler_id: str = Form(...),
    scan_id: str = Form(...),
    weight_kg: float = Form(...),
    material_override: Optional[str] = Form(None)
):
    """
    Recycler submits weight and material (if overridden)
    Backend computes credits and generates token
    """
    try:
        logger.info(f"Recycler {recycler_id} submitting scan {scan_id}")
        
        # Get pending item
        pending_collection = get_pending_items_collection()
        pending_item = await pending_collection.find_one({"_id": ObjectId(scan_id)})
        
        if not pending_item:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        user_id = str(pending_item["user_id"])
        
        # Get auto-filled data
        material_predicted = pending_item.get("vision_prediction", {}).get("material", "Plastic")
        cleanliness_score = pending_item.get("vision_prediction", {}).get("cleanliness_score", 70)
        hazard_flag = pending_item.get("vision_prediction", {}).get("hazard_class") is not None
        
        # Determine final material
        final_material = material_override if material_override else material_predicted
        
        # Run fraud check
        if "image_url" in pending_item:  # If we have image
            # For now, skip detailed fraud check or implement with stored image
            pass
        
        # Calculate credits
        credits = impact_service.calculate_credits(
            material=final_material,
            weight_kg=weight_kg,
            cleanliness_score=cleanliness_score
        )
        
        # Calculate impacts
        impacts = impact_service.calculate_all_impacts(
            material=final_material,
            weight_kg=weight_kg,
            cleanliness_score=cleanliness_score
        )
        
        # Create recycler submission
        submission = RecyclerSubmissionModel(
            recycler_id=ObjectId(recycler_id),
            scan_id=ObjectId(scan_id),
            user_id=ObjectId(user_id),
            weight_kg=weight_kg,
            material_override=material_override,
            material_predicted=material_predicted,
            cleanliness_score=cleanliness_score,
            hazard_flag=hazard_flag,
            final_material=final_material,
            credits_awarded=credits
        )
        
        submissions_collection = get_recycler_submissions_collection()
        await submissions_collection.insert_one(
            submission.model_dump(by_alias=True, exclude=["id"])
        )
        
        # Create completed scan
        completed_scan = CompletedScanModel(
            user_id=ObjectId(user_id),
            recycler_id=ObjectId(recycler_id),
            pending_item_id=ObjectId(scan_id),
            material=final_material,
            weight_kg=weight_kg,
            credits_awarded=credits,
            cleanliness_score=cleanliness_score,
            co2_saved_kg=impacts["co2_saved_kg"],
            water_saved_liters=impacts["water_saved_liters"],
            landfill_saved_kg=impacts["landfill_saved_kg"],
            location=pending_item.get("location")
        )
        
        completed_collection = get_completed_scans_collection()
        await completed_collection.insert_one(
            completed_scan.model_dump(by_alias=True, exclude=["id", "token_id"])
        )
        
        # Generate token
        token_info = await token_service.create_token(
            user_id=user_id,
            recycler_id=recycler_id,
            scan_id=scan_id,
            credits=credits,
            material=final_material,
            weight_kg=weight_kg,
            cleanliness_score=cleanliness_score
        )
        
        # Update pending item status
        await pending_collection.update_one(
            {"_id": ObjectId(scan_id)},
            {
                "$set": {
                    "status": "completed",
                    "assigned_recycler_id": ObjectId(recycler_id),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Update impact stats
        from app.services.database import get_impact_stats_collection
        impact_collection = get_impact_stats_collection()
        
        # Update user stats
        await impact_collection.update_one(
            {
                "scope": "user",
                "scope_id": user_id,
                "period": "all_time"
            },
            {
                "$inc": {
                    "total_scans": 1,
                    "total_weight_kg": weight_kg,
                    "co2_saved_kg": impacts["co2_saved_kg"],
                    "water_saved_liters": impacts["water_saved_liters"],
                    "landfill_saved_kg": impacts["landfill_saved_kg"],
                    "total_credits": credits
                },
                "$set": {"updated_at": datetime.utcnow()},
                "$setOnInsert": {"scope": "user", "scope_id": user_id, "period": "all_time"}
            },
            upsert=True
        )
        
        logger.info(f"Recycler submission complete: {credits} credits, token={token_info['token_id']}")
        
        return {
            "success": True,
            "credits_awarded": credits,
            "token": token_info,
            "environmental_impact": {
                "co2_saved_kg": impacts["co2_saved_kg"],
                "water_saved_liters": impacts["water_saved_liters"],
                "landfill_saved_kg": impacts["landfill_saved_kg"]
            },
            "material": final_material,
            "weight_kg": weight_kg
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Recycler submission failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
