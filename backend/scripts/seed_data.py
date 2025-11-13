#!/usr/bin/env python3
"""
Seed sample data for ReNova backend
Populates global RAG collection with waste disposal knowledge
"""

import asyncio
import sys
import os
from motor.motor_asyncio import AsyncIOMotorClient
import numpy as np
from datetime import datetime
from bson import ObjectId

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# MongoDB connection
MONGODB_URL = "mongodb://localhost:27017"
DB_NAME = "renova"

# Sample global RAG documents for waste disposal
GLOBAL_RAG_SAMPLES = [
    {
        "content": "PET Plastic (Polyethylene Terephthalate) - Symbol #1. Commonly found in water bottles, soda bottles, and food containers. Chemical composition: (C10H8O4)n. Recycling rate in India: 60%. Should be rinsed clean, caps removed, labels peeled off, and crushed to save 75% space. Average weight: 15-30g per bottle. Recycling saves 2.1 kg CO2 per kg. Market value: ₹12-15 per kg. Can be recycled into polyester fiber, carpets, and new bottles. Contamination reduces value by 40%.",
        "metadata": {"category": "plastic", "material": "PET", "source": "municipal_guidelines", "region": "India"},
        "embedding": None
    },
    {
        "content": "HDPE Plastic (High-Density Polyethylene) - Symbol #2. Found in milk jugs, detergent bottles, shampoo bottles, grocery bags. Chemical: (C2H4)n with density 0.93-0.97 g/cm³. Recycling rate: 45%. Rinse thoroughly to remove residue. Average bottle weight: 30-50g. Saves 1.8 kg CO2 per kg recycled. Market rate: ₹10-12 per kg. Recyclable into pipes, plastic lumber, recycling bins, and detergent bottles. Keep caps separate.",
        "metadata": {"category": "plastic", "material": "HDPE", "source": "municipal_guidelines", "region": "India"},
        "embedding": None
    },
    {
        "content": "Paper Waste - Office paper, newspapers, magazines, cardboard. Average office paper: 80 GSM (grams per square meter). Recycling saves 1.5 kg CO2 and 50 liters water per kg. Must be dry and clean - no food contamination. Newspaper (45-50 GSM) separate from glossy paper (100-130 GSM). Market rates: White paper ₹8-10/kg, Mixed paper ₹4-6/kg. One ton recycled paper saves 17 trees. India recycles 35% of paper waste.",
        "metadata": {"category": "paper", "source": "municipal_guidelines", "region": "India"},
        "embedding": None
    },
    {
        "content": "Cardboard (Corrugated Fiberboard) - Made from kraft paper with fluted middle layer. Weight: 120-440 GSM. Must be flattened to save 80% storage space. Remove tape, staples, and plastic labels. Market value: ₹5-7 per kg. Recycling saves 1.2 kg CO2 per kg. Can be recycled 5-7 times before fiber degrades. Used for new boxes, paper products. India recycles 70% of cardboard. Keep dry - moisture reduces value by 60%.",
        "metadata": {"category": "paper", "material": "cardboard", "source": "municipal_guidelines", "region": "India"},
        "embedding": None
    },
    {
        "content": "Glass Bottles and Jars - Infinitely recyclable without quality loss. Separate by color: Clear (flint), Green, Amber (brown). Composition: Silica (SiO2) 70%, Soda ash 13%, Limestone 11%. Remove metal/plastic caps. Average bottle weight: 200-400g. Recycling saves 0.8 kg CO2 per kg. Market value: ₹2-4 per kg. Melting point: 1400-1600°C. Saves 30% energy vs. new production. India recycles 40% of glass.",
        "metadata": {"category": "glass", "source": "municipal_guidelines", "region": "India"},
        "embedding": None
    },
    {
        "content": "Aluminum Cans - Made from bauxite ore (Al2O3). Average can weight: 13-15g, 0.3mm thickness. Recycling saves 8 kg CO2 and 100 liters water per kg - 95% energy savings vs. new production. Market value: ₹120-150 per kg (highest value!). Rinse and crush to save space. Can be recycled infinitely. India imports 60% of aluminum. Melting point: 660°C. Recycled into new cans in 60 days.",
        "metadata": {"category": "metal", "material": "aluminum", "source": "municipal_guidelines", "region": "India"},
        "embedding": None
    },
    {
        "content": "Steel Cans (Tin-Plated) - Food cans, aerosol cans. Composition: 98% steel + 2% tin coating. Average weight: 50-80g. Magnetic test: Steel attracts magnet, aluminum doesn't. Market value: ₹25-30 per kg. Recycling saves 2.5 kg CO2 per kg. Rinse food cans, remove paper labels. India produces 100 million tons steel/year. Can be recycled endlessly. Used for construction, new cans, appliances.",
        "metadata": {"category": "metal", "material": "steel", "source": "municipal_guidelines", "region": "India"},
        "embedding": None
    },
    {
        "content": "E-Waste (Electronic Waste) - Contains 60+ elements including gold, silver, copper, palladium, and toxic heavy metals (lead, mercury, cadmium). Average smartphone: 80% recyclable materials. Hazard: Never throw in regular trash. Take to certified e-waste recyclers. Market value: ₹15-25 per kg. India generates 3.2 million tons e-waste/year. Saves 5 kg CO2 per kg. Contains: Circuit boards (copper, gold), batteries (lithium, cobalt), screens (rare earths).",
        "metadata": {"category": "e-waste", "hazard": "toxic", "source": "safety_guidelines", "region": "India"},
        "embedding": None
    },
    {
        "content": "Batteries - Lithium-ion (phones, laptops), Alkaline (AA, AAA), Lead-acid (vehicles). HAZARDOUS: Contains heavy metals - mercury, cadmium, lead, lithium. Never dispose in regular waste. Fire risk if punctured. Take to authorized e-waste centers. Market value: ₹40-60 per kg for Li-ion. India's battery recycling rate: <5%. One battery can contaminate 600,000 liters of water. Proper disposal prevents soil and groundwater contamination.",
        "metadata": {"category": "hazardous", "material": "battery", "hazard": "toxic", "source": "safety_guidelines", "region": "India"},
        "embedding": None
    },
    {
        "content": "Contamination Impact on Recycling - Food residue reduces material value: PET 40-50%, Paper 80-90% (cannot recycle if wet), Cardboard 60%. Oil/grease contamination makes paper non-recyclable. Cleanliness scoring: 90-100% (Very clean, full value), 70-89% (Clean, -15% value), 50-69% (Slightly dirty, -30%), 30-49% (Moderately dirty, -50%), 0-29% (Very contaminated, rejected). Always rinse containers before disposal.",
        "metadata": {"category": "quality", "source": "recycler_guidelines", "region": "India"},
        "embedding": None
    },
    {
        "content": "Environmental Impact Data - Recycling 1 ton plastic saves 5,774 kWh energy (₹40,000 electricity). Aluminum recycling saves 95% energy. One recycled glass bottle saves energy to power laptop for 25 minutes. Landfill decomposition: Plastic 450 years, Glass 1 million years, Aluminum never decomposes. India's landfills: 62 million tons waste/year. Recycling reduces methane emissions (25x worse than CO2). Every 1 kg recycled = prevents 1 kg landfill burden.",
        "metadata": {"category": "impact", "source": "environmental_data", "region": "India"},
        "embedding": None
    },
    {
        "content": "Municipal Recycling Centers (MRF) - Accept: PET, HDPE, paper, cardboard, glass, metal. Operating hours: 9 AM - 6 PM weekdays, Closed Sundays. Minimum weight: 1 kg for dropoff. Rates: PET ₹12/kg, Aluminum ₹140/kg, Paper ₹6/kg. Require: Aadhaar card for registration, Sorted and cleaned materials, Dry waste only. Payment: UPI or cash same day. Free pickup for 10+ kg. Location: Every 2-5 km in urban areas.",
        "metadata": {"category": "recycler_rules", "source": "municipal_rules", "region": "India"},
        "embedding": None
    },
    {
        "content": "Private Recyclers - Higher rates but selective: PET ₹14-16/kg, HDPE ₹11-13/kg, Aluminum ₹145-160/kg, E-waste ₹20-30/kg. Advantages: Doorstep pickup, Better prices, Weekend service. Requirements: Minimum 5 kg, Photos before pickup, Weight verification mandatory, Digital payment. Response time: 24-48 hours. Some provide scales and receipts. Check certifications: ISO 14001, BIS certification.",
        "metadata": {"category": "recycler_rules", "source": "marketplace", "region": "India"},
        "embedding": None
    },
    {
        "content": "Tetra Pak Cartons - Complex multi-layer: 75% paper, 20% polyethylene, 5% aluminum. Used for milk, juice. Average weight: 25-35g. Difficult to recycle - requires special processing. Only 50 recycling plants in India. Market value: ₹2-3 per kg (low due to processing cost). Must be rinsed and flattened. Recycling rate: <10%. Can be made into roofing sheets, furniture boards. Separate layers needed before recycling.",
        "metadata": {"category": "mixed_material", "material": "tetra_pak", "source": "technical_guidelines", "region": "India"},
        "embedding": None
    },
    {
        "content": "Medical/Biohazard Waste - Categories: Yellow (infectious), Red (contaminated plastic), White (sharp objects). Includes: Used syringes, bandages, masks, gloves, expired medicines. EXTREME HAZARD: Never mix with household waste. Infectious disease risk. Legal requirement: Biomedical Waste Management Rules 2016. Contact authorized BMW facilities. Penalties: ₹1 lakh fine + imprisonment. Incineration required at 1000°C+. Home segregation: Use separate red bags.",
        "metadata": {"category": "hazardous", "hazard": "biohazard", "source": "safety_guidelines", "region": "India"},
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
    await collection.delete_many({})
    
    # Initialize CLIP service to generate actual embeddings
    print("🔧 Initializing CLIP service for embeddings...")
    from app.vision.clip_service import vision_service
    await vision_service.initialize()
    
    # Generate embeddings (512-dim for CLIP ViT-B/32 compatibility)
    embeddings_list = []
    doc_ids = []
    
    for i, doc in enumerate(GLOBAL_RAG_SAMPLES):
        # Generate ACTUAL CLIP text embedding
        # Truncate content to avoid CLIP's 77 token limit (~300 chars is safe)
        text_for_embedding = doc['content'][:250]
        doc_preview = doc['content'][:50].split('.')[0]  # Get first sentence
        print(f"  Encoding document {i+1}/{len(GLOBAL_RAG_SAMPLES)}: {doc_preview}...")
        embedding = await vision_service.encode_text(text_for_embedding)
        doc["embedding"] = embedding.tolist()
        doc["created_at"] = datetime.utcnow()
        embeddings_list.append(embedding)
    
    # Insert documents into MongoDB
    result = await collection.insert_many(GLOBAL_RAG_SAMPLES)
    doc_ids = [str(id) for id in result.inserted_ids]
    print(f"✅ Inserted {len(doc_ids)} documents into rag_global")
    
    # Update documents with embedding_id
    for i, doc_id in enumerate(doc_ids):
        await collection.update_one(
            {"_id": result.inserted_ids[i]},
            {"$set": {"embedding_id": doc_id}}
        )
    
    # Create text index for search
    await collection.create_index([("content", "text"), ("metadata.category", 1)])
    print("✅ Created text index on rag_global")
    
    # Populate FAISS vector index
    print("📊 Populating FAISS vector index...")
    from app.services.vector_db import global_rag_vector_db
    await global_rag_vector_db.initialize()
    
    # Convert to numpy array
    embeddings_array = np.array(embeddings_list, dtype=np.float32)
    
    # Insert into FAISS
    await global_rag_vector_db.insert(
        ids=doc_ids,
        embeddings=embeddings_array,
        metadata=[{"title": doc.get("content", "")[:50], "category": doc.get("metadata", {}).get("category", "")} for doc in GLOBAL_RAG_SAMPLES]
    )
    print(f"✅ Populated FAISS index with {len(doc_ids)} vectors")
    
    client.close()


async def seed_sample_users():
    """Create sample users for testing"""
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    print("\n👤 Creating sample user...")
    
    # Define user_id as ObjectId
    user_object_id = ObjectId("673fc7f4f1867ab46b0a8c01")
    
    # Delete existing user if present
    await db.users.delete_one({"_id": user_object_id})
    await db.wallets.delete_many({"user_id": user_object_id})
    
    users = [
        {
            "_id": user_object_id,  # Use _id with ObjectId
            "username": "testuser",
            "password": "test123",
            "name": "Test User",
            "phone": "+919876543210",
            "email": "test@renova.in",
            "language": "en",
            "location": {
                "type": "Point",
                "coordinates": [76.3695, 30.3554]  # Patiala, Punjab
            },
            "preferred_recyclers": [],
            # Stats tracking fields
            "total_scans": 0,
            "tokens_earned": 0,
            "tokens_balance": 0,
            "total_co2_saved_kg": 0.0,
            "total_water_saved_liters": 0.0,
            "total_landfill_saved_kg": 0.0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.users.insert_many(users)
    print(f"✅ Created {len(users)} sample user")
    
    # Create wallet
    wallets = [
        {
            "user_id": user_object_id,  # Use ObjectId reference
            "balance": 0,
            "total_earned": 0,
            "total_redeemed": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.wallets.insert_many(wallets)
    print(f"✅ Created {len(wallets)} wallet")
    
    client.close()


async def seed_sample_recyclers():
    """Create sample recyclers for testing"""
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    print("\n♻️  Creating sample recyclers near Patiala...")
    
    recyclers = [
        {
            "recycler_id": "recycler_patiala_001",
            "name": "Punjab EcoRecycle Hub",
            "phone": "+919815000001",
            "email": "contact@punjabecohub.in",
            "location": {
                "type": "Point",
                "coordinates": [76.3720, 30.3580]  # ~2 km from you (NEAREST)
            },
            "address": "Urban Estate Phase 2, Patiala, Punjab 147002",
            "materials_accepted": ["PET", "HDPE", "Paper", "Cardboard", "Glass", "Aluminum", "Steel", "Metal"],
            "current_capacity_kg": 800,
            "max_capacity_kg": 2000,
            "price_multiplier": 1.1,
            "rating": 4.7,
            "total_collections": 320,
            "operating_hours": "9 AM - 7 PM (Mon-Sat)",
            "is_active": True,
            "catchment_wards": ["Urban Estate", "Phase 2", "Model Town"],
            "created_at": datetime.utcnow()
        },
        {
            "recycler_id": "recycler_patiala_002",
            "name": "GreenTech E-Waste Patiala",
            "phone": "+919815000002",
            "email": "info@greentechpatiala.in",
            "location": {
                "type": "Point",
                "coordinates": [76.3850, 30.3450]  # ~5 km from you (farther option)
            },
            "address": "Industrial Area, Patiala, Punjab 147001",
            "materials_accepted": ["E-Waste", "Battery", "Metal", "Aluminum"],
            "current_capacity_kg": 400,
            "max_capacity_kg": 1000,
            "price_multiplier": 1.3,  # Higher rate for e-waste
            "rating": 4.9,
            "total_collections": 180,
            "operating_hours": "10 AM - 6 PM (Mon-Sat)",
            "is_active": True,
            "catchment_wards": ["Industrial Area", "Tripuri"],
            "created_at": datetime.utcnow()
        }
    ]
    
    result = await db.recyclers.insert_many(recyclers)
    recycler_ids = result.inserted_ids
    print(f"✅ Created {len(recyclers)} sample recyclers")
    print(f"   📍 Punjab EcoRecycle Hub: ~2 km away (NEAREST)")
    print(f"   📍 GreenTech E-Waste: ~5 km away")
    
    # Create recycler credentials
    print("\n🔐 Creating recycler credentials...")
    credentials = [
        {
            "recycler_id": recycler_ids[0],
            "username": "recycler1",
            "password": "password123",  # Plain text for demo (would hash in production)
            "created_at": datetime.utcnow()
        },
        {
            "recycler_id": recycler_ids[1],
            "username": "recycler2",
            "password": "password123",
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.recycler_credentials.insert_many(credentials)
    print(f"✅ Created {len(credentials)} recycler credentials")
    print(f"   👤 Username: recycler1, Password: password123")
    print(f"   👤 Username: recycler2, Password: password123")
    
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
    print("\n📝 Sample user:")
    print("  - 673fc7f4f1867ab46b0a8c01 (Patiala, English)")
    print("\n♻️  Sample recyclers near Patiala:")
    print("  - Punjab EcoRecycle Hub: ~2 km (All materials)")
    print("  - GreenTech E-Waste: ~5 km (E-waste specialist)")
    print("\n🔐 Recycler Login Credentials:")
    print("  - Username: recycler1, Password: password123")
    print("  - Username: recycler2, Password: password123")
    print("\n💡 You can now test API endpoints with these IDs")


if __name__ == "__main__":
    asyncio.run(main())
