"""
MongoDB database connection and initialization
"""
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING, GEOSPHERE
from typing import Optional
import logging
from app.config import settings

logger = logging.getLogger(__name__)


class Database:
    """MongoDB database manager"""
    
    client: Optional[AsyncIOMotorClient] = None
    db = None
    
    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB"""
        try:
            cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
            cls.db = cls.client[settings.MONGODB_DB_NAME]
            
            # Test connection
            await cls.client.admin.command('ping')
            logger.info(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")
            
            # Create indexes
            await cls.create_indexes()
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            logger.info("Closed MongoDB connection")
    
    @classmethod
    async def create_indexes(cls):
        """Create necessary indexes for all collections"""
        try:
            # Users
            await cls.db.users.create_index([("phone", ASCENDING)], unique=True)
            await cls.db.users.create_index([("location", GEOSPHERE)])
            await cls.db.users.create_index([("created_at", DESCENDING)])
            
            # Recyclers
            await cls.db.recyclers.create_index([("phone", ASCENDING)], unique=True)
            await cls.db.recyclers.create_index([("location", GEOSPHERE)])
            await cls.db.recyclers.create_index([("is_active", ASCENDING)])
            await cls.db.recyclers.create_index([("catchment_wards", ASCENDING)])
            
            # Wallets
            await cls.db.wallets.create_index([("user_id", ASCENDING)], unique=True)
            
            # Pending Items
            await cls.db.pending_items.create_index([("user_id", ASCENDING)])
            await cls.db.pending_items.create_index([("status", ASCENDING)])
            await cls.db.pending_items.create_index([("location", GEOSPHERE)])
            await cls.db.pending_items.create_index([("created_at", DESCENDING)])
            await cls.db.pending_items.create_index([("image_hash", ASCENDING)])
            
            # Completed Scans
            await cls.db.completed_scans.create_index([("user_id", ASCENDING)])
            await cls.db.completed_scans.create_index([("recycler_id", ASCENDING)])
            await cls.db.completed_scans.create_index([("location", GEOSPHERE)])
            await cls.db.completed_scans.create_index([("completed_at", DESCENDING)])
            
            # Tokens
            await cls.db.tokens.create_index([("token_id", ASCENDING)], unique=True)
            await cls.db.tokens.create_index([("user_id", ASCENDING)])
            await cls.db.tokens.create_index([("status", ASCENDING)])
            await cls.db.tokens.create_index([("expires_at", ASCENDING)])
            
            # Token Redemptions
            await cls.db.token_redemptions.create_index([("token_id", ASCENDING)])
            await cls.db.token_redemptions.create_index([("user_id", ASCENDING)])
            await cls.db.token_redemptions.create_index([("redeemed_at", DESCENDING)])
            
            # Recycler Submissions
            await cls.db.recycler_submissions.create_index([("recycler_id", ASCENDING)])
            await cls.db.recycler_submissions.create_index([("scan_id", ASCENDING)])
            await cls.db.recycler_submissions.create_index([("submitted_at", DESCENDING)])
            
            # RAG Global
            await cls.db.rag_global.create_index([("category", ASCENDING)])
            await cls.db.rag_global.create_index([("tags", ASCENDING)])
            await cls.db.rag_global.create_index([("city", ASCENDING)])
            await cls.db.rag_global.create_index([("embedding_id", ASCENDING)])
            
            # RAG Personal
            await cls.db.rag_personal.create_index([("user_id", ASCENDING)])
            await cls.db.rag_personal.create_index([("doc_type", ASCENDING)])
            await cls.db.rag_personal.create_index([("embedding_id", ASCENDING)])
            
            # User Behavior
            await cls.db.user_behavior.create_index([("user_id", ASCENDING)], unique=True)
            
            # Pickups
            await cls.db.pickups.create_index([("user_id", ASCENDING)])
            await cls.db.pickups.create_index([("recycler_id", ASCENDING)])
            await cls.db.pickups.create_index([("status", ASCENDING)])
            await cls.db.pickups.create_index([("scheduled_date", ASCENDING)])
            await cls.db.pickups.create_index([("pickup_location", GEOSPHERE)])
            
            # Impact Stats
            await cls.db.impact_stats.create_index([
                ("scope", ASCENDING),
                ("scope_id", ASCENDING),
                ("period", ASCENDING),
                ("date", DESCENDING)
            ])
            
            # Heatmap Tiles
            await cls.db.heatmap_tiles.create_index([("tile_id", ASCENDING)], unique=True)
            await cls.db.heatmap_tiles.create_index([("zoom", ASCENDING)])
            
            # Fraud Checks
            await cls.db.fraud_checks.create_index([("scan_id", ASCENDING)])
            await cls.db.fraud_checks.create_index([("user_id", ASCENDING)])
            await cls.db.fraud_checks.create_index([("is_suspicious", ASCENDING)])
            
            logger.info("Created all MongoDB indexes")
            
        except Exception as e:
            logger.error(f"Failed to create indexes: {e}")
            raise


# Singleton database instance
db = Database()


# Convenience getters for collections
def get_users_collection():
    return db.db.users


def get_recyclers_collection():
    return db.db.recyclers


def get_wallets_collection():
    return db.db.wallets


def get_pending_items_collection():
    return db.db.pending_items


def get_completed_scans_collection():
    return db.db.completed_scans


def get_tokens_collection():
    return db.db.tokens


def get_token_redemptions_collection():
    return db.db.token_redemptions


def get_recycler_submissions_collection():
    return db.db.recycler_submissions


def get_rag_global_collection():
    return db.db.rag_global


def get_rag_personal_collection():
    return db.db.rag_personal


def get_user_behavior_collection():
    return db.db.user_behavior


def get_pickups_collection():
    return db.db.pickups


def get_impact_stats_collection():
    return db.db.impact_stats


def get_heatmap_tiles_collection():
    return db.db.heatmap_tiles


def get_fraud_checks_collection():
    return db.db.fraud_checks
