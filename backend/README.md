# ReNova - AI-Driven Waste Intelligence System

Complete backend implementation using **FastAPI + MongoDB + CLIP + Whisper + OpenAI**.

---

## 🏗️ Architecture

```
User Input (Image/Voice/Text)
    ↓
Input Normalization (Hindi → English)
    ↓
Vision Module (CLIP) → Material Classification
    ↓
OSM Context → Location, Recyclers, Roads
    ↓
Personal Context → User History
    ↓
Time Context → Hour, Day
    ↓
Fusion Layer → Combined Embedding
    ↓
Dual-RAG → Global + Personal Knowledge
    ↓
LLM Reasoning (English) → Disposal Instructions
    ↓
Translation (English → Hindi if needed)
    ↓
Token Generation + Impact Tracking
```

---

## 📂 Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration
│   ├── api/                    # API endpoints
│   │   ├── scan_routes.py      # POST /scan_image, /voice_input, /rag_query
│   │   ├── user_routes.py      # GET /user/{id}, /token_balance
│   │   ├── recycler_routes.py  # GET /recycler/items_pending, POST /recycler/submit
│   │   ├── marketplace_routes.py  # GET /recyclers_nearby, POST /schedule_pickup
│   │   ├── token_routes.py     # POST /user/redeem_token
│   │   └── impact_routes.py    # GET /impact_stats
│   ├── models/                 # Pydantic models
│   │   ├── user_models.py
│   │   ├── recycler_models.py
│   │   ├── scan_models.py
│   │   ├── token_models.py
│   │   ├── rag_models.py
│   │   ├── marketplace_models.py
│   │   └── impact_models.py
│   ├── services/               # Core services
│   │   ├── database.py         # MongoDB connection
│   │   └── vector_db.py        # Milvus/FAISS
│   ├── vision/                 # CLIP vision
│   │   └── clip_service.py
│   ├── voice/                  # Whisper ASR
│   │   └── whisper_service.py
│   ├── osm/                    # OpenStreetMap
│   │   └── osm_service.py
│   ├── fusion/                 # Embedding fusion
│   │   └── fusion_service.py
│   ├── rag/                    # RAG retrieval
│   │   └── rag_service.py
│   ├── utils/                  # LLM & fraud
│   │   ├── llm_service.py
│   │   └── fraud_service.py
│   ├── marketplace/            # Recycler ranking
│   │   └── marketplace_service.py
│   ├── tokens/                 # Token system
│   │   └── token_service.py
│   └── impact/                 # Impact calculation
│       └── impact_service.py
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites

- Python 3.9+
- MongoDB (running on localhost:27017)
- OpenAI API Key

### 2. Installation

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Required environment variables:
```env
MONGODB_URL=mongodb://localhost:27017
OPENAI_API_KEY=sk-your-key-here
SECRET_KEY=your-secret-key-here
```

### 4. Run Server

```bash
# Start FastAPI server
python -m app.main

# Or with uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at: **http://localhost:8000**

---

## 📡 API Endpoints

### User APIs

#### POST `/api/scan_image`
Complete scan pipeline with image.

**Form Data:**
- `user_id`: string
- `image`: file (jpeg/png)
- `latitude`: float
- `longitude`: float
- `query_text`: string (optional)
- `language`: string (en/hi)

**Response:**
```json
{
  "scan_id": "...",
  "material": "PET",
  "confidence": 0.95,
  "cleanliness_score": 85.0,
  "disposal_instruction": "...",
  "estimated_credits": 12,
  "environmental_impact": {
    "co2_saved_kg": 2.1,
    "water_saved_liters": 15.0,
    "landfill_saved_kg": 1.0
  }
}
```

#### POST `/api/voice_input`
Transcribe voice to text.

**Form Data:**
- `user_id`: string
- `audio`: file (wav/mp3/m4a)
- `language`: string (en/hi)

#### POST `/api/rag_query`
Query knowledge base without image.

#### GET `/api/token_balance?user_id=...`
Get user's wallet balance.

---

### Recycler APIs

#### GET `/api/recycler/items_pending?recycler_id=...`
Get pending scans for processing.

#### POST `/api/recycler/submit`
Submit weight and generate token.

**Form Data:**
- `recycler_id`: string
- `scan_id`: string
- `weight_kg`: float
- `material_override`: string (optional)

**Response:**
```json
{
  "success": true,
  "credits_awarded": 12,
  "token": {
    "token_id": "ABC123",
    "credits": 12,
    "expires_at": "2025-11-14T..."
  }
}
```

#### POST `/api/user/redeem_token`
User redeems token.

**Form Data:**
- `user_id`: string
- `token_id`: string

---

### Marketplace APIs

#### GET `/api/recyclers_nearby?lat=...&lon=...&material=...`
Get ranked recyclers.

#### POST `/api/schedule_pickup`
Schedule waste pickup.

---

### Impact APIs

#### GET `/api/impact_stats?user_id=...&period=all_time`
Get environmental impact statistics.

---

## 🔧 Technology Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | FastAPI |
| **Database** | MongoDB (Motor async driver) |
| **Vector DB** | FAISS / Milvus |
| **Vision** | CLIP (OpenAI) |
| **Voice** | Whisper (OpenAI) |
| **LLM** | GPT-4 (OpenAI) |
| **Translation** | GPT-3.5 (OpenAI) |
| **Geospatial** | OpenStreetMap (Nominatim, Overpass, OSRM) |
| **Image Hashing** | imagehash (perceptual hash) |

---

## 🧮 Formulas

### Credit Calculation
```
credits = base_rate(material) × weight_kg × (cleanliness_score / 100)
```

### Material Base Rates (credits/kg)
- PET: 12
- HDPE: 10
- Paper: 5
- Glass: 4
- Metal: 15
- E-Waste: 20

### Environmental Impact
- **CO₂ Saved**: `material_factor × weight_kg` (kg)
- **Water Saved**: `material_factor × weight_kg` (liters)
- **Landfill Saved**: `weight_kg` (kg)

### Recycler Scoring
```
score = 0.3×distance + 0.25×material_accept + 0.15×capacity + 
        0.1×price + 0.1×road_access + 0.1×catchment_zone
```

---

## 📊 MongoDB Collections

| Collection | Purpose |
|-----------|---------|
| `users` | User profiles |
| `recyclers` | Recycler/collection centers |
| `wallets` | User credit wallets |
| `pending_items` | Scans awaiting processing |
| `completed_scans` | Processed scans |
| `tokens` | Credit vouchers |
| `token_redemptions` | Redemption logs |
| `recycler_submissions` | Recycler submissions |
| `rag_global` | Global knowledge base |
| `rag_personal` | User-specific documents |
| `user_behavior` | User behavior analytics |
| `pickups` | Scheduled pickups |
| `impact_stats` | Environmental impact stats |
| `heatmap_tiles` | Geospatial heatmap |
| `fraud_checks` | Fraud detection logs |

---

## 🔐 Fraud Prevention

The system implements multiple fraud checks:

1. **Image Hashing**: Detect duplicate images
2. **CLIP Similarity**: Detect internet/stock images
3. **GPS Mismatch**: Flag unusual locations
4. **Weight Sanity**: Validate realistic weights
5. **Token Expiry**: 24-hour expiration
6. **User-Token Binding**: Tokens belong to specific users

---

## 🌍 Geospatial Features

- **Reverse Geocoding**: Lat/lon → Address
- **Nearby Search**: Find recyclers within radius
- **Route Calculation**: Distance and duration via OSRM
- **Road Assessment**: Accessibility scoring
- **Heatmap Tiles**: Slippy map tiles (zoom/x/y)

---

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

Example API test:
```bash
curl -X POST http://localhost:8000/api/scan_image \
  -F "user_id=12345" \
  -F "image=@waste_bottle.jpg" \
  -F "latitude=12.9716" \
  -F "longitude=77.5946" \
  -F "language=hi"
```

---

## 📝 Notes

### Language Support
- All processing happens in **English**
- Hindi translation occurs only at final output
- Input normalization: Hindi → English → Processing → Hindi

### Vector Embeddings
- CLIP produces 768-dimensional embeddings
- Location features: 128-dim
- User history: 256-dim
- Time context: 64-dim
- All fused into 768-dim vector

### MongoDB Geospatial
- Uses GeoJSON format: `{type: "Point", coordinates: [lon, lat]}`
- 2dsphere indexes for fast queries
- $near queries for proximity search

---

## 🚨 Important Points

1. **No SQL/PostgreSQL** - Only MongoDB
2. **No TypeScript/Node.js** - Only Python
3. **English Processing** - LLM works in English only
4. **Hindi Translation** - Only at final step
5. **Exact Pipeline** - Follows specification exactly

---

## 📞 Support

For issues or questions, check the logs:
```bash
tail -f app.log
```

---

## 🎉 Complete Implementation

This implementation includes **ALL** specified components:
- ✅ Input normalization (voice, image, text)
- ✅ Vision module (CLIP)
- ✅ OSM integration
- ✅ Personal & time context
- ✅ Fusion layer
- ✅ Dual-RAG retrieval
- ✅ LLM reasoning (English)
- ✅ Hindi translation
- ✅ Token system with fraud prevention
- ✅ Impact engine
- ✅ Marketplace & routing
- ✅ All required API endpoints
- ✅ Complete MongoDB schema

**No deviations. Production-ready.**
