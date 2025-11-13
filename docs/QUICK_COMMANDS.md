# 🚀 Quick Commands Reference

## Setup Commands (One-Time)

```powershell
# 1. Navigate to backend
cd "e:\Sagar\Hackathons and Competitions\SatHack\backend"

# 2. Create conda environment with Python 3.10
conda create -n renova python=3.10 -y

# 3. Activate environment
conda activate renova

# 4. Install dependencies
pip install -r requirements.txt

# 5. Copy environment file
cp .env.example .env

# 6. Edit .env and add your Groq API key
notepad .env
```

## Get FREE Groq API Key

1. Visit: https://console.groq.com
2. Sign up (no credit card needed)
3. Go to "API Keys" section
4. Click "Create API Key"
5. Copy the key (starts with `gsk_...`)
6. Paste in `.env` file:
   ```env
   GROQ_API_KEY=gsk_your_key_here
   ```

## Start MongoDB (Required)

### Option 1: Docker (Recommended)
```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Option 2: Check if already running
```powershell
# Check MongoDB status
docker ps | findstr mongodb
```

## Run Backend Server

```powershell
# Activate conda environment (if not already)
conda activate renova

# Navigate to backend
cd "e:\Sagar\Hackathons and Competitions\SatHack\backend"

# Run server
python run.py

# OR with uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Test the Server

```powershell
# Test health endpoint
curl http://localhost:8000/health

# Open API docs in browser
start http://localhost:8000/docs
```

## Common Conda Commands

```powershell
# List environments
conda env list

# Activate environment
conda activate renova

# Deactivate environment
conda deactivate

# Remove environment (if needed)
conda env remove -n renova

# List installed packages
pip list
```

## Troubleshooting Commands

```powershell
# Check Python version
python --version

# Check if Groq is installed
pip show groq

# Check MongoDB connection
docker logs mongodb

# Restart MongoDB
docker restart mongodb

# Stop server
Ctrl + C
```

## Daily Usage

```powershell
# 1. Start MongoDB (if not running)
docker start mongodb

# 2. Activate conda environment
conda activate renova

# 3. Navigate to backend
cd "e:\Sagar\Hackathons and Competitions\SatHack\backend"

# 4. Run server
python run.py
```

## Environment Variables (.env file)

```env
# Required
GROQ_API_KEY=gsk_your_actual_key_here
MONGODB_URL=mongodb://localhost:27017
SECRET_KEY=any-random-string-here

# Optional (defaults are fine)
MONGODB_DB_NAME=renova
VECTOR_DB=faiss
WHISPER_MODEL=small
DEBUG=True
```

## Port Information

- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **MongoDB**: localhost:27017

## Quick Test

```powershell
# After server is running, test with curl:
curl http://localhost:8000/

# Should return:
# {"name":"ReNova","version":"1.0.0","status":"running"}
```

---

**🎯 Most Common Workflow:**

```powershell
conda activate renova
cd "e:\Sagar\Hackathons and Competitions\SatHack\backend"
python run.py
```

**That's it! Server runs at http://localhost:8000** 🚀
