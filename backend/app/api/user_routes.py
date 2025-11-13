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
