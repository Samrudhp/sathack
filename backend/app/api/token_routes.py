"""
Token redemption API endpoints
"""
from fastapi import APIRouter, HTTPException, Form
import logging

from app.tokens.token_service import token_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/user/redeem_token")
async def redeem_token(
    user_id: str = Form(...),
    token_id: str = Form(...)
):
    """
    User redeems a token to add credits to wallet
    """
    try:
        logger.info(f"User {user_id} redeeming token {token_id}")
        
        result = await token_service.redeem_token(user_id, token_id)
        
        return {
            "success": True,
            **result
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Token redemption failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
