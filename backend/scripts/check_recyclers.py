#!/usr/bin/env python3
"""
Quick script to check recyclers in database
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URL = "mongodb://localhost:27017"
DB_NAME = "renova"

async def main():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    collection = db.recyclers
    
    print("🔍 Checking recyclers in database...")
    
    # Count total
    total = await collection.count_documents({})
    print(f"\nTotal recyclers: {total}")
    
    # Count active
    active = await collection.count_documents({"is_active": True})
    print(f"Active recyclers: {active}")
    
    # Show sample recyclers
    print("\n📍 Sample recyclers:")
    cursor = collection.find({"is_active": True}).limit(5)
    recyclers = await cursor.to_list(length=5)
    
    for i, rec in enumerate(recyclers, 1):
        print(f"\n{i}. {rec.get('name', 'Unknown')}")
        print(f"   ID: {rec['_id']}")
        print(f"   Location: {rec.get('location', {}).get('coordinates', 'N/A')}")
        print(f"   Materials: {rec.get('materials_accepted', [])}")
        print(f"   Active: {rec.get('is_active', False)}")
    
    client.close()
    print("\n✅ Done!")

if __name__ == "__main__":
    asyncio.run(main())
