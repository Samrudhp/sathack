# API Endpoints (summary)

This document lists the most important HTTP endpoints used by the frontend and for demos. It is not a complete API reference but covers the common flows.

Base path: `/api` (scan endpoints often mounted under `/api/scan`)

Key endpoints

- GET `/health`
  - Purpose: quick health check for the backend.

- POST `/api/scan/scan_image`
  - Purpose: Submit an image for material detection and RAG-enabled guidance.
  - Payload: multipart form-data with `image` file, optional `user_id`, `location`.
  - Returns: LLM reasoning result, detected labels, similarity docs, and recommended disposal instructions.

- POST `/api/scan/voice_input`
  - Purpose: Submit recorded audio for transcription (Whisper) and RAG-enabled guidance.
  - Payload: binary audio (webm) or multipart form-data.
  - Flow: audio → backend converts to WAV → Whisper transcribes → RAG → Groq LLM → optional translation → response.

- POST `/api/scan/rag_query` (or `/api/scan/rag-queue` in some code)
  - Purpose: Direct RAG query endpoint — send a text query and return retrieved documents + LLM answer.
  - Payload: JSON with `query`, optional `user_id`, and `language`.

- User & marketplace endpoints
  - `POST /api/users/register`, `POST /api/users/login` — typical auth routes (see `user_routes.py`).
  - Marketplace: calls to `marketplace_service` that rank recyclers and return top matches. See `marketplace_routes.py` and `marketplace_service.py`.

Notes

- The exact route names may vary; look under `backend/app/api/` for route modules.
- Responses often include structured LLM output like `disposal_instruction`, `materials`, `confidence`.
