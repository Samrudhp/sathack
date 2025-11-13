"""
LLM service using OpenAI for English reasoning
"""
import openai
import logging
from typing import List, Dict, Optional
import json

from app.config import settings

logger = logging.getLogger(__name__)


class LLMService:
    """OpenAI LLM service for waste intelligence reasoning"""
    
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        self.model = "gpt-4"  # or "gpt-3.5-turbo"
    
    async def reason_about_waste(
        self,
        query: str,
        vision_labels: Dict,
        osm_context: Dict,
        global_docs: List[Dict],
        personal_docs: List[Dict],
        recycler_info: Optional[List[Dict]] = None,
        material: str = "",
        weight_estimate: float = 0.0
    ) -> Dict:
        """
        Use LLM to reason about waste disposal, hazards, and recommendations
        
        Returns comprehensive response with all required fields
        """
        try:
            # Build comprehensive prompt
            prompt = self._build_prompt(
                query=query,
                vision_labels=vision_labels,
                osm_context=osm_context,
                global_docs=global_docs,
                personal_docs=personal_docs,
                recycler_info=recycler_info,
                material=material,
                weight_estimate=weight_estimate
            )
            
            # Call OpenAI
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert waste management AI assistant. "
                                 "Provide clear, actionable advice on waste disposal, "
                                 "recycling, and environmental impact. Always respond in English."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            # Parse response
            llm_text = response.choices[0].message.content
            
            # Parse structured output
            parsed = self._parse_llm_response(llm_text, vision_labels, material, weight_estimate)
            
            return parsed
            
        except Exception as e:
            logger.error(f"LLM reasoning failed: {e}")
            # Return fallback response
            return self._fallback_response(material, weight_estimate)
    
    def _build_prompt(
        self,
        query: str,
        vision_labels: Dict,
        osm_context: Dict,
        global_docs: List[Dict],
        personal_docs: List[Dict],
        recycler_info: Optional[List[Dict]],
        material: str,
        weight_estimate: float
    ) -> str:
        """Build comprehensive prompt for LLM"""
        
        prompt_parts = []
        
        # User query
        prompt_parts.append(f"## User Query\n{query}\n")
        
        # Vision analysis
        prompt_parts.append(f"## Vision Analysis")
        prompt_parts.append(f"Material detected: {vision_labels.get('material', 'Unknown')}")
        prompt_parts.append(f"Confidence: {vision_labels.get('confidence', 0):.2f}")
        prompt_parts.append(f"Cleanliness score: {vision_labels.get('cleanliness_score', 0)}/100")
        
        hazard = vision_labels.get('hazard_class')
        if hazard:
            prompt_parts.append(f"⚠️ HAZARD DETECTED: {hazard}")
        prompt_parts.append("")
        
        # Location context
        prompt_parts.append(f"## Location Context")
        prompt_parts.append(f"City: {osm_context.get('city', 'Unknown')}")
        prompt_parts.append(f"Ward: {osm_context.get('ward', 'Unknown')}")
        prompt_parts.append(f"Nearby recyclers: {len(osm_context.get('nearby_recyclers', []))}")
        prompt_parts.append("")
        
        # Global knowledge
        if global_docs:
            prompt_parts.append(f"## Municipal Rules & Guidelines")
            for i, doc in enumerate(global_docs[:3], 1):
                prompt_parts.append(f"{i}. {doc.get('title', '')}")
                prompt_parts.append(f"   {doc.get('content', '')[:200]}...")
            prompt_parts.append("")
        
        # Personal history
        if personal_docs:
            prompt_parts.append(f"## User's Past Behavior")
            for doc in personal_docs[:2]:
                prompt_parts.append(f"- {doc.get('content', '')}")
            prompt_parts.append("")
        
        # Recycler options
        if recycler_info:
            prompt_parts.append(f"## Available Recyclers")
            for rec in recycler_info[:3]:
                prompt_parts.append(
                    f"- {rec.get('name', 'Unknown')}: "
                    f"{rec.get('distance_km', 0):.1f}km away, "
                    f"score: {rec.get('total_score', 0):.2f}"
                )
            prompt_parts.append("")
        
        # Instructions
        prompt_parts.append(f"## Your Task")
        prompt_parts.append(
            f"Based on the above information, provide comprehensive waste disposal guidance. "
            f"Structure your response as follows:\n"
            f"\n"
            f"1. **Disposal Instructions**: Step-by-step guide on how to properly dispose of this item.\n"
            f"2. **Hazard Notes**: Any safety warnings or special handling requirements.\n"
            f"3. **Cleaning Recommendations**: How to prepare the item for recycling.\n"
            f"4. **Recycler Ranking**: Brief evaluation of the best recycler options.\n"
            f"5. **Route Summary**: Transportation and logistics suggestions.\n"
            f"6. **Estimated Credits**: Token/credits the user can expect (base rate × weight × cleanliness/100).\n"
            f"7. **Environmental Impact**: CO₂, water, and landfill savings.\n"
            f"8. **Pickup Suggestions**: When and how to schedule pickup.\n"
            f"9. **Citations**: Reference which rules/guidelines you used.\n"
        )
        
        return "\n".join(prompt_parts)
    
    def _parse_llm_response(
        self,
        llm_text: str,
        vision_labels: Dict,
        material: str,
        weight_estimate: float
    ) -> Dict:
        """Parse LLM response into structured format"""
        
        # Extract sections (basic parsing)
        sections = {
            "disposal_instruction": "",
            "hazard_notes": "",
            "cleaning_recommendation": "",
            "recycler_ranking": [],
            "route_summary": "",
            "estimated_credits": 0,
            "co2_saved_kg": 0.0,
            "water_saved_liters": 0.0,
            "landfill_saved_kg": 0.0,
            "pickup_suggestions": [],
            "citations": []
        }
        
        # Simple section extraction
        lines = llm_text.split('\n')
        current_section = None
        
        for line in lines:
            line_lower = line.lower()
            
            if 'disposal' in line_lower and 'instruction' in line_lower:
                current_section = 'disposal_instruction'
            elif 'hazard' in line_lower:
                current_section = 'hazard_notes'
            elif 'cleaning' in line_lower:
                current_section = 'cleaning_recommendation'
            elif 'recycler' in line_lower:
                current_section = 'recycler_ranking'
            elif 'route' in line_lower:
                current_section = 'route_summary'
            elif 'pickup' in line_lower:
                current_section = 'pickup_suggestions'
            elif 'citation' in line_lower:
                current_section = 'citations'
            elif current_section and line.strip():
                if isinstance(sections[current_section], list):
                    sections[current_section].append(line.strip())
                else:
                    sections[current_section] += line.strip() + " "
        
        # Calculate impact (use formulas)
        from app.impact.impact_service import impact_service
        
        if weight_estimate > 0:
            sections["estimated_credits"] = impact_service.calculate_credits(
                material, weight_estimate, vision_labels.get('cleanliness_score', 70)
            )
            sections["co2_saved_kg"] = impact_service.calculate_co2_saved(material, weight_estimate)
            sections["water_saved_liters"] = impact_service.calculate_water_saved(material, weight_estimate)
            sections["landfill_saved_kg"] = impact_service.calculate_landfill_saved(material, weight_estimate)
        
        return sections
    
    def _fallback_response(self, material: str, weight_estimate: float) -> Dict:
        """Fallback response if LLM fails"""
        
        from app.impact.impact_service import impact_service
        
        return {
            "disposal_instruction": f"Please bring your {material} item to the nearest recycling center. "
                                  f"Ensure it is clean and dry before disposal.",
            "hazard_notes": "Follow standard safety precautions.",
            "cleaning_recommendation": "Rinse the item with water and let it dry.",
            "recycler_ranking": [],
            "route_summary": "Check nearby recyclers for the best route.",
            "estimated_credits": impact_service.calculate_credits(material, weight_estimate, 70),
            "co2_saved_kg": impact_service.calculate_co2_saved(material, weight_estimate),
            "water_saved_liters": impact_service.calculate_water_saved(material, weight_estimate),
            "landfill_saved_kg": impact_service.calculate_landfill_saved(material, weight_estimate),
            "pickup_suggestions": ["Schedule pickup during weekday mornings for best availability"],
            "citations": []
        }
    
    async def translate_to_hindi(self, english_text: str) -> str:
        """
        Translate English text to Hindi using OpenAI
        """
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a translator. Translate the following English text to Hindi. "
                                 "Provide ONLY the Hindi translation, nothing else."
                    },
                    {
                        "role": "user",
                        "content": english_text
                    }
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            hindi_text = response.choices[0].message.content.strip()
            return hindi_text
            
        except Exception as e:
            logger.error(f"Translation to Hindi failed: {e}")
            return english_text  # Return English if translation fails
    
    async def translate_to_english(self, hindi_text: str) -> str:
        """
        Translate Hindi text to English using OpenAI
        """
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a translator. Translate the following Hindi text to English. "
                                 "Provide ONLY the English translation, nothing else."
                    },
                    {
                        "role": "user",
                        "content": hindi_text
                    }
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            english_text = response.choices[0].message.content.strip()
            return english_text
            
        except Exception as e:
            logger.error(f"Translation to English failed: {e}")
            return hindi_text  # Return original if translation fails


# Global LLM service instance
llm_service = LLMService()
