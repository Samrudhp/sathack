# Architecture — ReNova

This document describes the high-level architecture and main data flows for ReNova. It is written to help developers and reviewers understand how components interact (user flows, recycler flows, and core services).

## Components

- Frontend (React + Vite)
  - Provides public landing page, scan UI, voice query UI, and user/recycler dashboards.
  - Calls backend API endpoints under `/api/scan/*` and other user routes.

- Backend (FastAPI)
  - Single FastAPI application that exposes scan, rag, marketplace and user endpoints.
  - Responsible for orchestrating AI services, DB access, and business logic.

- Services used by backend
  - Whisper (OpenAI Whisper) — transcribes audio (webm -> wav -> 16kHz mono) into text.
  - CLIP (OpenAI CLIP) — image classification and embeddings for visual understanding.
  - Vector DB (FAISS) — stores dense vectors for RAG retrieval.
  - Groq (LLM) — reasoning and instruction-following for contextual responses.
  - MongoDB — primary persistent store for users, recyclers, logs, and metadata.
  - Translation service — translates LLM output into user language (previously Bhashini; demo-friendly alternatives used).

## High-level data flow: Image scan (user)

1. User uploads image in frontend → POST `/api/scan/scan_image` with image bytes + metadata.
2. Backend receives image, runs CLIP to detect likely material labels and compute embeddings.
3. Embeddings are used to query FAISS for similar documents (global + personal RAG).
4. Backend constructs a prompt (vision labels + retrieved docs + user metadata) and calls LLM (Groq) to generate disposal instructions and next steps.
5. LLM output is optionally translated into user language and returned to frontend.
6. Backend logs scan, computes image hash, and stores record in MongoDB.

## High-level data flow: Voice query (user)

1. User records voice in frontend; audio encoded (webm) sent to POST `/api/scan/voice_input`.
2. Backend converts audio to WAV (16kHz mono) and calls Whisper to transcribe.
3. Transcription text is used to run RAG retrieval (FAISS + Mongo) and construct LLM prompt, similar to image flow.
4. Groq LLM returns instructions; translation service translates if necessary; response returned to frontend.

## Recycler flow (marketplace)

1. When a user requests a pickup or searches for recyclers, the backend calls `marketplace_service.rank_recyclers(...)`.
2. Ranking algorithm combines distance, recycler scores, and available capacity to produce a prioritized list.
3. Top recyclers are returned to the frontend (with name, distance_km, and total_score).
4. When a pickup is confirmed, the backend writes the transaction and notifies the recycler (webhook/notification mechanism).

## Important integration points

- LLM (Groq): Keep `httpx` compatible with Groq client. Groq's Python client wraps an `httpx` client; mismatched versions may raise init errors.
- Whisper model: configured in backend `config.py` (e.g., `WHISPER_MODEL = "small"`). Loading time happens at app startup.
- Vector DB: global vs personal vector DB instances are initialized at startup.

## Security and secrets

- Keys and sensitive settings live in environment variables (see `quickstart.md`). Avoid committing them.

## Where to look in code

- Backend entrypoint: `backend/app/main.py`
- Scan endpoints: `backend/app/api/scan_routes.py`
- Whisper service: `backend/app/voice/whisper_service.py`
- CLIP service: `backend/app/vision/clip_service.py`
- Marketplace: `backend/app/marketplace/marketplace_service.py`
- Translation (replacement): `backend/app/services/translation_service.py`
