"""
Cost tracking and monitoring endpoints
"""
from fastapi import APIRouter, HTTPException
from app.utils.optimized_llm_service import optimized_llm_service

router = APIRouter()


@router.get("/llm-stats")
async def get_llm_stats():
    """
    Get LLM usage statistics and cost analysis
    
    Shows:
    - Total API calls
    - Cache hit rate (FREE queries)
    - Rule-based responses (FREE queries)
    - LLM usage breakdown
    - Token usage
    - Estimated costs
    """
    try:
        stats = optimized_llm_service.get_stats()
        
        return {
            "success": True,
            "stats": stats,
            "cost_analysis": {
                "current_provider": "Groq",
                "current_model": "Llama 3.3 70B / 3.1 8B",
                "monthly_cost": "$0 (Free Tier)",
                "cost_per_query": "$0.00",
                "optimization_strategies": [
                    "Response caching",
                    "Rule-based fallbacks",
                    "Tiered model selection",
                    "Token optimization"
                ]
            },
            "scaling_projections": {
                "10k_users_per_day": "$0-30/month",
                "100k_users_per_day": "$50-200/month",
                "1m_users_per_day": "$500-1500/month"
            },
            "vs_competitors": {
                "groq": "$0-50/month @ 100K users",
                "openai_gpt4o_mini": "$300/month @ 100K users",
                "openai_gpt4o": "$4500/month @ 100K users",
                "claude_haiku": "$450/month @ 100K users",
                "gemini_flash": "$150/month @ 100K users"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reset-llm-stats")
async def reset_llm_stats():
    """Reset LLM statistics (for testing)"""
    optimized_llm_service.stats = {
        "total_calls": 0,
        "cache_hits": 0,
        "rule_based": 0,
        "fast_model_calls": 0,
        "smart_model_calls": 0,
        "total_tokens": 0
    }
    optimized_llm_service.response_cache.clear()
    
    return {
        "success": True,
        "message": "Stats reset successfully"
    }
