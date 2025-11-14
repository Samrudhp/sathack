"""
OpenStreetMap utilities for geospatial operations
"""
import httpx
import logging
from typing import Optional, List, Dict, Tuple, Any
import asyncio
import math

from app.config import settings

logger = logging.getLogger(__name__)


class OSMService:
    """OpenStreetMap integration service"""
    
    def __init__(self):
        self.nominatim_url = settings.NOMINATIM_URL
        self.overpass_url = settings.OVERPASS_URL
        self.osrm_url = settings.OSRM_URL
        
        # User agent for Nominatim (required)
        self.headers = {
            "User-Agent": "ReNova/1.0 (waste-intelligence-system)"
        }
    
    async def reverse_geocode(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Reverse geocode coordinates to address
        
        Returns:
            {
                "address": str,
                "ward": str,
                "pincode": str,
                "locality": str,
                "city": str,
                "state": str
            }
        """
        try:
            url = f"{self.nominatim_url}/reverse"
            params = {
                "lat": lat,
                "lon": lon,
                "format": "json",
                "addressdetails": 1
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, headers=self.headers)
                response.raise_for_status()
                data = response.json()
            
            address_parts = data.get("address", {})
            
            return {
                "address": data.get("display_name", ""),
                "ward": address_parts.get("suburb", address_parts.get("neighbourhood", "")),
                "pincode": address_parts.get("postcode", ""),
                "locality": address_parts.get("locality", address_parts.get("village", "")),
                "city": address_parts.get("city", address_parts.get("town", "")),
                "state": address_parts.get("state", ""),
                "country": address_parts.get("country", "")
            }
            
        except Exception as e:
            logger.error(f"Reverse geocoding failed: {e}")
            return {
                "address": "",
                "ward": "",
                "pincode": "",
                "locality": "",
                "city": "",
                "state": ""
            }
    
    async def find_nearby_recyclers(
        self, 
        lat: float, 
        lon: float, 
        radius_m: int = 5000
    ) -> List[Dict[str, Any]]:
        """
        Find nearby recycling facilities using Overpass API
        
        Args:
            lat, lon: Center coordinates
            radius_m: Search radius in meters
        
        Returns:
            List of POIs with coordinates and metadata
        """
        try:
            # Overpass query for recycling facilities
            query = f"""
            [out:json];
            (
              node["amenity"="recycling"](around:{radius_m},{lat},{lon});
              node["shop"="waste"](around:{radius_m},{lat},{lon});
              node["amenity"="waste_disposal"](around:{radius_m},{lat},{lon});
            );
            out body;
            """
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.overpass_url,
                    data={"data": query}
                )
                response.raise_for_status()
                data = response.json()
            
            # Parse results
            recyclers = []
            for element in data.get("elements", []):
                if element.get("type") == "node":
                    recyclers.append({
                        "osm_id": element.get("id"),
                        "lat": element.get("lat"),
                        "lon": element.get("lon"),
                        "name": element.get("tags", {}).get("name", "Unnamed"),
                        "type": element.get("tags", {}).get("amenity") or element.get("tags", {}).get("shop"),
                        "tags": element.get("tags", {})
                    })
            
            return recyclers
            
        except Exception as e:
            logger.error(f"Failed to find nearby recyclers: {e}")
            return []
    
    async def get_route(
        self, 
        start_lon: float, 
        start_lat: float,
        end_lon: float,
        end_lat: float
    ) -> Dict[str, Any]:
        """
        Calculate route using OSRM
        
        Returns:
            {
                "distance_m": float,
                "duration_s": float,
                "geometry": str (optional)
            }
        """
        try:
            url = f"{self.osrm_url}/route/v1/driving/{start_lon},{start_lat};{end_lon},{end_lat}"
            params = {
                "overview": "false",
                "steps": "false"
            }
            
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                # Check if response has content before parsing JSON
                if not response.text or response.text.strip() == "":
                    logger.warning("OSRM returned empty response, using haversine fallback")
                    return await self._haversine_route(start_lat, start_lon, end_lat, end_lon)
                
                try:
                    data = response.json()
                except Exception as json_err:
                    logger.warning(f"OSRM returned invalid JSON: {json_err}, using haversine fallback")
                    return await self._haversine_route(start_lat, start_lon, end_lat, end_lon)
            
            if data.get("code") == "Ok" and data.get("routes"):
                route = data["routes"][0]
                return {
                    "distance_m": route.get("distance", 0),
                    "duration_s": route.get("duration", 0),
                    "distance_km": round(route.get("distance", 0) / 1000, 2),
                    "duration_min": round(route.get("duration", 0) / 60, 1)
                }
            
            # Fallback to haversine distance
            return await self._haversine_route(start_lat, start_lon, end_lat, end_lon)
            
        except Exception as e:
            logger.error(f"OSRM routing failed: {e}")
            # Fallback to haversine
            return await self._haversine_route(start_lat, start_lon, end_lat, end_lon)
    
    async def _haversine_route(
        self, 
        lat1: float, lon1: float, 
        lat2: float, lon2: float
    ) -> Dict[str, Any]:
        """Fallback route calculation using haversine formula"""
        # Haversine formula
        R = 6371  # Earth radius in km
        
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        
        a = (math.sin(dlat / 2) ** 2 + 
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        distance_km = R * c
        distance_m = distance_km * 1000
        
        # Estimate duration (assume 30 km/h average)
        duration_s = (distance_km / 30) * 3600
        
        return {
            "distance_m": distance_m,
            "duration_s": duration_s,
            "distance_km": round(distance_km, 2),
            "duration_min": round(duration_s / 60, 1)
        }
    
    async def get_road_difficulty(
        self, 
        lat: float, 
        lon: float
    ) -> float:
        """
        Estimate road difficulty/accessibility at location
        
        Returns:
            Score from 0-1 (1 = easy access, 0 = difficult)
        """
        try:
            # Query nearby roads
            query = f"""
            [out:json];
            way["highway"](around:100,{lat},{lon});
            out tags;
            """
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    self.overpass_url,
                    data={"data": query}
                )
                data = response.json()
            
            # Analyze road types
            roads = data.get("elements", [])
            if not roads:
                return 0.5  # Unknown
            
            # Score based on road type
            best_score = 0.0
            for road in roads:
                highway_type = road.get("tags", {}).get("highway", "")
                score = self._road_type_score(highway_type)
                best_score = max(best_score, score)
            
            return best_score
            
        except Exception as e:
            logger.error(f"Failed to get road difficulty: {e}")
            return 0.7  # Default moderate access
    
    def _road_type_score(self, highway_type: str) -> float:
        """Map OSM highway type to accessibility score"""
        scores = {
            "motorway": 1.0,
            "trunk": 1.0,
            "primary": 0.95,
            "secondary": 0.9,
            "tertiary": 0.85,
            "unclassified": 0.8,
            "residential": 0.85,
            "service": 0.75,
            "track": 0.4,
            "path": 0.2,
            "footway": 0.1,
        }
        return scores.get(highway_type, 0.5)
    
    def lat_lon_to_tile(
        self, 
        lat: float, 
        lon: float, 
        zoom: int = 15
    ) -> Tuple[int, int, int]:
        """
        Convert lat/lon to tile coordinates (for heatmap)
        
        Returns:
            (zoom, x, y)
        """
        lat_rad = math.radians(lat)
        n = 2.0 ** zoom
        
        x = int((lon + 180.0) / 360.0 * n)
        y = int((1.0 - math.log(math.tan(lat_rad) + (1 / math.cos(lat_rad))) / math.pi) / 2.0 * n)
        
        return (zoom, x, y)
    
    def tile_to_bbox(
        self, 
        zoom: int, 
        x: int, 
        y: int
    ) -> List[float]:
        """
        Convert tile coordinates to bounding box
        
        Returns:
            [min_lon, min_lat, max_lon, max_lat]
        """
        n = 2.0 ** zoom
        
        min_lon = x / n * 360.0 - 180.0
        max_lon = (x + 1) / n * 360.0 - 180.0
        
        min_lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * (y + 1) / n)))
        max_lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * y / n)))
        
        min_lat = math.degrees(min_lat_rad)
        max_lat = math.degrees(max_lat_rad)
        
        return [min_lon, min_lat, max_lon, max_lat]


# Global OSM service instance
osm_service = OSMService()
