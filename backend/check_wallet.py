#!/usr/bin/env python3
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

async def check_wallet():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['renova']
    
    user_id = ObjectId('673fc7f4f1867ab46b0a8c01')
    
    # Check user
    user = await db.users.find_one({'_id': user_id})
    print('User:', user)
    
    # Check wallet
    wallet = await db.wallets.find_one({'user_id': user_id})
    print('\nWallet:', wallet)
    
    # Check pending scans
    pending_count = await db.pending_scans.count_documents({'user_id': user_id})
    print(f'\nPending scans: {pending_count}')
    
    # Check completed scans
    completed_count = await db.completed_scans.count_documents({'user_id': user_id})
    print(f'Completed scans: {completed_count}')
    
    client.close()

if __name__ == '__main__':
    asyncio.run(check_wallet())
