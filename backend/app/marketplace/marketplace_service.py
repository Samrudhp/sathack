"""
Marketplace service for recycler ranking and scheduling
"""
import logging
from typing import List, Dict, Optional
import asyncio
from bson import ObjectId

from app.services.database import get_recyclers_collection, get_pickups_collection
from app.osm.osm_service import osm_service
from app.models.marketplace_models import RecyclerScore, PickupScheduleModel
from datetime import datetime

logger = logging.getLogger(__name__)


class MarketplaceService:
    """Service for recycler marketplace and pickups"""
    
    async def rank_recyclers(
        self,
        user_lat: float,
        user_lon: float,
        material: str,
        weight_kg: float,
        ward: Optional[str] = None
    ) -> List[RecyclerScore]:
        """
        Rank recyclers by comprehensive scoring
        
        Score = w1*(1/distance) + w2*(material_accept) + w3*(capacity) + 
                w4*(price) + w5*(road_access) + w6*(catchment_zone)
        
        Returns:
            List of RecyclerScore sorted by score (descending)
        """
        try:
            logger.info(f"Ranking recyclers for ({user_lat}, {user_lon}), material={material}, weight={weight_kg}kg")
            
            # Get nearby recyclers from MongoDB
            recyclers_collection = get_recyclers_collection()
            
            # Try geospatial query first
            try:
                # Find recyclers within 20km using $near
                recyclers_cursor = recyclers_collection.find({
                    "is_active": True,
                    "location": {
                        "$near": {
                            "$geometry": {
                                "type": "Point",
                                "coordinates": [user_lon, user_lat]
                            },
                            "$maxDistance": 20000  # 20km
                        }
                    }
                })
                
                recyclers = await recyclers_cursor.to_list(length=50)
                logger.info(f"Geospatial query found {len(recyclers)} recyclers")
                
            except Exception as geo_error:
                # Fallback: Get all active recyclers and filter by distance manually
                logger.warning(f"Geospatial query failed: {geo_error}. Using fallback method.")
                
                recyclers_cursor = recyclers_collection.find({"is_active": True})
                all_recyclers = await recyclers_cursor.to_list(length=100)
                
                logger.info(f"Found {len(all_recyclers)} active recyclers in database")
                
                # Filter by distance manually
                recyclers = []
                for rec in all_recyclers:
                    if "location" in rec and "coordinates" in rec["location"]:
                        rec_lon, rec_lat = rec["location"]["coordinates"]
                        # Simple distance check (approximate)
                        distance_km = self._haversine_distance(
                            user_lat, user_lon, rec_lat, rec_lon
                        )
                        if distance_km <= 20:
                            recyclers.append(rec)
                
                logger.info(f"After distance filter: {len(recyclers)} recyclers within 20km")
            
            if not recyclers:
                logger.warning("No recyclers found nearby")
                return []
            
            # Score each recycler
            scored_recyclers = []
            
            for rec in recyclers:
                score_data = await self._score_recycler(
                    recycler=rec,
                    user_lat=user_lat,
                    user_lon=user_lon,
                    material=material,
                    weight_kg=weight_kg,
                    ward=ward
                )
                
                if score_data:
                    scored_recyclers.append(score_data)
            
            # Sort by total score (scored_recyclers contains dicts)
            scored_recyclers.sort(key=lambda x: x["total_score"], reverse=True)
            
            # Convert to RecyclerScore models
            results = []
            for sr in scored_recyclers[:10]:  # Top 10
                results.append(RecyclerScore(**sr))
            
            logger.info(f"Ranked {len(results)} recyclers successfully")
            return results
            
        except Exception as e:
            logger.error(f"Failed to rank recyclers: {e}")
            return []
    
    async def _score_recycler(
        self,
        recycler: Dict,
        user_lat: float,
        user_lon: float,
        material: str,
        weight_kg: float,
        ward: Optional[str]
    ) -> Optional[Dict]:
        """Score a single recycler"""
        try:
            rec_lon, rec_lat = recycler["location"]["coordinates"]
            
            # 1. Distance score (use OSRM for route)
            route = await osm_service.get_route(user_lon, user_lat, rec_lon, rec_lat)
            distance_km = route["distance_km"]
            duration_min = route["duration_min"]
            
            # Normalize distance (closer is better)
            distance_score = max(0, 1 - (distance_km / 20))  # 20km max
            
            # 2. Material acceptance score
            materials_accepted = recycler.get("materials_accepted", [])
            material_accept_score = 0.0
            material_rate = 0.0
            
            # Handle both formats: list of strings OR list of dicts
            if materials_accepted:
                # Check if it's a list of strings (simple format from seed data)
                if isinstance(materials_accepted[0], str):
                    # Simple format: ["PET", "HDPE", "Paper"]
                    if material in materials_accepted:
                        material_accept_score = 1.0
                        # Use default rate or price multiplier
                        from app.config import settings
                        base_rate = settings.MATERIAL_RATES.get(material, 5.0)
                        price_multiplier = recycler.get("price_multiplier", 1.0)
                        material_rate = base_rate * price_multiplier
                else:
                    # Complex format: [{"material": "PET", "accepts": true, "rate_per_kg": 12}]
                    for mat in materials_accepted:
                        if mat.get("material") == material and mat.get("accepts", False):
                            material_accept_score = 1.0
                            material_rate = mat.get("rate_per_kg", 0.0)
                            
                            # Check weight limits
                            min_weight = mat.get("min_weight_kg", 0)
                            max_weight = mat.get("max_weight_kg", 1000)
                            
                            if weight_kg < min_weight or weight_kg > max_weight:
                                material_accept_score = 0.5  # Partial score
                            
                            break
            
            # Skip if doesn't accept material
            if material_accept_score == 0:
                return None
            
            # 3. Capacity score
            current_capacity = recycler.get("current_capacity_kg", 0)
            max_capacity = recycler.get("max_capacity_kg", 1000)
            utilization = current_capacity / max_capacity if max_capacity > 0 else 0
            capacity_score = max(0, 1 - utilization)  # Less utilized is better
            
            # 4. Price score
            from app.config import settings
            base_rate = settings.MATERIAL_RATES.get(material, 5.0)
            price_ratio = material_rate / base_rate if base_rate > 0 else 1.0
            price_score = min(1.0, price_ratio)  # Higher rate is better
            
            # 5. Road accessibility
            road_accessibility_score = recycler.get("road_accessibility_score", 0.7)
            
            # 6. Catchment zone match
            catchment_wards = recycler.get("catchment_wards", [])
            catchment_match = 1.0 if (not catchment_wards or ward in catchment_wards) else 0.5
            
            # Weighted combination
            w1, w2, w3, w4, w5, w6 = 0.3, 0.25, 0.15, 0.1, 0.1, 0.1
            
            total_score = (
                w1 * distance_score +
                w2 * material_accept_score +
                w3 * capacity_score +
                w4 * price_score +
                w5 * road_accessibility_score +
                w6 * catchment_match
            )
            
            return {
                "recycler_id": str(recycler["_id"]),
                "recycler_name": recycler.get("name", "Unknown"),
                "distance_km": distance_km,
                "distance_score": distance_score,
                "material_accept_score": material_accept_score,
                "capacity_score": capacity_score,
                "price_score": price_score,
                "road_accessibility_score": road_accessibility_score,
                "catchment_zone_match": catchment_match,
                "total_score": total_score,
                "location": recycler["location"],
                "estimated_travel_time_min": duration_min,
                "estimated_distance_km": distance_km,
                "route_summary": f"{distance_km:.1f}km, ~{duration_min:.0f} minutes"
            }
            
        except Exception as e:
            logger.error(f"Failed to score recycler: {e}")
            return None
    
    async def schedule_pickup(
        self,
        user_id: str,
        recycler_id: str,
        pickup_lat: float,
        pickup_lon: float,
        pickup_address: str,
        scheduled_date: datetime,
        scheduled_time_slot: str,
        materials: List[str],
        estimated_weight_kg: float,
        contact_phone: str,
        special_instructions: Optional[str] = None,
        scan_id: Optional[str] = None
    ) -> Dict:
        """Schedule a pickup"""
        try:
            # Calculate route
            recyclers_collection = get_recyclers_collection()
            recycler = await recyclers_collection.find_one({"_id": ObjectId(recycler_id)})
            
            if not recycler:
                raise ValueError("Recycler not found")
            
            rec_lon, rec_lat = recycler["location"]["coordinates"]
            route = await osm_service.get_route(pickup_lon, pickup_lat, rec_lon, rec_lat)
            
            # Create pickup
            pickup = PickupScheduleModel(
                user_id=ObjectId(user_id),
                recycler_id=ObjectId(recycler_id),
                scan_id=ObjectId(scan_id) if scan_id else None,
                pickup_location={
                    "type": "Point",
                    "coordinates": [pickup_lon, pickup_lat]
                },
                pickup_address=pickup_address,
                scheduled_date=scheduled_date,
                scheduled_time_slot=scheduled_time_slot,
                materials=materials,
                estimated_weight_kg=estimated_weight_kg,
                contact_phone=contact_phone,
                special_instructions=special_instructions,
                route_distance_km=route["distance_km"],
                route_duration_min=route["duration_min"]
            )
            
            # Insert into database
            pickups_collection = get_pickups_collection()
            result = await pickups_collection.insert_one(
                pickup.model_dump(by_alias=True, exclude=["id"])
            )
            
            pickup_id = str(result.inserted_id)
            
            logger.info(f"Scheduled pickup {pickup_id} for user {user_id}")
            
            return {
                "pickup_id": pickup_id,
                "status": "scheduled",
                "recycler_name": recycler.get("name"),
                "scheduled_date": scheduled_date.isoformat(),
                "time_slot": scheduled_time_slot,
                "route_distance_km": route["distance_km"],
                "route_duration_min": route["duration_min"]
            }
            
        except Exception as e:
            logger.error(f"Failed to schedule pickup: {e}")
            raise
    
    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two points using Haversine formula
        Returns distance in kilometers
        """
        import math
        
        R = 6371  # Earth radius in km
        
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        
        a = (math.sin(dlat / 2) ** 2 + 
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c


# Global marketplace service instance
marketplace_service = MarketplaceService()

