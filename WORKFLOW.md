# 🚀 ReNova - Development Workflow Guide

## Quick Start for Team Members

Follow these steps in order to get the full system running:

---

## 📋 Prerequisites

- Python 3.10+ installed
- Node.js 18+ installed
- MongoDB running on `localhost:27017`
- Conda/Anaconda (recommended for Python environment)

---

## 🔧 Step 1: Start the Backend API

**Location:** `backend/`

### Setup (First Time Only)
```bash
cd backend
# Create virtual environment
python -m venv venv
# OR use conda
conda create -p venv python=3.10

# Activate environment
# Windows (conda):
conda activate ./venv
# Windows (regular venv):
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with initial data
python scripts/seed_data.py
```

### Run Backend Server
```bash
cd backend
python run.py
```

**Backend will start on:** `http://localhost:8000`

**API Docs:** `http://localhost:8000/docs`

---

## 📱 Step 2: Start User Frontend (v2)

**Location:** `frontend-v2/`

This is the main user-facing app for scanning waste, getting disposal instructions, and redeeming tokens.

### Setup (First Time Only)
```bash
cd frontend-v2
npm install
```

### Run Development Server
```bash
cd frontend-v2
npm run dev
```

**Frontend-v2 will start on:** `http://localhost:5173`

### Test User Credentials
- **User ID:** `673fc7f4f1867ab46b0a8c01`
- **Username:** `testuser`
- **Password:** `test123`

---

## 🏭 Step 3: Start Recycler Dashboard (v3)

**Location:** `frontend-v3/`

This is the recycler panel for generating redemption codes and viewing statistics.

### Setup
```bash
cd frontend-v3
# Open index.html directly in browser
# OR use a simple HTTP server:
python -m http.server 8080
```

**Frontend-v3 will be available on:** `http://localhost:8080` (or just open `index.html`)

### Recycler Login Credentials

**Default Recycler:**
- **Username:** `recycler1`
- **Password:** `password123`

**Other Test Recyclers:**
- **Username:** `recycler2` | **Password:** `password123`
- **Username:** `recycler3` | **Password:** `password123`

---

## 🎯 Complete Workflow Test

### 1️⃣ User Scans Waste (frontend-v2)
1. Open `http://localhost:5173`
2. Click "Scan Waste"
3. Upload an image of waste (plastic bottle, cardboard, etc.)
4. AI will analyze and provide disposal instructions
5. Find nearest recyclers on the map

### 2️⃣ User Delivers Waste to Recycler
1. User physically delivers waste to a recycler center

### 3️⃣ Recycler Generates Code (frontend-v3)
1. Open `http://localhost:8080` (or index.html)
2. Login with recycler credentials
3. Fill in the form:
   - **User ID:** `673fc7f4f1867ab46b0a8c01`
   - **Material:** Select the material type
   - **Weight:** Enter weight in kg
4. Click "Generate Code"
5. Give the 6-character code to the user

### 4️⃣ User Redeems Code (frontend-v2)
1. In frontend-v2, go to Profile
2. Click "Redeem Code"
3. Enter the 6-character code from recycler
4. Tokens will be added to your balance!
5. Profile stats will update (refresh if needed)

---

## 🔍 Troubleshooting

### Backend Issues

**Error: "User not found" in stats**
```bash
cd backend
python scripts/fix_user_data.py
# OR
python scripts/seed_data.py
```

**MongoDB Connection Failed**
- Make sure MongoDB is running on port 27017
- Check connection string in `backend/app/config.py`

### Frontend Issues

**Frontend-v2 won't start**
```bash
cd frontend-v2
rm -rf node_modules
npm install
npm run dev
```

**API calls failing**
- Ensure backend is running on `http://localhost:8000`
- Check browser console for CORS errors
- Verify API_BASE in frontend code

---

## 📊 Monitoring & Logs

### Backend Logs
Watch the terminal where you ran `python run.py` for API logs

### Frontend Console
Open browser DevTools (F12) > Console tab to see frontend logs

---

## 🗄️ Database Info

**Database Name:** `renova`

**Collections:**
- `users` - User accounts and stats
- `recyclers` - Recycler centers
- `redemption_codes` - Generated codes
- `waste_deliveries` - Delivery records
- `scans` - Scan history
- `rag_global` - Knowledge base

### View Database (Optional)
```bash
# Using MongoDB Compass (GUI)
# Connect to: mongodb://localhost:27017

# OR using mongosh CLI:
mongosh
use renova
db.users.find().pretty()
db.redemption_codes.find().pretty()
```

---

## 🎨 Tech Stack Summary

| Component | Technology |
|-----------|------------|
| **Backend** | FastAPI (Python) |
| **User Frontend** | React + Vite |
| **Recycler Dashboard** | Vanilla HTML/JS |
| **Database** | MongoDB |
| **AI Models** | CLIP, Whisper (local) |
| **LLM** | Groq API |
| **Maps** | OpenStreetMap |

---

## 👥 Team Workflow Tips

1. **Always start backend first** - Frontends depend on it
2. **Check backend logs** when debugging API issues
3. **Reseed database** if data gets corrupted: `python scripts/seed_data.py`
4. **Test the complete flow** from scan → delivery → code generation → redemption
5. **Keep terminal windows organized** - One for backend, one for frontend-v2

---

## 📝 Quick Commands Reference

```bash
# Backend
cd backend && python run.py

# Frontend-v2 (User App)
cd frontend-v2 && npm run dev

# Frontend-v3 (Recycler Dashboard)
cd frontend-v3 && python -m http.server 8080

# Reseed Database
cd backend && python scripts/seed_data.py

# Fix User Data
cd backend && python scripts/fix_user_data.py
```

---

## ✅ Success Checklist

- [ ] MongoDB is running
- [ ] Backend API starts without errors
- [ ] Frontend-v2 loads successfully
- [ ] Frontend-v3 opens in browser
- [ ] Can login to recycler dashboard
- [ ] Can scan waste in user app
- [ ] Can generate redemption code
- [ ] Can redeem code and see updated stats

---

**Need Help?** Check the individual README files in each directory for more details!
