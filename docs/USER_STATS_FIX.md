# USER STATS FIX

## Problem
User stats weren't updating after token generation and redemption because the user document in MongoDB was using `user_id` as a string field instead of `_id` as an ObjectId.

## What Was Fixed

1. **User Schema** - Updated to use `_id` as ObjectId instead of `user_id` string
2. **Seed Data** - Fixed to create users with proper `_id` field and all stats tracking fields
3. **Logging** - Added detailed logging to track stats updates

## How to Fix Your Database

### Option 1: Run the seed script
```bash
cd backend
python scripts\seed_data.py
```

### Option 2: Run the quick batch file
```bash
cd backend
reseed_user.bat
```

### Option 3: Use the dedicated fix script
```bash
cd backend
python scripts\fix_user_data.py
```

## What the Fix Does

The scripts will:
1. Delete the old user with incorrect format
2. Create a new user with:
   - `_id`: ObjectId("673fc7f4f1867ab46b0a8c01")
   - `username`: "testuser"
   - `password`: "test123"
   - All stats fields initialized to 0

## Verify It Works

1. Run the seed/fix script
2. Generate a token code from recycler panel
3. Redeem the code in the app
4. Check the logs - you should see:
   ```
   Updated user stats - matched: 1, modified: 1
   User 673fc7f4f1867ab46b0a8c01 new balance: [tokens] tokens
   ```
5. Refresh your profile - stats should now show!

## User Document Structure

The user document now has these fields:
```json
{
  "_id": ObjectId("673fc7f4f1867ab46b0a8c01"),
  "username": "testuser",
  "password": "test123",
  "name": "Test User",
  "phone": "+919876543210",
  "email": "test@renova.in",
  "language": "en",
  "total_scans": 0,
  "tokens_earned": 0,
  "tokens_balance": 0,
  "total_co2_saved_kg": 0.0,
  "total_water_saved_liters": 0.0,
  "total_landfill_saved_kg": 0.0,
  "created_at": "...",
  "updated_at": "..."
}
```

## Testing the Flow

1. **Generate Code** (Recycler side):
   - Login as recycler
   - Enter user ID: 673fc7f4f1867ab46b0a8c01
   - Material: plastic
   - Weight: 5 kg
   - Get a 6-character code

2. **Redeem Code** (User side):
   - Login/use app
   - Enter the code
   - Should see success message with tokens awarded

3. **Check Stats**:
   - Go to profile
   - Refresh if needed
   - Should see updated tokens, CO2 saved, etc.

## If Stats Still Don't Update

Check the backend logs for:
```
Updated user stats - matched: 0, modified: 0
```

If matched is 0, the user_id doesn't exist. Run the seed script again.

If matched is 1 but modified is 0, there might be no actual changes (unlikely).
