"""
User-related API endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging
from datetime import datetime
from bson import ObjectId

from app.services.database import get_users_collection, get_wallets_collection
from app.models.user_models import UserModel, WalletModel

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/user/register")
async def register_user(user: UserModel):
    """Register a new user"""
    try:
        users_collection = get_users_collection()
        
        # Check if user exists
        existing = await users_collection.find_one({"phone": user.phone})
        if existing:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Insert user
        result = await users_collection.insert_one(
            user.model_dump(by_alias=True, exclude=["id"])
        )
        user_id = str(result.inserted_id)
        
        # Create wallet
        wallets_collection = get_wallets_collection()
        wallet = WalletModel(user_id=ObjectId(user_id))
        await wallets_collection.insert_one(
            wallet.model_dump(by_alias=True, exclude=["id"])
        )
        
        logger.info(f"Registered new user: {user_id}")
        
        return {
            "user_id": user_id,
            "phone": user.phone,
            "message": "User registered successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User registration failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}")
async def get_user(user_id: str):
    """Get user details"""
    try:
        users_collection = get_users_collection()
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Convert ObjectId to string
        user["_id"] = str(user["_id"])
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/token_balance")
async def get_token_balance(user_id: str = Query(...)):
    """Get user's token/credit balance"""
    try:
        from app.tokens.token_service import token_service
        
        balance = await token_service.get_wallet_balance(user_id)
        
        return balance
        
    except Exception as e:
        logger.error(f"Get token balance failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/wallet/{user_id}")
async def get_wallet(user_id: str):
    """Get user's wallet details"""
    try:
        wallets_collection = get_wallets_collection()
        wallet = await wallets_collection.find_one({"user_id": ObjectId(user_id)})
        
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        # Convert ObjectId to string
        wallet["_id"] = str(wallet["_id"])
        wallet["user_id"] = str(wallet["user_id"])
        
        return wallet
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get wallet failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/stats/{user_id}")
async def get_user_stats(user_id: str):
    """
    Get user statistics including scans, tokens, and environmental impact
    """
    try:
        from app.services.database import (
            get_pending_items_collection, 
            get_wallets_collection,
            get_completed_scans_collection
        )
        
        # Get user info
        users_collection = get_users_collection()
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get wallet balance
        wallets_collection = get_wallets_collection()
        wallet = await wallets_collection.find_one({"user_id": ObjectId(user_id)})
        tokens_balance = wallet.get("balance", 0) if wallet else 0
        tokens_earned = wallet.get("total_earned", 0) if wallet else 0
        
        # Count all scans (pending + completed)
        pending_collection = get_pending_items_collection()
        pending_count = await pending_collection.count_documents({"user_id": ObjectId(user_id)})
        
        completed_collection = get_completed_scans_collection()
        completed_count = await completed_collection.count_documents({"user_id": ObjectId(user_id)})
        
        total_scans = pending_count + completed_count
        
        # Calculate environmental impact from completed scans
        completed_scans = completed_collection.find({"user_id": ObjectId(user_id)})
        
        total_co2_saved = 0.0
        total_water_saved = 0.0
        total_landfill_saved = 0.0
        
        async for scan in completed_scans:
            env_impact = scan.get("environmental_impact", {})
            total_co2_saved += env_impact.get("co2_saved_kg", 0)
            total_water_saved += env_impact.get("water_saved_liters", 0)
            total_landfill_saved += env_impact.get("landfill_saved_kg", 0)
        
        # Also check pending scans for their LLM-calculated impact
        pending_scans = pending_collection.find({"user_id": ObjectId(user_id)})
        
        pending_tokens = 0  # NEW: Track tokens that will be awarded
        
        async for scan in pending_scans:
            llm_response = scan.get("llm_response", {})
            total_co2_saved += llm_response.get("co2_saved_kg", 0)
            total_water_saved += llm_response.get("water_saved_liters", 0)
            total_landfill_saved += llm_response.get("landfill_saved_kg", 0)
            pending_tokens += llm_response.get("estimated_credits", 0)  # NEW
        
        return {
            "user_id": user_id,
            "name": user.get("name", "User"),
            "phone": user.get("phone", ""),
            "total_scans": total_scans,
            "pending_scans": pending_count,
            "completed_scans": completed_count,
            "tokens_balance": tokens_balance,
            "tokens_earned": tokens_earned,
            "pending_tokens": pending_tokens,  # NEW: Tokens from unconfirmed scans
            "total_co2_saved_kg": round(total_co2_saved, 2),
            "total_water_saved_liters": round(total_water_saved, 2),
            "total_landfill_saved_kg": round(total_landfill_saved, 2),
            "created_at": user.get("created_at"),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user stats failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
