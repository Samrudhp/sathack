"""
Credit system API endpoints
"""
from fastapi import APIRouter, HTTPException, Form, Depends
from typing import Optional
import logging
from bson import ObjectId

from app.services.credit_service import credit_service
from app.services.database import (
    db,
    get_recycler_credentials_collection,
    get_recyclers_collection,
    get_waste_deliveries_collection,
    get_users_collection
)

logger = logging.getLogger(__name__)
router = APIRouter()


# ============================================
# USER ENDPOINTS
# ============================================

@router.get("/user/stats/{user_id}")
async def get_user_stats(user_id: str):
    """Get user statistics and impact"""
    try:
        stats = await credit_service.get_user_stats(user_id)
        return stats
    except Exception as e:
        logger.error(f"Get user stats failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/user/redeem")
async def redeem_code(
    user_id: str = Form(...),
    code: str = Form(...)
):
    """Redeem a code and award tokens to user"""
    try:
        result = await credit_service.redeem_code(code.upper(), user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Redeem code failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# RECYCLER ENDPOINTS
# ============================================

@router.post("/recycler/login")
async def recycler_login(
    username: str = Form(...),
    password: str = Form(...)
):
    """Simple recycler login"""
    try:
        # Find recycler credentials
        creds_collection = get_recycler_credentials_collection()
        creds = await creds_collection.find_one({"username": username})
        
        if not creds or creds["password"] != password:  # Simple password check (no hashing for now)
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Get recycler details
        recyclers_collection = get_recyclers_collection()
        recycler = await recyclers_collection.find_one({"_id": creds["recycler_id"]})
        
        if not recycler:
            raise HTTPException(status_code=404, detail="Recycler not found")
        
        return {
            "recycler_id": str(recycler["_id"]),
            "username": username,
            "name": recycler.get("name", "Unknown"),
            "phone": recycler.get("phone", ""),
            "address": recycler.get("address", "")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Recycler login failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recycler/generate-code")
async def generate_redemption_code(
    recycler_id: str = Form(...),
    user_id: str = Form(...),
    material: str = Form(...),
    weight_kg: float = Form(...),
    scan_id: Optional[str] = Form(None)
):
    """Generate redemption code when user delivers waste"""
    try:
        result = await credit_service.create_redemption_code(
            recycler_id=recycler_id,
            user_id=user_id,
            material=material,
            weight_kg=weight_kg,
            scan_id=scan_id
        )
        return result
    except Exception as e:
        logger.error(f"Generate code failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recycler/deliveries/{recycler_id}")
async def get_recycler_deliveries(recycler_id: str, limit: int = 50):
    """Get recent waste deliveries for a recycler"""
    try:
        deliveries_collection = get_waste_deliveries_collection()
        deliveries = await deliveries_collection.find(
            {"recycler_id": ObjectId(recycler_id)}
        ).sort("delivered_at", -1).limit(limit).to_list(length=limit)
        
        # Get user names
        user_ids = [d["user_id"] for d in deliveries]
        users_collection = get_users_collection()
        users = await users_collection.find(
            {"_id": {"$in": user_ids}}
        ).to_list(length=len(user_ids))
        
        user_map = {str(u["_id"]): u.get("name", "Unknown") for u in users}
        
        # Format response
        result = []
        for d in deliveries:
            result.append({
                "id": str(d["_id"]),
                "user_name": user_map.get(str(d["user_id"]), "Unknown"),
                "material": d["material"],
                "weight_kg": d["weight_kg"],
                "tokens_awarded": d["tokens_awarded"],
                "delivered_at": d["delivered_at"].isoformat()
            })
        
        return {"deliveries": result, "count": len(result)}
    except Exception as e:
        logger.error(f"Get deliveries failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recycler/stats/{recycler_id}")
async def get_recycler_stats(recycler_id: str):
    """Get recycler statistics"""
    try:
        deliveries_collection = get_waste_deliveries_collection()
        
        # Aggregate stats
        pipeline = [
            {"$match": {"recycler_id": ObjectId(recycler_id)}},
            {"$group": {
                "_id": None,
                "total_deliveries": {"$sum": 1},
                "total_weight_kg": {"$sum": "$weight_kg"},
                "total_tokens_issued": {"$sum": "$tokens_awarded"},
                "total_co2_saved": {"$sum": "$co2_saved_kg"},
                "total_water_saved": {"$sum": "$water_saved_liters"},
                "total_landfill_saved": {"$sum": "$landfill_saved_kg"}
            }}
        ]
        
        cursor = deliveries_collection.aggregate(pipeline)
        stats = await cursor.to_list(length=1)
        
        if stats:
            result = stats[0]
            result.pop("_id")
        else:
            result = {
                "total_deliveries": 0,
                "total_weight_kg": 0.0,
                "total_tokens_issued": 0,
                "total_co2_saved": 0.0,
                "total_water_saved": 0.0,
                "total_landfill_saved": 0.0
            }
        
        return result
    except Exception as e:
        logger.error(f"Get recycler stats failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
