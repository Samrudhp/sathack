# Dual RAG Architecture — ReNova

This document explains the dual RAG (Retrieval-Augmented Generation) architecture used in ReNova, why it exists, and how it improves user experience and LLM responses.

## What is RAG?

RAG = Retrieval-Augmented Generation. Instead of relying solely on the LLM's training data, we retrieve relevant documents from a vector database and inject them into the prompt. This gives the LLM fresh, domain-specific context to generate better answers.

## Why dual RAG?

ReNova uses **two separate vector databases**:

1. **Global RAG** — shared knowledge base for all users
   - Contains general waste management guidelines, recycling best practices, material classifications, disposal instructions, and environmental regulations.
   - Built from curated documents and maintained by the platform.
   - Read-only for users; updated by admins or automated ingestion pipelines.

2. **Personal RAG** — user-specific knowledge base
   - Stores documents uploaded by individual users (e.g., local recycling center guidelines, personal notes, community-specific rules).
   - Each user has their own isolated vector space.
   - Allows personalization: users in different cities get context relevant to their local recycling infrastructure.

## How it works

When a user submits a query (text, image, or voice):

1. **Embed the query** — the backend converts the query into a dense vector (using CLIP for images or text embeddings for voice/text queries).

2. **Query both vector DBs**:
   - Global RAG: retrieve top-k most similar documents from the shared knowledge base.
   - Personal RAG: retrieve top-k most similar documents from the user's personal collection.

3. **Merge results** — combine global + personal docs (typically top 3–5 from each).

4. **Inject into LLM prompt** — construct a prompt that includes:
   - The user's query
   - Vision labels (if image scan)
   - Retrieved global docs
   - Retrieved personal docs
   - User metadata (location, language preference)

5. **LLM reasoning** — Groq (or other LLM) reads the full context and generates a tailored response.

6. **Return to user** — the response includes disposal instructions, recycler recommendations, and confidence scores.

## Benefits

- **Accuracy**: LLM answers are grounded in real documents, not just memorized training data.
- **Personalization**: Users get answers relevant to their location and uploaded docs.
- **Scalability**: Global knowledge is shared; personal knowledge is isolated and secure.
- **Freshness**: New documents can be added to global or personal RAG without retraining the LLM.

## Implementation details

### Vector DB backend

- **FAISS** (Facebook AI Similarity Search) is used for fast nearest-neighbor search.
- Alternative: could use Pinecone, Weaviate, or Qdrant for managed vector search.

### Initialization

Both vector DBs are initialized at backend startup (see `backend/app/main.py` lifespan):

```python
await global_rag_vector_db.initialize()
await personal_rag_vector_db.initialize()
```

### Code locations

- Global RAG: `backend/app/rag/global_rag_vector_db.py`
- Personal RAG: `backend/app/rag/personal_rag_vector_db.py`
- Query logic: `backend/app/api/scan_routes.py` (scan_image, voice_input, rag_query endpoints)

### Example query flow (scan_image endpoint)

```python
# 1. Get embeddings from CLIP
vision_result = await vision_service.classify_image(image_bytes)

# 2. Query global RAG
global_docs = await global_rag_vector_db.similarity_search(
    query_vector=vision_result["embedding"],
    top_k=3
)

# 3. Query personal RAG (if user has docs)
personal_docs = await personal_rag_vector_db.similarity_search(
    user_id=user_id,
    query_vector=vision_result["embedding"],
    top_k=2
)

# 4. Merge and pass to LLM
llm_response = await llm_service.reason_about_waste(
    query="What should I do with this item?",
    vision_labels=vision_result["labels"],
    global_docs=global_docs,
    personal_docs=personal_docs,
    ...
)
```

## Adding documents

### Global documents

Admins can add docs via backend script or API:

```python
await global_rag_vector_db.add_document(
    text="Plastic bottles (PET) can be recycled...",
    metadata={"category": "plastic", "source": "EPA guidelines"}
)
```

### Personal documents

Users upload docs through the frontend (or API):

```python
await personal_rag_vector_db.add_document(
    user_id="user123",
    text="My local center accepts glass on Tuesdays only.",
    metadata={"type": "local_info"}
)
```

## Security & isolation

- Personal RAG queries are scoped by `user_id` — users cannot access other users' documents.
- Global RAG is read-only for users; write access restricted to admins.

## Performance considerations

- **Indexing**: FAISS builds an index at startup; large document sets may take a few seconds to load.
- **Query speed**: Similarity search is fast (sub-millisecond for small datasets, <100ms for large).
- **Scaling**: For production, consider sharding personal RAG by user or using a managed vector DB service.

## Future improvements

- **Hybrid search**: Combine dense (vector) and sparse (keyword) retrieval for better recall.
- **Re-ranking**: Use a cross-encoder to re-rank retrieved docs before sending to LLM.
- **Feedback loop**: Let users rate LLM responses; use feedback to improve document relevance.
- **Auto-ingestion**: Crawl official recycling websites and auto-populate global RAG.

## Troubleshooting

- **No results from personal RAG**: User may not have uploaded any documents yet. Fallback to global RAG only.
- **Poor relevance**: Check embedding quality; consider fine-tuning the embedding model on waste-domain data.
- **Slow queries**: Profile FAISS index type; switch from flat to IVF (inverted file) index for large datasets.

---

For questions or contributions, see the main `docs/README.md` or reach out to the team.
