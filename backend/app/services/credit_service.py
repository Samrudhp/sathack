"""
Credit system service for token generation and redemption
"""
import logging
import random
import string
from typing import Optional, Dict
from datetime import datetime, timedelta
from bson import ObjectId

from app.services.database import (
    db,
    get_redemption_codes_collection,
    get_waste_deliveries_collection,
    get_users_collection
)
from app.models.credit_models import RedemptionCode, WasteDelivery
from app.impact.impact_service import impact_service

logger = logging.getLogger(__name__)


class CreditService:
    """Service for managing credits and redemption codes"""
    
    def generate_code(self) -> str:
        """Generate a unique 6-character redemption code"""
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    async def create_redemption_code(
        self,
        recycler_id: str,
        user_id: str,
        material: str,
        weight_kg: float,
        scan_id: Optional[str] = None
    ) -> Dict:
        """
        Create a redemption code when user delivers waste to recycler
        
        Returns:
            Dict with code and token details
        """
        try:
            # Calculate tokens and environmental impact
            tokens = impact_service.calculate_credits(material, weight_kg, 70)  # Assume 70% cleanliness
            co2_saved = impact_service.calculate_co2_saved(material, weight_kg)
            water_saved = impact_service.calculate_water_saved(material, weight_kg)
            landfill_saved = impact_service.calculate_landfill_saved(material, weight_kg)
            
            # Generate unique code
            code = self.generate_code()
            
            # Ensure code is unique
            redemption_collection = get_redemption_codes_collection()
            while await redemption_collection.find_one({"code": code, "is_redeemed": False}):
                code = self.generate_code()
            
            # Create redemption code
            redemption = RedemptionCode(
                code=code,
                recycler_id=ObjectId(recycler_id),
                user_id=ObjectId(user_id),
                scan_id=ObjectId(scan_id) if scan_id else None,
                material=material,
                weight_kg=weight_kg,
                tokens=tokens,
                co2_saved_kg=co2_saved,
                water_saved_liters=water_saved,
                landfill_saved_kg=landfill_saved,
                expires_at=datetime.utcnow() + timedelta(days=7)  # 7 days to redeem
            )
            
            result = await redemption_collection.insert_one(
                redemption.model_dump(by_alias=True, exclude=["id"])
            )
            
            # Record waste delivery
            delivery = WasteDelivery(
                user_id=ObjectId(user_id),
                recycler_id=ObjectId(recycler_id),
                scan_id=ObjectId(scan_id) if scan_id else None,
                material=material,
                weight_kg=weight_kg,
                tokens_awarded=tokens,
                co2_saved_kg=co2_saved,
                water_saved_liters=water_saved,
                landfill_saved_kg=landfill_saved,
                redemption_code_id=result.inserted_id
            )
            
            delivery_collection = get_waste_deliveries_collection()
            await delivery_collection.insert_one(
                delivery.model_dump(by_alias=True, exclude=["id"])
            )
            
            logger.info(f"Created redemption code {code} for user {user_id}, {tokens} tokens")
            
            return {
                "code": code,
                "tokens": tokens,
                "material": material,
                "weight_kg": weight_kg,
                "co2_saved_kg": co2_saved,
                "water_saved_liters": water_saved,
                "landfill_saved_kg": landfill_saved,
                "expires_at": redemption.expires_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to create redemption code: {e}")
            raise
    
    async def redeem_code(self, code: str, user_id: str) -> Dict:
        """
        Redeem a code and award tokens to user
        
        Returns:
            Dict with redemption details
        """
        try:
            redemption_collection = get_redemption_codes_collection()
            
            # Find the code
            redemption = await redemption_collection.find_one({
                "code": code,
                "user_id": ObjectId(user_id),
                "is_redeemed": False
            })
            
            if not redemption:
                raise ValueError("Invalid or already redeemed code")
            
            # Check expiration
            if redemption["expires_at"] < datetime.utcnow():
                raise ValueError("Code has expired")
            
            # Mark as redeemed
            await redemption_collection.update_one(
                {"_id": redemption["_id"]},
                {
                    "$set": {
                        "is_redeemed": True,
                        "redeemed_at": datetime.utcnow()
                    }
                }
            )
            
            # Update user stats
            users_collection = get_users_collection()
            update_result = await users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$inc": {
                        "tokens_earned": redemption["tokens"],
                        "tokens_balance": redemption["tokens"],
                        "total_co2_saved_kg": redemption["co2_saved_kg"],
                        "total_water_saved_liters": redemption["water_saved_liters"],
                        "total_landfill_saved_kg": redemption["landfill_saved_kg"]
                    },
                    "$set": {
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            logger.info(f"Updated user stats - matched: {update_result.matched_count}, modified: {update_result.modified_count}")
            
            # ALSO UPDATE WALLET - THIS IS THE FIX!
            from app.services.database import get_wallets_collection
            wallets_collection = get_wallets_collection()
            wallet_result = await wallets_collection.update_one(
                {"user_id": ObjectId(user_id)},
                {
                    "$inc": {
                        "balance": redemption["tokens"],
                        "total_earned": redemption["tokens"]
                    },
                    "$set": {
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            logger.info(f"Updated wallet - matched: {wallet_result.matched_count}, modified: {wallet_result.modified_count}")
            
            # Verify the update
            updated_user = await users_collection.find_one({"_id": ObjectId(user_id)})
            if updated_user:
                logger.info(f"User {user_id} new balance: {updated_user.get('tokens_balance', 0)} tokens")
            
            logger.info(f"Redeemed code {code} for user {user_id}, awarded {redemption['tokens']} tokens")
            
            return {
                "success": True,
                "tokens_awarded": redemption["tokens"],
                "material": redemption["material"],
                "weight_kg": redemption["weight_kg"],
                "co2_saved_kg": redemption["co2_saved_kg"],
                "water_saved_liters": redemption["water_saved_liters"],
                "landfill_saved_kg": redemption["landfill_saved_kg"]
            }
            
        except Exception as e:
            logger.error(f"Failed to redeem code: {e}")
            raise
    
    async def get_user_stats(self, user_id: str) -> Dict:
        """Get user statistics"""
        try:
            users_collection = get_users_collection()
            user = await users_collection.find_one({"_id": ObjectId(user_id)})
            
            if not user:
                raise ValueError("User not found")
            
            # Get stats from nested object or flat fields (for backwards compatibility)
            stats = user.get("stats", {})
            
            return {
                "total_scans": stats.get("total_scans", user.get("total_scans", 0)),
                "tokens_earned": stats.get("tokens_earned", user.get("tokens_earned", 0)),
                "tokens_balance": stats.get("tokens_balance", user.get("tokens_balance", 0)),
                "total_co2_saved_kg": stats.get("total_co2_saved_kg", user.get("total_co2_saved_kg", 0.0)),
                "total_water_saved_liters": stats.get("total_water_saved_liters", user.get("total_water_saved_liters", 0.0)),
                "total_landfill_saved_kg": stats.get("total_landfill_saved_kg", user.get("total_landfill_saved_kg", 0.0))
            }
            
        except Exception as e:
            logger.error(f"Failed to get user stats: {e}")
            raise


# Global credit service instance
credit_service = CreditService()
