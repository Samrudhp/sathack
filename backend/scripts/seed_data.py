#!/usr/bin/env python3
"""
Seed sample data for ReNova backend
Populates global RAG collection with waste disposal knowledge
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import numpy as np
from datetime import datetime

# MongoDB connection
MONGODB_URL = "mongodb://localhost:27017"
DB_NAME = "renova"

# Sample global RAG documents for waste disposal
GLOBAL_RAG_SAMPLES = [
    {
        "content": "PET plastic bottles should be rinsed before disposal. Remove caps and labels. Crush to save space. Accepted by most recyclers.",
        "metadata": {"category": "plastic", "material": "PET", "source": "municipal_guidelines"},
        "embedding": None  # Will be replaced with actual embeddings
    },
    {
        "content": "HDPE containers include milk jugs and detergent bottles. Rinse thoroughly. Check for recycling symbol #2. Widely recyclable.",
        "metadata": {"category": "plastic", "material": "HDPE", "source": "municipal_guidelines"},
        "embedding": None
    },
    {
        "content": "Paper waste should be dry and clean. No food contamination. Cardboard must be flattened. Newspaper separate from glossy paper.",
        "metadata": {"category": "paper", "source": "municipal_guidelines"},
        "embedding": None
    },
    {
        "content": "Glass bottles and jars are infinitely recyclable. Separate by color: clear, green, brown. Remove metal caps. Rinse before disposal.",
        "metadata": {"category": "glass", "source": "municipal_guidelines"},
        "embedding": None
    },
    {
        "content": "Metal cans (aluminum and steel) are highly valuable. Rinse food cans. Crush aluminum cans to save space. Check for metal type.",
        "metadata": {"category": "metal", "source": "municipal_guidelines"},
        "embedding": None
    },
    {
        "content": "E-waste (electronics) contains hazardous materials. Never throw in regular trash. Take to certified e-waste recyclers. Includes phones, computers, batteries.",
        "metadata": {"category": "e-waste", "hazard": "toxic", "source": "municipal_guidelines"},
        "embedding": None
    },
    {
        "content": "Hazardous waste includes batteries, paint, chemicals, pesticides. Requires special disposal at designated centers. Never mix with regular waste.",
        "metadata": {"category": "hazardous", "hazard": "toxic", "source": "safety_guidelines"},
        "embedding": None
    },
    {
        "content": "Organic waste can be composted at home. Includes fruit peels, vegetable scraps, coffee grounds. Keep separate from inorganic waste.",
        "metadata": {"category": "organic", "source": "municipal_guidelines"},
        "embedding": None
    },
    {
        "content": "Contaminated items reduce recycling value. Oil-soaked paper cannot be recycled. Food residue on plastic reduces credit value by 20-50%.",
        "metadata": {"category": "quality", "source": "recycler_guidelines"},
        "embedding": None
    },
    {
        "content": "Recycling one ton of plastic saves 5,774 kWh of energy. Recycling aluminum saves 95% of energy compared to new production.",
        "metadata": {"category": "impact", "source": "environmental_data"},
        "embedding": None
    },
    {
        "content": "Municipal recycling centers accept PET, HDPE, paper, glass, metal. Operating hours: 9 AM - 6 PM. Closed Sundays. Minimum weight: 1 kg.",
        "metadata": {"category": "recycler_rules", "source": "municipal_rules"},
        "embedding": None
    },
    {
        "content": "Private recyclers offer higher rates but selective acceptance. PET: 12 credits/kg, Metal: 15 credits/kg. Weight verification mandatory.",
        "metadata": {"category": "recycler_rules", "source": "marketplace"},
        "embedding": None
    },
    {
        "content": "Tetra Pak cartons require special processing. Contains layers of paper, plastic, and aluminum. Not accepted by all recyclers.",
        "metadata": {"category": "mixed_material", "material": "tetra_pak", "source": "technical_guidelines"},
        "embedding": None
    },
    {
        "content": "Styrofoam (expanded polystyrene) is difficult to recycle. Takes 500+ years to decompose. Avoid usage. Limited recycler acceptance.",
        "metadata": {"category": "plastic", "material": "styrofoam", "source": "environmental_data"},
        "embedding": None
    },
    {
        "content": "Medical waste (syringes, bandages, masks) requires biohazard disposal. Never mix with household waste. Contact healthcare waste services.",
        "metadata": {"category": "hazardous", "hazard": "biohazard", "source": "safety_guidelines"},
        "embedding": None
    },
]


async def seed_global_rag():
    """Seed global RAG collection with sample documents"""
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    collection = db.rag_global
    
    print("🌱 Seeding global RAG documents...")
    
    # Clear existing documents (optional - comment out to preserve existing)
    # await collection.delete_many({})
    
    # Generate random embeddings (768-dim for CLIP compatibility)
    # In production, these would be actual CLIP embeddings
    for doc in GLOBAL_RAG_SAMPLES:
        doc["embedding"] = np.random.randn(768).astype(np.float32).tolist()
        doc["created_at"] = datetime.utcnow()
    
    # Insert documents
    result = await collection.insert_many(GLOBAL_RAG_SAMPLES)
    print(f"✅ Inserted {len(result.inserted_ids)} documents into rag_global")
    
    # Create text index for search
    await collection.create_index([("content", "text"), ("metadata.category", 1)])
    print("✅ Created text index on rag_global")
    
    client.close()


async def seed_sample_users():
    """Create sample users for testing"""
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    print("\n👤 Creating sample users...")
    
    users = [
        {
            "user_id": "user_test_001",
            "name": "Test User 1",
            "phone": "+919876543210",
            "email": "test1@renova.in",
            "language_preference": "hi",
            "location": {
                "type": "Point",
                "coordinates": [77.5946, 12.9716]  # Bangalore
            },
            "address": "Bangalore, Karnataka",
            "created_at": datetime.utcnow()
        },
        {
            "user_id": "user_test_002",
            "name": "Test User 2",
            "phone": "+919876543211",
            "email": "test2@renova.in",
            "language_preference": "en",
            "location": {
                "type": "Point",
                "coordinates": [72.8777, 19.0760]  # Mumbai
            },
            "address": "Mumbai, Maharashtra",
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.users.insert_many(users)
    print(f"✅ Created {len(users)} sample users")
    
    # Create wallets
    wallets = [
        {
            "user_id": "user_test_001",
            "balance": 0,
            "total_earned": 0,
            "total_redeemed": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "user_id": "user_test_002",
            "balance": 0,
            "total_earned": 0,
            "total_redeemed": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.wallets.insert_many(wallets)
    print(f"✅ Created {len(wallets)} wallets")
    
    client.close()


async def seed_sample_recyclers():
    """Create sample recyclers for testing"""
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    print("\n♻️  Creating sample recyclers...")
    
    recyclers = [
        {
            "recycler_id": "recycler_test_001",
            "name": "EcoGreen Recycling Center",
            "phone": "+919800012345",
            "email": "contact@ecogreen.in",
            "location": {
                "type": "Point",
                "coordinates": [77.5950, 12.9750]  # Near Bangalore
            },
            "address": "Whitefield, Bangalore",
            "materials_accepted": ["PET", "HDPE", "Paper", "Glass", "Metal"],
            "current_capacity_kg": 500,
            "max_capacity_kg": 1000,
            "price_multiplier": 1.0,
            "rating": 4.5,
            "total_collections": 150,
            "operating_hours": "9 AM - 6 PM",
            "created_at": datetime.utcnow()
        },
        {
            "recycler_id": "recycler_test_002",
            "name": "GreenTech E-Waste Solutions",
            "phone": "+919800012346",
            "email": "info@greentech.in",
            "location": {
                "type": "Point",
                "coordinates": [77.6000, 12.9700]
            },
            "address": "HSR Layout, Bangalore",
            "materials_accepted": ["E-Waste", "Metal"],
            "current_capacity_kg": 200,
            "max_capacity_kg": 500,
            "price_multiplier": 1.2,
            "rating": 4.8,
            "total_collections": 80,
            "operating_hours": "10 AM - 5 PM",
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.recyclers.insert_many(recyclers)
    print(f"✅ Created {len(recyclers)} sample recyclers")
    
    client.close()


async def main():
    """Run all seeding operations"""
    print("=" * 60)
    print("🌱 ReNova Data Seeding Script")
    print("=" * 60)
    
    await seed_global_rag()
    await seed_sample_users()
    await seed_sample_recyclers()
    
    print("\n" + "=" * 60)
    print("✅ All sample data seeded successfully!")
    print("=" * 60)
    print("\n📝 Sample user IDs:")
    print("  - user_test_001 (Hindi)")
    print("  - user_test_002 (English)")
    print("\n♻️  Sample recycler IDs:")
    print("  - recycler_test_001 (EcoGreen)")
    print("  - recycler_test_002 (GreenTech)")
    print("\n💡 You can now test API endpoints with these IDs")


if __name__ == "__main__":
    asyncio.run(main())
