"""
LLM service using Groq for English reasoning
"""
from groq import AsyncGroq
import logging
from typing import List, Dict, Optional
import json

from app.config import settings

logger = logging.getLogger(__name__)


class LLMService:
    """Groq LLM service for waste intelligence reasoning"""
    
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.3-70b-versatile"  # Updated model (3.1 decommissioned)
    
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
            
            # Call Groq
            response = await self.client.chat.completions.create(
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
            
            # Add the full formatted response to preserve emojis and formatting
            parsed["disposal_instruction"] = llm_text  # Use full LLM response with formatting
            
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
        
        # Add detailed description if available
        detailed_desc = vision_labels.get('detailed_description')
        if detailed_desc:
            prompt_parts.append(f"What I see: {detailed_desc}")
            prompt_parts.append("")
        
        prompt_parts.append(f"Material category: {vision_labels.get('material', 'Unknown')}")
        prompt_parts.append(f"Raw detection: {vision_labels.get('raw_detection', 'N/A')}")
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
            f"Provide comprehensive waste disposal guidance. "
            f"CRITICAL: You MUST clearly separate general municipal guidelines from personalized user recommendations.\n"
            f"\n"
            f"Format your response EXACTLY like this:\n"
            f"\n"
            f"═══════════════════════════════════════════════════\n"
            f"                      SUMMARY                       \n"
            f"═══════════════════════════════════════════════════\n"
            f"\n"
            f"Material Type:          [e.g., PET Plastic]\n"
            f"Recyclable:             [Yes/No]\n"
            f"Recommended Action:     [Brief 1-2 sentence summary]\n"
            f"Best Recycler:          [User's preferred recycler or closest option]\n"
            f"Estimated Credits:      [X tokens]\n"
            f"Environmental Impact:   [Key benefit in 1 sentence]\n"
            f"\n"
            f"═══════════════════════════════════════════════════\n"
            f"\n"
            f"**1. Disposal Instructions**\n"
            f"\n"
            f"Municipal Guidelines:\n"
            f"[Use information from 'Municipal Rules & Guidelines' section above]\n"
            f"- Step 1: ...\n"
            f"- Step 2: ...\n"
            f"\n"
            f"Personalized Recommendations (Based on Your Past Behavior):\n"
            f"[Use information from 'User's Past Behavior' section above]\n"
            f"- You previously preferred...\n"
            f"- Your usual practice is...\n"
            f"\n"
            f"**2. Hazard Notes**\n"
            f"[Any safety warnings]\n"
            f"\n"
            f"**3. Cleaning Recommendations**\n"
            f"[How to prepare for recycling]\n"
            f"\n"
            f"**4. Recycler Ranking**\n"
            f"Your Preferred Recyclers: [If user has past recycler data, mention it here]\n"
            f"Nearby Options: [List available recyclers from 'Available Recyclers' section]\n"
            f"\n"
            f"**5. Route Summary**\n"
            f"[Transportation suggestions]\n"
            f"\n"
            f"**6. Estimated Credits**\n"
            f"[Token calculation]\n"
            f"\n"
            f"**7. Environmental Impact**\n"
            f"[CO₂, water, landfill savings]\n"
            f"\n"
            f"**8. Pickup Suggestions**\n"
            f"[Scheduling recommendations]\n"
            f"\n"
            f"**9. Citations**\n"
            f"[Which guidelines you referenced]\n"
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
        
        logger.info(f"Parsing LLM response (length: {len(llm_text)} chars)")
        
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
        section_content = []
        
        for line in lines:
            line_lower = line.lower().strip()
            
            # Check for section headers (look for numbered items or bold markers)
            if '1.' in line or '**disposal' in line_lower or 'disposal instruction' in line_lower:
                if current_section and section_content:
                    sections[current_section] = '\n'.join(section_content).strip()
                current_section = 'disposal_instruction'
                section_content = []
            elif '2.' in line or '**hazard' in line_lower or 'hazard note' in line_lower:
                if current_section and section_content:
                    sections[current_section] = '\n'.join(section_content).strip()
                current_section = 'hazard_notes'
                section_content = []
            elif '3.' in line or '**cleaning' in line_lower or 'cleaning recommend' in line_lower:
                if current_section and section_content:
                    sections[current_section] = '\n'.join(section_content).strip()
                current_section = 'cleaning_recommendation'
                section_content = []
            elif '4.' in line or '**recycler' in line_lower or 'recycler rank' in line_lower:
                if current_section and section_content:
                    sections[current_section] = '\n'.join(section_content).strip()
                current_section = 'recycler_ranking'
                section_content = []
            elif '5.' in line or '**route' in line_lower or 'route summary' in line_lower:
                if current_section and section_content:
                    sections[current_section] = '\n'.join(section_content).strip()
                current_section = 'route_summary'
                section_content = []
            elif current_section and line.strip() and not line.startswith('#'):
                # Add content to current section (skip header lines)
                cleaned_line = line.replace('**', '').strip()
                if cleaned_line and not cleaned_line.endswith(':'):
                    section_content.append(cleaned_line)
        
        # Save last section
        if current_section and section_content:
            # Keep as list for list fields, join for string fields
            if current_section in ['recycler_ranking', 'pickup_suggestions', 'citations']:
                sections[current_section] = section_content
            else:
                sections[current_section] = '\n'.join(section_content).strip()
        
        # Post-process sections - ensure list fields are lists
        if isinstance(sections['recycler_ranking'], str):
            # If it's a string, split by newlines and filter empty
            sections['recycler_ranking'] = [
                line.strip() for line in sections['recycler_ranking'].split('\n') 
                if line.strip() and not line.strip().startswith('#')
            ]
        
        if isinstance(sections['pickup_suggestions'], str):
            sections['pickup_suggestions'] = [
                line.strip() for line in sections['pickup_suggestions'].split('\n') 
                if line.strip() and not line.strip().startswith('#')
            ]
        
        if isinstance(sections['citations'], str):
            sections['citations'] = [
                line.strip() for line in sections['citations'].split('\n') 
                if line.strip() and not line.strip().startswith('#')
            ]
        
        # Fallback: if disposal_instruction is empty, use the entire response
        if not sections['disposal_instruction'].strip():
            logger.warning("Could not parse disposal_instruction from LLM response, using full text")
            sections['disposal_instruction'] = llm_text.strip()
        
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
        Translate English text to Hindi using local Whisper or Groq
        Note: For better translation, we use Groq's LLM
        """
        try:
            response = await self.client.chat.completions.create(
                model="llama-3.2-3b-preview",  # Updated faster model
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
        Translate Hindi text to English using Groq
        """
        try:
            response = await self.client.chat.completions.create(
                model="llama-3.2-3b-preview",  # Updated faster model
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
