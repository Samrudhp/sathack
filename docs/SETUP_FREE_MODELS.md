# 🚀 ReNova Backend Setup Guide (FREE Models)

## ✅ Changes Made to Use FREE Models

### 1. **Replaced OpenAI with Groq**
- ❌ Removed: `openai` package
- ✅ Added: `groq` package (100% FREE API)
- Model: `llama-3.1-70b-versatile` for reasoning
- Model: `llama-3.1-8b-instant` for translation

### 2. **Using Local Whisper**
- Changed from `base` to `small` model
- Runs locally on your machine
- No API calls needed

### 3. **CLIP Remains Local**
- Still using `openai/clip-vit-base-patch32` from Hugging Face
- Runs locally, no API needed

---

## 📋 Setup Instructions

### Step 1: Create Conda Environment

```powershell
# Navigate to backend directory
cd "e:\Sagar\Hackathons and Competitions\SatHack\backend"

# Create conda environment with Python 3.10
conda create -n renova python=3.10 -y

# Activate environment
conda activate renova

# Upgrade pip
pip install --upgrade pip
```

### Step 2: Install Dependencies

```powershell
# Install all requirements
pip install -r requirements.txt
```

**Note:** This will take 5-10 minutes as it downloads:
- PyTorch (~2GB)
- Transformers
- Whisper model
- CLIP model
- Other dependencies

### Step 3: Get FREE Groq API Key

1. Go to: **https://console.groq.com**
2. Sign up (FREE account)
3. Go to API Keys section
4. Create a new API key
5. Copy the key

**Groq Limits (FREE):**
- 30 requests/minute
- 14,400 requests/day
- 100% FREE forever! 🎉

### Step 4: Configure Environment Variables

```powershell
# Copy the example .env file
cp .env.example .env

# Edit the .env file (use notepad or VS Code)
notepad .env
```

**Update these values in `.env`:**

```env
# Groq API Key (paste your key here)
GROQ_API_KEY=gsk_your_actual_key_here

# MongoDB (if you have it running locally)
MONGODB_URL=mongodb://localhost:27017

# Secret Key (change to any random string)
SECRET_KEY=change-this-to-something-random-12345

# Vector DB (use FAISS for local setup)
VECTOR_DB=faiss

# Whisper model (small for faster performance)
WHISPER_MODEL=small
```

### Step 5: Start MongoDB (Required)

**Option A: Using Docker**
```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: Install MongoDB Locally**
- Download from: https://www.mongodb.com/try/download/community
- Install and run as service

### Step 6: Run the Backend

```powershell
# Make sure conda environment is activated
conda activate renova

# Run the server
python run.py

# OR with uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Server will start at:** `http://localhost:8000`

---

## 🧪 Test the API

### Check Health
```powershell
curl http://localhost:8000/health
```

### API Documentation
Open in browser: `http://localhost:8000/docs`

---

## 📊 What Models Are Used Now?

| Component | Model | Type | Cost |
|-----------|-------|------|------|
| **LLM Reasoning** | Llama 3.1 70B (Groq) | Cloud API | FREE ✅ |
| **Translation** | Llama 3.1 8B (Groq) | Cloud API | FREE ✅ |
| **Vision** | CLIP ViT-B/32 | Local | FREE ✅ |
| **Voice** | Whisper Small | Local | FREE ✅ |
| **Embeddings** | Sentence Transformers | Local | FREE ✅ |
| **Vector DB** | FAISS | Local | FREE ✅ |

**Total Cost: $0.00** 🎉

---

## 🔧 Troubleshooting

### Issue: "GROQ_API_KEY not found"
**Solution:** Make sure you created `.env` file with your Groq API key

### Issue: "MongoDB connection failed"
**Solution:** Start MongoDB:
```powershell
docker run -d -p 27017:27017 mongo:latest
```

### Issue: "Out of memory" when loading models
**Solution:** 
- Use smaller Whisper model: `WHISPER_MODEL=tiny`
- Close other applications
- Minimum 8GB RAM recommended

### Issue: Groq rate limit exceeded
**Solution:**
- Free tier: 30 requests/minute
- Wait 1 minute and try again
- For production, consider Groq paid tier or caching

---

## 🚀 Performance Expectations

### First Request (Cold Start)
- Model loading: ~30-60 seconds
- Includes: CLIP, Whisper, Vector DB initialization

### Subsequent Requests
- Image scan: ~2-5 seconds
- Voice input: ~3-6 seconds
- RAG query: ~1-2 seconds

### Model Sizes
- CLIP: ~600MB
- Whisper Small: ~460MB
- Sentence Transformers: ~400MB
- **Total**: ~1.5GB disk space

---

## 🎯 Next Steps

1. ✅ Test basic scan endpoint
2. ✅ Seed RAG database with waste knowledge
3. ✅ Test voice input
4. ✅ Add recycler data
5. ✅ Test marketplace features

---

## 📝 Notes

- **Groq is MUCH faster** than OpenAI (lower latency)
- **Llama 3.1 70B** rivals GPT-4 quality
- **Translation quality** is excellent with Llama 3.1
- **No credit card required** for Groq

**Enjoy your FREE AI-powered waste management system!** 🌍♻️
