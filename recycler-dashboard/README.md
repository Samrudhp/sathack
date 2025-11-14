# Recycler Dashboard - Frontend V3

Simple HTML/JS dashboard for recyclers to manage waste deliveries and generate redemption codes.

## Features

- 🔐 Simple login (username/password)
- 📊 View statistics (deliveries, weight, tokens, CO2 saved)
- 🎫 Generate redemption codes for users
- 📦 View recent waste deliveries
- 💾 Persists login in localStorage

## Quick Start

1. **Seed recycler credentials:**
   ```bash
   cd backend
   python scripts/seed_recycler_creds.py
   ```

2. **Open the dashboard:**
   - Simply open `index.html` in your browser
   - OR use a local server:
     ```bash
     python -m http.server 3000
     ```
   - Navigate to `http://localhost:3000`

3. **Login:**
   - Username: `recycler1`
   - Password: `password123`

## Usage

### Generate Redemption Code

1. User delivers waste to your recycling center
2. Enter their User ID (they can find it in their profile)
3. Select material type
4. Enter weight in kg
5. Click "Generate Code"
6. Give the 6-character code to the user
7. User redeems code in their app to get tokens!

### View Stats

- See total deliveries, weight processed, tokens issued
- Track environmental impact (CO2, water, landfill savings)

## API Endpoints Used

- `POST /api/recycler/login` - Login
- `GET /api/recycler/stats/{recycler_id}` - Get stats
- `POST /api/recycler/generate-code` - Generate redemption code
- `GET /api/recycler/deliveries/{recycler_id}` - Get deliveries

## Tech Stack

- Plain HTML/CSS/JavaScript
- No build process required
- Fetch API for backend communication
- LocalStorage for session persistence
