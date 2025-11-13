"""
Fraud detection service
"""
import imagehash
from PIL import Image
import io
import logging
from typing import Dict
import numpy as np
from datetime import datetime, timedelta
from bson import ObjectId

from app.services.database import get_fraud_checks_collection, get_pending_items_collection
from app.models.token_models import FraudCheckModel

logger = logging.getLogger(__name__)


class FraudService:
    """Service for detecting fraudulent scans"""
    
    async def check_scan_fraud(
        self,
        user_id: str,
        scan_id: str,
        image_bytes: bytes,
        location_lat: float,
        location_lon: float,
        weight_kg: float
    ) -> Dict:
        """
        Perform comprehensive fraud checks
        
        Returns:
            {
                "is_suspicious": bool,
                "fraud_score": float (0-1),
                "reason": str,
                "checks": {...}
            }
        """
        try:
            # Compute image hash
            image = Image.open(io.BytesIO(image_bytes))
            img_hash = str(imagehash.average_hash(image))
            
            # Run all fraud checks
            checks = {}
            
            # 1. Duplicate image check
            checks["duplicate_image"] = await self._check_duplicate_image(
                user_id, img_hash
            )
            
            # 2. Internet image detection (CLIP similarity to stock images)
            checks["internet_image"] = await self._check_internet_image(image_bytes)
            
            # 3. GPS mismatch check
            checks["gps_mismatch"] = await self._check_gps_mismatch(
                user_id, location_lat, location_lon
            )
            
            # 4. Weight sanity check
            checks["weight_sanity"] = self._check_weight_sanity(weight_kg)
            
            # Calculate fraud score
            fraud_score = (
                0.4 * checks["duplicate_image"]["score"] +
                0.3 * checks["internet_image"]["score"] +
                0.2 * checks["gps_mismatch"]["score"] +
                0.1 * checks["weight_sanity"]["score"]
            )
            
            is_suspicious = fraud_score > 0.5
            
            # Determine reason
            reasons = []
            if checks["duplicate_image"]["detected"]:
                reasons.append("Duplicate image detected")
            if checks["internet_image"]["detected"]:
                reasons.append("Possible internet image")
            if checks["gps_mismatch"]["detected"]:
                reasons.append("GPS location mismatch")
            if checks["weight_sanity"]["detected"]:
                reasons.append("Unrealistic weight")
            
            reason = "; ".join(reasons) if reasons else "No issues detected"
            
            # Store fraud check
            fraud_check = FraudCheckModel(
                scan_id=ObjectId(scan_id),
                user_id=ObjectId(user_id),
                image_hash=img_hash,
                duplicate_image_found=checks["duplicate_image"]["detected"],
                internet_image_detected=checks["internet_image"]["detected"],
                gps_mismatch=checks["gps_mismatch"]["detected"],
                weight_sanity_failed=checks["weight_sanity"]["detected"],
                fraud_score=fraud_score,
                is_suspicious=is_suspicious,
                reason=reason
            )
            
            fraud_collection = get_fraud_checks_collection()
            await fraud_collection.insert_one(
                fraud_check.model_dump(by_alias=True, exclude=["id"])
            )
            
            logger.info(
                f"Fraud check for scan {scan_id}: "
                f"suspicious={is_suspicious}, score={fraud_score:.2f}"
            )
            
            return {
                "is_suspicious": is_suspicious,
                "fraud_score": fraud_score,
                "reason": reason,
                "checks": checks
            }
            
        except Exception as e:
            logger.error(f"Fraud check failed: {e}")
            # Return non-suspicious on error
            return {
                "is_suspicious": False,
                "fraud_score": 0.0,
                "reason": "Fraud check failed",
                "checks": {}
            }
    
    async def _check_duplicate_image(self, user_id: str, img_hash: str) -> Dict:
        """Check if image hash already exists"""
        try:
            # Check recent scans (last 30 days)
            since = datetime.utcnow() - timedelta(days=30)
            
            pending_collection = get_pending_items_collection()
            duplicate = await pending_collection.find_one({
                "image_hash": img_hash,
                "user_id": {"$ne": ObjectId(user_id)},  # Different user
                "created_at": {"$gte": since}
            })
            
            detected = duplicate is not None
            score = 1.0 if detected else 0.0
            
            return {
                "detected": detected,
                "score": score,
                "message": "Duplicate image found" if detected else "No duplicate"
            }
            
        except Exception as e:
            logger.error(f"Duplicate check failed: {e}")
            return {"detected": False, "score": 0.0, "message": "Check failed"}
    
    async def _check_internet_image(self, image_bytes: bytes) -> Dict:
        """
        Check if image might be from internet (stock photo)
        Using heuristics for now - could use reverse image search
        """
        try:
            # Simple heuristic: check image quality/size
            image = Image.open(io.BytesIO(image_bytes))
            width, height = image.size
            
            # Stock photos tend to be high resolution
            is_high_res = width > 2000 and height > 2000
            
            # Real phone photos are usually between 720p and 4K
            is_suspicious_size = is_high_res or (width < 500 and height < 500)
            
            detected = is_suspicious_size
            score = 0.7 if detected else 0.0
            
            return {
                "detected": detected,
                "score": score,
                "message": f"Image size: {width}x{height}"
            }
            
        except Exception as e:
            logger.error(f"Internet image check failed: {e}")
            return {"detected": False, "score": 0.0, "message": "Check failed"}
    
    async def _check_gps_mismatch(
        self, 
        user_id: str, 
        lat: float, 
        lon: float
    ) -> Dict:
        """Check if GPS is drastically different from usual locations"""
        try:
            # Get user's recent scans
            pending_collection = get_pending_items_collection()
            recent_scans = await pending_collection.find({
                "user_id": ObjectId(user_id)
            }).sort("created_at", -1).limit(10).to_list(10)
            
            if len(recent_scans) < 3:
                # Not enough history
                return {"detected": False, "score": 0.0, "message": "Insufficient history"}
            
            # Check if location is far from all recent locations
            from app.osm.osm_service import osm_service
            
            is_far_from_all = True
            for scan in recent_scans:
                if "location" in scan and scan["location"]:
                    prev_lon, prev_lat = scan["location"]["coordinates"]
                    
                    # Calculate distance
                    import math
                    R = 6371  # Earth radius in km
                    dlat = math.radians(lat - prev_lat)
                    dlon = math.radians(lon - prev_lon)
                    a = (math.sin(dlat/2)**2 + 
                         math.cos(math.radians(prev_lat)) * 
                         math.cos(math.radians(lat)) * 
                         math.sin(dlon/2)**2)
                    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
                    distance_km = R * c
                    
                    if distance_km < 50:  # Within 50km of previous scan
                        is_far_from_all = False
                        break
            
            detected = is_far_from_all
            score = 0.8 if detected else 0.0
            
            return {
                "detected": detected,
                "score": score,
                "message": "Location far from usual" if detected else "Normal location"
            }
            
        except Exception as e:
            logger.error(f"GPS mismatch check failed: {e}")
            return {"detected": False, "score": 0.0, "message": "Check failed"}
    
    def _check_weight_sanity(self, weight_kg: float) -> Dict:
        """Check if weight is realistic"""
        try:
            # Sanity bounds: 0.01 kg to 100 kg
            is_too_light = weight_kg < 0.01
            is_too_heavy = weight_kg > 100
            
            detected = is_too_light or is_too_heavy
            score = 1.0 if detected else 0.0
            
            message = "Weight unrealistic" if detected else "Normal weight"
            
            return {
                "detected": detected,
                "score": score,
                "message": message
            }
            
        except Exception as e:
            logger.error(f"Weight sanity check failed: {e}")
            return {"detected": False, "score": 0.0, "message": "Check failed"}


# Global fraud service instance
fraud_service = FraudService()
