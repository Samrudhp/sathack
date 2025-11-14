# Quickstart — Run locally (dev)

This quickstart covers the minimal steps to run the backend and frontend locally for development and hackathon demos.

Prerequisites

- Python 3.10 (project uses a venv)
- Node.js (for frontend)
- ffmpeg (for Whisper audio conversion)
- Git

Environment (important variables)

Set the following at minimum for the backend:

- GROQ_API_KEY — your Groq API key for LLM calls.
- MONGO_URI — MongoDB connection string.
- WHISPER_MODEL — name of Whisper model (e.g. `small`).
- CLIP_MODEL — CLIP model identifier (project default already set in `config.py`).

Backend (dev)

1. Create & activate virtual environment and install dependencies (from the `backend` folder):

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Start the backend (development reload):

```bash
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Notes:
- If you use `python run.py` and the project includes a runner script, that may also start the backend with correct env variables.
- Watch for `httpx` vs `groq` compatibility issues. If the Groq client raises init errors, ensure `httpx` is a version compatible with the installed `groq` package.

Frontend (dev)

1. Open a separate terminal and run:

```bash
cd frontend-v2
npm install
npm run dev
```

2. Open the app in the browser at the port shown (commonly `5173`/`5174`).

Testing the scan endpoints

- Health: `GET http://localhost:8000/health` (should respond when backend up)
- Image scan: `POST http://localhost:8000/api/scan/scan_image` with form-data `image`
- Voice: `POST http://localhost:8000/api/scan/voice_input` with audio bytes

Quick debugging tips

- If the backend fails to start because of an import or dependency issue, run a quick import test:

```bash
source venv/bin/activate
python -c "from app.main import app; print('imports ok')"
```

- For LLM failures look for `httpx` compatibility messages (downgrade or upgrade `httpx` to match `groq`).
