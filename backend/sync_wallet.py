#!/usr/bin/env python3
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

async def sync_wallet():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['renova']
    
    user_id = ObjectId('673fc7f4f1867ab46b0a8c01')
    
    # Get user data
    user = await db.users.find_one({'_id': user_id})
    
    # Update wallet with user's token data
    await db.wallets.update_one(
        {'user_id': user_id},
        {'$set': {
            'balance': user.get('tokens_balance', 0),
            'total_earned': user.get('tokens_earned', 0)
        }}
    )
    
    print(f"Synced wallet: balance={user.get('tokens_balance', 0)}, earned={user.get('tokens_earned', 0)}")
    
    client.close()

if __name__ == '__main__':
    asyncio.run(sync_wallet())
