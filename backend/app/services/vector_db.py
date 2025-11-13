"""
Vector database service - supports Milvus and FAISS
"""
import numpy as np
import logging
from typing import List, Tuple, Optional
from app.config import settings

logger = logging.getLogger(__name__)


class VectorDB:
    """Abstract vector database interface"""
    
    def __init__(self):
        self.initialized = False
        self.dimension = 768  # CLIP embedding dimension
    
    async def initialize(self):
        """Initialize the vector database"""
        raise NotImplementedError
    
    async def insert(self, ids: List[str], embeddings: np.ndarray, metadata: Optional[List[dict]] = None):
        """Insert vectors"""
        raise NotImplementedError
    
    async def search(self, query_embedding: np.ndarray, top_k: int = 10) -> List[Tuple[str, float]]:
        """Search for similar vectors"""
        raise NotImplementedError
    
    async def delete(self, ids: List[str]):
        """Delete vectors"""
        raise NotImplementedError


class FAISSVectorDB(VectorDB):
    """FAISS-based vector database (local, file-based)"""
    
    def __init__(self):
        super().__init__()
        self.index = None
        self.id_map = {}  # maps FAISS index to document ID
        self.reverse_map = {}  # maps document ID to FAISS index
        self.metadata_store = {}  # stores metadata for each ID
        
    async def initialize(self):
        """Initialize FAISS index"""
        try:
            import faiss
            
            # Create FAISS index (L2 distance)
            self.index = faiss.IndexFlatL2(self.dimension)
            
            # Wrap with ID map for string IDs
            self.index = faiss.IndexIDMap(self.index)
            
            self.initialized = True
            logger.info(f"Initialized FAISS vector DB (dimension={self.dimension})")
            
        except Exception as e:
            logger.error(f"Failed to initialize FAISS: {e}")
            raise
    
    async def insert(self, ids: List[str], embeddings: np.ndarray, metadata: Optional[List[dict]] = None):
        """Insert vectors into FAISS"""
        try:
            if not self.initialized:
                await self.initialize()
            
            # Convert embeddings to float32
            embeddings = embeddings.astype('float32')
            
            # Normalize embeddings for cosine similarity
            faiss.normalize_L2(embeddings)
            
            # Generate numeric IDs
            start_idx = len(self.id_map)
            numeric_ids = np.arange(start_idx, start_idx + len(ids), dtype='int64')
            
            # Add to index
            self.index.add_with_ids(embeddings, numeric_ids)
            
            # Update mappings
            for i, doc_id in enumerate(ids):
                numeric_id = int(numeric_ids[i])
                self.id_map[numeric_id] = doc_id
                self.reverse_map[doc_id] = numeric_id
                
                if metadata:
                    self.metadata_store[doc_id] = metadata[i]
            
            logger.info(f"Inserted {len(ids)} vectors into FAISS")
            
        except Exception as e:
            logger.error(f"Failed to insert into FAISS: {e}")
            raise
    
    async def search(self, query_embedding: np.ndarray, top_k: int = 10) -> List[Tuple[str, float]]:
        """Search FAISS for similar vectors"""
        try:
            if not self.initialized:
                await self.initialize()
            
            # Convert to float32 and normalize
            import faiss
            query_embedding = query_embedding.astype('float32').reshape(1, -1)
            faiss.normalize_L2(query_embedding)
            
            # Search
            distances, indices = self.index.search(query_embedding, top_k)
            
            # Convert to document IDs
            results = []
            for i, idx in enumerate(indices[0]):
                if idx != -1 and int(idx) in self.id_map:
                    doc_id = self.id_map[int(idx)]
                    score = float(1 / (1 + distances[0][i]))  # Convert distance to similarity
                    results.append((doc_id, score))
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to search FAISS: {e}")
            return []
    
    async def delete(self, ids: List[str]):
        """Delete vectors from FAISS"""
        try:
            # FAISS doesn't support efficient deletion
            # For production, rebuild index without deleted IDs
            for doc_id in ids:
                if doc_id in self.reverse_map:
                    numeric_id = self.reverse_map[doc_id]
                    del self.id_map[numeric_id]
                    del self.reverse_map[doc_id]
                    if doc_id in self.metadata_store:
                        del self.metadata_store[doc_id]
            
            logger.info(f"Marked {len(ids)} vectors for deletion in FAISS")
            
        except Exception as e:
            logger.error(f"Failed to delete from FAISS: {e}")


class MilvusVectorDB(VectorDB):
    """Milvus-based vector database (production-ready)"""
    
    def __init__(self):
        super().__init__()
        self.collection_name = "renova_embeddings"
        self.collection = None
        
    async def initialize(self):
        """Initialize Milvus connection"""
        try:
            from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType
            
            # Connect to Milvus
            connections.connect(
                alias="default",
                host=settings.MILVUS_HOST,
                port=settings.MILVUS_PORT
            )
            
            # Define schema
            fields = [
                FieldSchema(name="id", dtype=DataType.VARCHAR, is_primary=True, max_length=100),
                FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=self.dimension),
                FieldSchema(name="metadata", dtype=DataType.JSON)
            ]
            schema = CollectionSchema(fields, description="ReNova embeddings")
            
            # Create or load collection
            from pymilvus import utility
            if utility.has_collection(self.collection_name):
                self.collection = Collection(self.collection_name)
            else:
                self.collection = Collection(self.collection_name, schema)
                
                # Create index
                index_params = {
                    "index_type": "IVF_FLAT",
                    "metric_type": "L2",
                    "params": {"nlist": 128}
                }
                self.collection.create_index("embedding", index_params)
            
            # Load collection
            self.collection.load()
            
            self.initialized = True
            logger.info(f"Initialized Milvus vector DB: {self.collection_name}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Milvus: {e}")
            raise
    
    async def insert(self, ids: List[str], embeddings: np.ndarray, metadata: Optional[List[dict]] = None):
        """Insert vectors into Milvus"""
        try:
            if not self.initialized:
                await self.initialize()
            
            # Prepare data
            if metadata is None:
                metadata = [{}] * len(ids)
            
            data = [
                ids,
                embeddings.tolist(),
                metadata
            ]
            
            # Insert
            self.collection.insert(data)
            self.collection.flush()
            
            logger.info(f"Inserted {len(ids)} vectors into Milvus")
            
        except Exception as e:
            logger.error(f"Failed to insert into Milvus: {e}")
            raise
    
    async def search(self, query_embedding: np.ndarray, top_k: int = 10) -> List[Tuple[str, float]]:
        """Search Milvus for similar vectors"""
        try:
            if not self.initialized:
                await self.initialize()
            
            # Search parameters
            search_params = {"metric_type": "L2", "params": {"nprobe": 10}}
            
            # Search
            results = self.collection.search(
                data=[query_embedding.tolist()],
                anns_field="embedding",
                param=search_params,
                limit=top_k,
                output_fields=["id"]
            )
            
            # Format results
            output = []
            for hits in results:
                for hit in hits:
                    doc_id = hit.id
                    distance = hit.distance
                    score = float(1 / (1 + distance))  # Convert to similarity
                    output.append((doc_id, score))
            
            return output
            
        except Exception as e:
            logger.error(f"Failed to search Milvus: {e}")
            return []
    
    async def delete(self, ids: List[str]):
        """Delete vectors from Milvus"""
        try:
            if not self.initialized:
                await self.initialize()
            
            # Delete by IDs
            expr = f"id in {ids}"
            self.collection.delete(expr)
            
            logger.info(f"Deleted {len(ids)} vectors from Milvus")
            
        except Exception as e:
            logger.error(f"Failed to delete from Milvus: {e}")


# Factory function to get the appropriate vector DB
def get_vector_db() -> VectorDB:
    """Get vector database instance based on config"""
    if settings.VECTOR_DB.lower() == "milvus":
        return MilvusVectorDB()
    else:
        return FAISSVectorDB()


# Global vector DB instances
global_rag_vector_db = get_vector_db()
personal_rag_vector_db = get_vector_db()
