"""
Scan-related API endpoints
"""
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
import logging
from datetime import datetime
import io

from app.vision.clip_service import vision_service
from app.voice.whisper_service import voice_service
from app.osm.osm_service import osm_service
from app.fusion.fusion_service import fusion_service
from app.rag.rag_service import rag_service
from app.utils.llm_service import llm_service
from app.utils.fraud_service import fraud_service
from app.services.database import (
    get_pending_items_collection,
    get_user_behavior_collection,
    get_heatmap_tiles_collection,
    get_recyclers_collection
)
from app.models.scan_models import PendingItemModel
from bson import ObjectId
import imagehash
from PIL import Image

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/scan_image")
async def scan_image(
    user_id: str = Form(...),
    image: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    query_text: Optional[str] = Form(None),
    language: str = Form("en")
):
    """
    Complete scan pipeline: Image → Vision → OSM → RAG → LLM → Output
    
    This endpoint implements the ENTIRE user intelligence pipeline.
    """
    try:
        logger.info(f"Scan image request from user {user_id}")
        
        # Read image
        image_bytes = await image.read()
        
        # ==========================================
        # STEP 1: Input Normalization
        # ==========================================
        query_en = query_text or ""
        
        if language == "hi" and query_en:
            # Translate Hindi to English
            query_en = await llm_service.translate_to_english(query_en)
        
        # ==========================================
        # STEP 2: Vision Module (CLIP)
        # ==========================================
        vision_prediction = await vision_service.zero_shot_classification(image_bytes)
        
        v_img = await vision_service.encode_image(image_bytes)
        
        material = vision_prediction["material"]
        cleanliness_score = vision_prediction["cleanliness_score"]
        hazard_class = vision_prediction["hazard_class"]
        
        logger.info(
            f"Vision: material={material}, "
            f"cleanliness={cleanliness_score}, "
            f"hazard={hazard_class}"
        )
        
        # ==========================================
        # STEP 3: OSM Context Extraction
        # ==========================================
        osm_context = await osm_service.reverse_geocode(latitude, longitude)
        road_difficulty = await osm_service.get_road_difficulty(latitude, longitude)
        nearby_recyclers_osm = await osm_service.find_nearby_recyclers(latitude, longitude)
        
        v_loc = fusion_service.create_location_features(osm_context, road_difficulty)
        
        logger.info(f"OSM: ward={osm_context.get('ward')}, nearby={len(nearby_recyclers_osm)}")
        
        # ==========================================
        # STEP 4: Personal Context
        # ==========================================
        user_behavior_collection = get_user_behavior_collection()
        user_behavior = await user_behavior_collection.find_one({"user_id": ObjectId(user_id)})
        
        recent_scans_count = len(user_behavior.get("recent_scans", [])) if user_behavior else 0
        avg_cleanliness = user_behavior.get("average_cleanliness_score", 0.0) if user_behavior else 0.0
        
        v_user = fusion_service.create_user_features(user_behavior, recent_scans_count, avg_cleanliness)
        
        # ==========================================
        # STEP 5: Time Context
        # ==========================================
        now = datetime.utcnow()
        hour = now.hour
        day_of_week = now.weekday()
        is_weekend = day_of_week >= 5
        
        v_time = fusion_service.create_time_features(hour, day_of_week, is_weekend)
        
        # ==========================================
        # STEP 6: Fusion Layer
        # ==========================================
        v_text = await vision_service.encode_text(query_en) if query_en else None
        
        v_fused = await fusion_service.fuse(
            v_img=v_img,
            v_text=v_text,
            v_loc=v_loc,
            v_user=v_user,
            v_time=v_time
        )
        
        logger.info("Fusion complete")
        
        # ==========================================
        # STEP 7: Dual-RAG Retrieval
        # ==========================================
        global_docs, personal_docs = await rag_service.dual_retrieve(
            user_id=user_id,
            query_embedding=v_fused,
            global_top_k=5,
            personal_top_k=3,
            city=osm_context.get("city")
        )
        
        logger.info(f"RAG: global={len(global_docs)}, personal={len(personal_docs)}")
        
        # ==========================================
        # STEP 8: LLM Reasoning (English only)
        # ==========================================
        # Get recycler info
        from app.marketplace.marketplace_service import marketplace_service
        
        recycler_ranking = await marketplace_service.rank_recyclers(
            user_lat=latitude,
            user_lon=longitude,
            material=material,
            weight_kg=1.0,  # Estimate
            ward=osm_context.get("ward")
        )
        
        recycler_info = [
            {
                "name": r.recycler_name,
                "distance_km": r.distance_km,
                "total_score": r.total_score
            }
            for r in recycler_ranking[:3]
        ]
        
        llm_response = await llm_service.reason_about_waste(
            query=query_en or f"How to dispose {material}?",
            vision_labels=vision_prediction,
            osm_context=osm_context,
            global_docs=global_docs,
            personal_docs=personal_docs,
            recycler_info=recycler_info,
            material=material,
            weight_estimate=1.0
        )
        
        logger.info("LLM reasoning complete")
        
        # ==========================================
        # STEP 9: Final Output Translation
        # ==========================================
        output_text = llm_response.get("disposal_instruction", "")
        
        if language == "hi":
            output_text = await llm_service.translate_to_hindi(output_text)
        
        # ==========================================
        # STEP 10: Backend Updates
        # ==========================================
        
        # Compute image hash
        img_hash = str(imagehash.average_hash(Image.open(io.BytesIO(image_bytes))))
        
        # Create pending item
        pending_item = PendingItemModel(
            user_id=ObjectId(user_id),
            image_hash=img_hash,
            query_text=query_text,
            query_language=language,
            location={
                "type": "Point",
                "coordinates": [longitude, latitude]
            },
            osm_context=osm_context,
            vision_prediction=vision_prediction,
            llm_response=llm_response,
            scan_hour=hour,
            scan_day=now.strftime("%A")
        )
        
        pending_collection = get_pending_items_collection()
        result = await pending_collection.insert_one(
            pending_item.model_dump(by_alias=True, exclude=["id"])
        )
        scan_id = str(result.inserted_id)
        
        # Update heatmap
        zoom, x, y = osm_service.lat_lon_to_tile(latitude, longitude, zoom=15)
        tile_id = f"{zoom}_{x}_{y}"
        
        heatmap_collection = get_heatmap_tiles_collection()
        await heatmap_collection.update_one(
            {"tile_id": tile_id},
            {
                "$inc": {"scan_count": 1},
                "$setOnInsert": {
                    "zoom": zoom,
                    "x": x,
                    "y": y,
                    "bbox": osm_service.tile_to_bbox(zoom, x, y)
                },
                "$set": {"updated_at": datetime.utcnow()}
            },
            upsert=True
        )
        
        logger.info(f"Scan {scan_id} completed successfully")
        
        # ==========================================
        # Return Response with Full Recycler Details
        # ==========================================
        
        # Fetch full recycler details from DB
        recyclers_collection = get_recyclers_collection()
        recycler_response = []
        
        for r in recycler_ranking[:3]:
            # Get full recycler document
            recycler_doc = await recyclers_collection.find_one({"_id": ObjectId(r.recycler_id)})
            
            if recycler_doc:
                recycler_response.append({
                    "recycler_id": r.recycler_id,
                    "name": r.recycler_name,
                    "phone": recycler_doc.get("phone"),
                    "address": recycler_doc.get("address"),
                    "distance_km": r.distance_km,
                    "estimated_travel_time_min": r.estimated_travel_time_min,
                    "total_score": r.total_score,
                    "rating": recycler_doc.get("rating"),
                    "operating_hours": recycler_doc.get("operating_hours"),
                    "materials_accepted": recycler_doc.get("materials_accepted", []),
                    "location": {
                        "type": r.location.type,
                        "coordinates": r.location.coordinates
                    },
                    "route_summary": r.route_summary
                })
        
        return {
            "scan_id": scan_id,
            "material": material,
            "confidence": vision_prediction["confidence"],
            "cleanliness_score": cleanliness_score,
            "hazard_class": hazard_class,
            "disposal_instruction": output_text,
            "hazard_notes": llm_response.get("hazard_notes"),
            "cleaning_recommendation": llm_response.get("cleaning_recommendation"),
            "estimated_credits": llm_response.get("estimated_credits", 0),
            "environmental_impact": {
                "co2_saved_kg": llm_response.get("co2_saved_kg", 0),
                "water_saved_liters": llm_response.get("water_saved_liters", 0),
                "landfill_saved_kg": llm_response.get("landfill_saved_kg", 0)
            },
            "recycler_ranking": recycler_response,
            "pickup_suggestions": llm_response.get("pickup_suggestions", []),
            "citations": llm_response.get("citations", []),
            "language": language
        }
        
    except Exception as e:
        logger.error(f"Scan image failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/voice_input")
async def voice_input(
    user_id: str = Form(...),
    audio: UploadFile = File(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    language: Optional[str] = Form("en")
):
    """
    Process voice input → Transcribe → Text query
    """
    try:
        logger.info(f"Voice input from user {user_id}")
        
        # Read audio
        audio_bytes = await audio.read()
        
        # Transcribe
        transcription = await voice_service.transcribe_audio(audio_bytes, language)
        
        text = transcription["text"]
        detected_language = transcription["language"]
        
        logger.info(f"Transcribed: {text[:100]}... (lang={detected_language})")
        
        return {
            "text": text,
            "language": detected_language,
            "confidence": transcription["confidence"],
            "message": "Voice transcribed successfully. You can now use this text for scan or RAG query."
        }
        
    except Exception as e:
        logger.error(f"Voice input failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rag_query")
async def rag_query(
    user_id: str = Form(...),
    query: str = Form(...),
    language: str = Form("en")
):
    """
    Pure RAG query without image scan
    """
    try:
        logger.info(f"RAG query from user {user_id}: {query[:50]}...")
        
        # Translate if needed
        query_en = query
        if language == "hi":
            query_en = await llm_service.translate_to_english(query)
        
        # Encode query
        v_text = await vision_service.encode_text(query_en)
        
        # Retrieve from RAG
        global_docs, personal_docs = await rag_service.dual_retrieve(
            user_id=user_id,
            query_embedding=v_text,
            global_top_k=5,
            personal_top_k=3
        )
        
        # Format response
        response_text = "**Global Knowledge:**\n\n"
        for i, doc in enumerate(global_docs, 1):
            response_text += f"{i}. {doc['title']}\n{doc['content'][:200]}...\n\n"
        
        if personal_docs:
            response_text += "\n**Your History:**\n\n"
            for doc in personal_docs:
                response_text += f"- {doc['content'][:150]}...\n"
        
        # Translate if needed
        if language == "hi":
            response_text = await llm_service.translate_to_hindi(response_text)
        
        return {
            "response": response_text,
            "global_docs_count": len(global_docs),
            "personal_docs_count": len(personal_docs),
            "language": language
        }
        
    except Exception as e:
        logger.error(f"RAG query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
