"""
Token management service
"""
import logging
import random
import string
from datetime import datetime, timedelta
from typing import Optional, Dict
from bson import ObjectId

from app.config import settings
from app.services.database import get_tokens_collection, get_wallets_collection, get_token_redemptions_collection
from app.models.token_models import TokenModel, TokenRedemptionModel

logger = logging.getLogger(__name__)


class TokenService:
    """Service for token/credit management"""
    
    def generate_token_id(self, length: int = 6) -> str:
        """Generate random token ID"""
        chars = string.ascii_uppercase + string.digits
        return ''.join(random.choice(chars) for _ in range(length))
    
    async def create_token(
        self,
        user_id: str,
        recycler_id: str,
        scan_id: str,
        credits: int,
        material: str,
        weight_kg: float,
        cleanliness_score: float
    ) -> Dict:
        """
        Create a new token for user
        
        Returns:
            Token document
        """
        try:
            # Generate unique token ID
            token_id = self.generate_token_id()
            
            # Ensure uniqueness
            tokens_collection = get_tokens_collection()
            while await tokens_collection.find_one({"token_id": token_id}):
                token_id = self.generate_token_id()
            
            # Calculate expiry
            expires_at = datetime.utcnow() + timedelta(hours=settings.TOKEN_EXPIRY_HOURS)
            
            # Create token
            token = TokenModel(
                token_id=token_id,
                user_id=ObjectId(user_id),
                recycler_id=ObjectId(recycler_id),
                scan_id=ObjectId(scan_id),
                credits=credits,
                material=material,
                weight_kg=weight_kg,
                cleanliness_score=cleanliness_score,
                expires_at=expires_at
            )
            
            # Insert into database
            result = await tokens_collection.insert_one(token.model_dump(by_alias=True, exclude=["id"]))
            
            logger.info(f"Created token {token_id} for user {user_id}: {credits} credits")
            
            return {
                "token_id": token_id,
                "credits": credits,
                "expires_at": expires_at.isoformat(),
                "material": material,
                "weight_kg": weight_kg
            }
            
        except Exception as e:
            logger.error(f"Failed to create token: {e}")
            raise
    
    async def redeem_token(self, user_id: str, token_id: str) -> Dict:
        """
        Redeem a token and add credits to wallet
        
        Returns:
            Redemption details
        """
        try:
            tokens_collection = get_tokens_collection()
            wallets_collection = get_wallets_collection()
            
            # Find token
            token = await tokens_collection.find_one({"token_id": token_id})
            
            if not token:
                raise ValueError("Token not found")
            
            # Validate token
            if str(token["user_id"]) != user_id:
                raise ValueError("Token does not belong to this user")
            
            if token["status"] != "unused":
                raise ValueError(f"Token already {token['status']}")
            
            if datetime.utcnow() > token["expires_at"]:
                # Mark as expired
                await tokens_collection.update_one(
                    {"_id": token["_id"]},
                    {"$set": {"status": "expired"}}
                )
                raise ValueError("Token has expired")
            
            # Get wallet
            wallet = await wallets_collection.find_one({"user_id": ObjectId(user_id)})
            
            if not wallet:
                # Create wallet if doesn't exist
                wallet = {
                    "user_id": ObjectId(user_id),
                    "balance": 0,
                    "total_earned": 0,
                    "total_redeemed": 0,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                result = await wallets_collection.insert_one(wallet)
                wallet["_id"] = result.inserted_id
            
            # Calculate new balance
            credits = token["credits"]
            old_balance = wallet["balance"]
            new_balance = old_balance + credits
            
            # Update wallet
            await wallets_collection.update_one(
                {"_id": wallet["_id"]},
                {
                    "$set": {
                        "balance": new_balance,
                        "updated_at": datetime.utcnow()
                    },
                    "$inc": {
                        "total_earned": credits
                    }
                }
            )
            
            # Mark token as used
            await tokens_collection.update_one(
                {"_id": token["_id"]},
                {
                    "$set": {
                        "status": "used",
                        "redeemed_at": datetime.utcnow()
                    }
                }
            )
            
            # Log redemption
            redemptions_collection = get_token_redemptions_collection()
            redemption = TokenRedemptionModel(
                token_id=token["_id"],
                user_id=ObjectId(user_id),
                credits=credits,
                wallet_balance_before=old_balance,
                wallet_balance_after=new_balance
            )
            await redemptions_collection.insert_one(redemption.model_dump(by_alias=True, exclude=["id"]))
            
            logger.info(f"User {user_id} redeemed token {token_id}: {credits} credits")
            
            return {
                "success": True,
                "credits_added": credits,
                "old_balance": old_balance,
                "new_balance": new_balance,
                "material": token["material"],
                "weight_kg": token["weight_kg"]
            }
            
        except Exception as e:
            logger.error(f"Failed to redeem token: {e}")
            raise
    
    async def get_wallet_balance(self, user_id: str) -> Dict:
        """Get user's wallet balance"""
        try:
            wallets_collection = get_wallets_collection()
            wallet = await wallets_collection.find_one({"user_id": ObjectId(user_id)})
            
            if not wallet:
                return {
                    "balance": 0,
                    "total_earned": 0,
                    "total_redeemed": 0
                }
            
            return {
                "balance": wallet.get("balance", 0),
                "total_earned": wallet.get("total_earned", 0),
                "total_redeemed": wallet.get("total_redeemed", 0)
            }
            
        except Exception as e:
            logger.error(f"Failed to get wallet balance: {e}")
            return {"balance": 0, "total_earned": 0, "total_redeemed": 0}


# Global token service instance
token_service = TokenService()
