"""
RAG (Retrieval-Augmented Generation) service
"""
import logging
from typing import List, Dict, Optional, Tuple
import numpy as np
from datetime import datetime

from app.services.database import (
    get_rag_global_collection,
    get_rag_personal_collection
)
from app.services.vector_db import global_rag_vector_db, personal_rag_vector_db
from app.models.rag_models import GlobalRAGDocument, PersonalRAGDocument
from bson import ObjectId

logger = logging.getLogger(__name__)


class RAGService:
    """Service for RAG document retrieval"""
    
    def __init__(self):
        self.initialized = False
    
    async def initialize(self):
        """Initialize RAG service and vector DBs"""
        try:
            logger.info("Initializing RAG service")
            
            # Initialize vector databases
            await global_rag_vector_db.initialize()
            await personal_rag_vector_db.initialize()
            
            # Load existing embeddings from MongoDB into FAISS
            await self._load_existing_embeddings()
            
            self.initialized = True
            logger.info("RAG service initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize RAG service: {e}")
            raise
    
    async def _load_existing_embeddings(self):
        """Load existing embeddings from MongoDB into FAISS"""
        try:
            # Load global documents
            global_collection = get_rag_global_collection()
            global_docs = await global_collection.find({"embedding": {"$exists": True, "$ne": None}}).to_list(length=None)
            
            if global_docs:
                doc_ids = []
                embeddings = []
                metadata = []
                
                for doc in global_docs:
                    doc_id = str(doc["_id"])
                    embedding = doc.get("embedding")
                    
                    if embedding and len(embedding) == 512:
                        doc_ids.append(doc_id)
                        embeddings.append(embedding)
                        metadata.append({
                            "title": doc.get("title", doc.get("content", "")[:50]),
                            "category": doc.get("category", "")
                        })
                
                if embeddings:
                    embeddings_array = np.array(embeddings, dtype=np.float32)
                    await global_rag_vector_db.insert(
                        ids=doc_ids,
                        embeddings=embeddings_array,
                        metadata=metadata
                    )
                    logger.info(f"Loaded {len(embeddings)} global documents into vector DB")
            
            # Load personal documents
            personal_collection = get_rag_personal_collection()
            personal_docs = await personal_collection.find({"embedding": {"$exists": True, "$ne": None}}).to_list(length=None)
            
            if personal_docs:
                doc_ids = []
                embeddings = []
                metadata = []
                
                for doc in personal_docs:
                    doc_id = str(doc["_id"])
                    embedding = doc.get("embedding")
                    
                    if embedding and len(embedding) == 512:
                        doc_ids.append(doc_id)
                        embeddings.append(embedding)
                        metadata.append({
                            "user_id": str(doc.get("user_id", "")),
                            "doc_type": doc.get("doc_type", "")
                        })
                
                if embeddings:
                    embeddings_array = np.array(embeddings, dtype=np.float32)
                    await personal_rag_vector_db.insert(
                        ids=doc_ids,
                        embeddings=embeddings_array,
                        metadata=metadata
                    )
                    logger.info(f"Loaded {len(embeddings)} personal documents into vector DB")
                    
        except Exception as e:
            logger.error(f"Failed to load existing embeddings: {e}")
            # Don't raise - allow service to continue with empty vector DB
    
    async def add_global_document(
        self,
        title: str,
        content: str,
        category: str,
        embedding: np.ndarray,
        tags: List[str] = None,
        city: Optional[str] = None,
        ward: Optional[str] = None
    ) -> str:
        """
        Add document to global knowledge base
        
        Returns:
            Document ID
        """
        try:
            # Create document
            doc = GlobalRAGDocument(
                title=title,
                content=content,
                category=category,
                tags=tags or [],
                city=city,
                ward=ward
            )
            
            # Insert into MongoDB
            collection = get_rag_global_collection()
            result = await collection.insert_one(doc.model_dump(by_alias=True, exclude=["id"]))
            doc_id = str(result.inserted_id)
            
            # Update with embedding ID
            await collection.update_one(
                {"_id": ObjectId(doc_id)},
                {"$set": {"embedding_id": doc_id}}
            )
            
            # Insert embedding into vector DB
            await global_rag_vector_db.insert(
                ids=[doc_id],
                embeddings=embedding.reshape(1, -1),
                metadata=[{"title": title, "category": category}]
            )
            
            logger.info(f"Added global RAG document: {doc_id}")
            return doc_id
            
        except Exception as e:
            logger.error(f"Failed to add global document: {e}")
            raise
    
    async def add_personal_document(
        self,
        user_id: str,
        content: str,
        doc_type: str,
        embedding: np.ndarray,
        material: Optional[str] = None,
        location: Optional[Dict] = None
    ) -> str:
        """
        Add document to personal RAG
        
        Returns:
            Document ID
        """
        try:
            # Create document
            doc = PersonalRAGDocument(
                user_id=ObjectId(user_id),
                content=content,
                doc_type=doc_type,
                material=material,
                location=location
            )
            
            # Insert into MongoDB
            collection = get_rag_personal_collection()
            result = await collection.insert_one(doc.model_dump(by_alias=True, exclude=["id"]))
            doc_id = str(result.inserted_id)
            
            # Update with embedding ID
            await collection.update_one(
                {"_id": ObjectId(doc_id)},
                {"$set": {"embedding_id": doc_id}}
            )
            
            # Insert embedding into vector DB
            await personal_rag_vector_db.insert(
                ids=[doc_id],
                embeddings=embedding.reshape(1, -1),
                metadata={"user_id": user_id, "doc_type": doc_type}
            )
            
            logger.info(f"Added personal RAG document: {doc_id}")
            return doc_id
            
        except Exception as e:
            logger.error(f"Failed to add personal document: {e}")
            raise
    
    async def retrieve_global(
        self,
        query_embedding: np.ndarray,
        top_k: int = 5,
        category: Optional[str] = None,
        city: Optional[str] = None
    ) -> List[Dict]:
        """
        Retrieve relevant documents from global RAG
        
        Returns:
            List of documents with scores
        """
        try:
            if not self.initialized:
                await self.initialize()
            
            # Search vector DB
            results = await global_rag_vector_db.search(query_embedding, top_k=top_k * 2)
            
            # Fetch documents from MongoDB
            doc_ids = [ObjectId(doc_id) for doc_id, _ in results]
            collection = get_rag_global_collection()
            
            # Build filter
            filter_query = {"_id": {"$in": doc_ids}}
            if category:
                filter_query["category"] = category
            if city:
                filter_query["$or"] = [
                    {"city": city},
                    {"city": None}  # Also get generic docs
                ]
            
            cursor = collection.find(filter_query)
            docs = await cursor.to_list(length=top_k * 2)
            
            # Combine with scores
            score_map = {doc_id: score for doc_id, score in results}
            
            output = []
            for doc in docs:
                doc_id = str(doc["_id"])
                if doc_id in score_map:
                    output.append({
                        "id": doc_id,
                        "title": doc.get("title", ""),
                        "content": doc.get("content", ""),
                        "category": doc.get("category", ""),
                        "score": score_map[doc_id]
                    })
            
            # Sort by score and limit
            output.sort(key=lambda x: x["score"], reverse=True)
            return output[:top_k]
            
        except Exception as e:
            logger.error(f"Failed to retrieve global documents: {e}")
            return []
    
    async def retrieve_personal(
        self,
        user_id: str,
        query_embedding: np.ndarray,
        top_k: int = 3,
        doc_type: Optional[str] = None
    ) -> List[Dict]:
        """
        Retrieve relevant documents from personal RAG
        
        Returns:
            List of documents with scores
        """
        try:
            if not self.initialized:
                await self.initialize()
            
            # Search vector DB
            results = await personal_rag_vector_db.search(query_embedding, top_k=top_k * 2)
            
            # Fetch documents from MongoDB
            doc_ids = [ObjectId(doc_id) for doc_id, _ in results]
            collection = get_rag_personal_collection()
            
            # Build filter
            filter_query = {
                "_id": {"$in": doc_ids},
                "user_id": ObjectId(user_id)
            }
            if doc_type:
                filter_query["doc_type"] = doc_type
            
            cursor = collection.find(filter_query)
            docs = await cursor.to_list(length=top_k * 2)
            
            # Combine with scores
            score_map = {doc_id: score for doc_id, score in results}
            
            output = []
            for doc in docs:
                doc_id = str(doc["_id"])
                if doc_id in score_map:
                    output.append({
                        "id": doc_id,
                        "content": doc.get("content", ""),
                        "doc_type": doc.get("doc_type", ""),
                        "score": score_map[doc_id]
                    })
                    
                    # Increment relevance count
                    await collection.update_one(
                        {"_id": ObjectId(doc_id)},
                        {"$inc": {"relevance_count": 1}}
                    )
            
            # Sort by score and limit
            output.sort(key=lambda x: x["score"], reverse=True)
            return output[:top_k]
            
        except Exception as e:
            logger.error(f"Failed to retrieve personal documents: {e}")
            return []
    
    async def dual_retrieve(
        self,
        user_id: str,
        query_embedding: np.ndarray,
        global_top_k: int = 5,
        personal_top_k: int = 3,
        category: Optional[str] = None,
        city: Optional[str] = None
    ) -> Tuple[List[Dict], List[Dict]]:
        """
        Retrieve from both global and personal RAG
        
        Returns:
            (global_docs, personal_docs)
        """
        try:
            # Retrieve in parallel
            import asyncio
            
            global_task = self.retrieve_global(
                query_embedding,
                top_k=global_top_k,
                category=category,
                city=city
            )
            personal_task = self.retrieve_personal(
                user_id,
                query_embedding,
                top_k=personal_top_k
            )
            
            global_docs, personal_docs = await asyncio.gather(global_task, personal_task)
            
            return global_docs, personal_docs
            
        except Exception as e:
            logger.error(f"Dual retrieval failed: {e}")
            return [], []


# Global RAG service instance
rag_service = RAGService()
