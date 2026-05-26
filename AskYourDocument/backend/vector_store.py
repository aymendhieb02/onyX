"""Vector store operations with ChromaDB and an in-memory fallback."""

import os
import math
from typing import List, Dict

try:
    import chromadb
    from chromadb.config import Settings
    CHROMADB_AVAILABLE = True
    CHROMADB_IMPORT_ERROR = None
except Exception as exc:
    chromadb = None
    Settings = None
    CHROMADB_AVAILABLE = False
    CHROMADB_IMPORT_ERROR = exc


class VectorStore:
    """Manages vector storage and retrieval.

    ChromaDB is used when available. On hosted environments where ChromaDB
    cannot import cleanly, the app falls back to in-memory cosine search so
    uploads, Q&A, citations, and quizzes can still work.
    """

    def __init__(self, collection_name: str = "documents"):
        """Initialize the vector store.

        Args:
            collection_name: Name of the ChromaDB collection.
        """
        self.collection_name = collection_name
        self._use_chromadb = CHROMADB_AVAILABLE
        self._memory_documents = []
        self._total_chunks = 0

        if not self._use_chromadb:
            print(f"ChromaDB unavailable, using in-memory vector store: {CHROMADB_IMPORT_ERROR}")
            return

        # Create persistent client - use absolute path relative to this file's location
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(current_dir)  # Go up one level from backend/ to AskYourDocument/
        persist_directory = os.path.abspath(os.path.join(project_root, "chroma_db"))
        os.makedirs(persist_directory, exist_ok=True)

        try:
            self.client = chromadb.PersistentClient(
                path=persist_directory,
                settings=Settings(anonymized_telemetry=False)
            )

            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"}
            )
        except Exception as e:
            # If there's a connection error (like tenant issues), try to reset the database
            if "tenant" in str(e).lower() or "could not connect" in str(e).lower():
                import shutil
                # Backup and remove the corrupted database
                if os.path.exists(persist_directory):
                    try:
                        backup_dir = persist_directory + "_backup"
                        if os.path.exists(backup_dir):
                            shutil.rmtree(backup_dir)
                        shutil.move(persist_directory, backup_dir)
                    except:
                        pass
                    os.makedirs(persist_directory, exist_ok=True)
                
                # Try again with fresh database
                self.client = chromadb.PersistentClient(
                    path=persist_directory,
                    settings=Settings(anonymized_telemetry=False)
                )
                self.collection = self.client.get_or_create_collection(
                    name=collection_name,
                    metadata={"hnsw:space": "cosine"}
                )
            else:
                print(f"ChromaDB initialization failed, using in-memory vector store: {e}")
                self._use_chromadb = False

    def add_documents(self, chunks: List[Dict], embeddings: List[List[float]]):
        """Add document chunks with embeddings to the vector store.

        Args:
            chunks: List of chunk dictionaries with 'text', 'start', 'end', 'chunk_index'.
            embeddings: List of embedding vectors for each chunk.
        """
        if not chunks or not embeddings:
            return

        if not self._use_chromadb:
            for chunk, embedding in zip(chunks, embeddings):
                self._memory_documents.append({
                    "text": chunk["text"],
                    "embedding": embedding,
                    "metadata": {
                        "start": chunk["start"],
                        "end": chunk["end"],
                        "chunk_index": chunk["chunk_index"]
                    }
                })
            self._total_chunks = len(self._memory_documents)
            return

        ids = [f"chunk_{chunk['chunk_index']}" for chunk in chunks]
        texts = [chunk['text'] for chunk in chunks]
        metadatas = [
            {
                'start': chunk['start'],
                'end': chunk['end'],
                'chunk_index': chunk['chunk_index']
            }
            for chunk in chunks
        ]

        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas
        )
        self._total_chunks = self.collection.count()

    def search(self, query_embedding: List[float], n_results: int = 3) -> List[Dict]:
        """Search for similar chunks.

        Args:
            query_embedding: Embedding vector of the query.
            n_results: Number of results to return (can be up to collection size).

        Returns:
            List of dictionaries containing matching chunks and metadata.
        """
        if not self._use_chromadb:
            scored_results = []
            for item in self._memory_documents:
                similarity = self._cosine_similarity(query_embedding, item["embedding"])
                scored_results.append({
                    "text": item["text"],
                    "metadata": item["metadata"],
                    "distance": 1 - similarity
                })
            scored_results.sort(key=lambda result: result["distance"])
            return scored_results[:n_results]

        # Get collection count to ensure we don't request more than available
        try:
            collection_count = self.collection.count()
            n_results = min(n_results, collection_count) if collection_count > 0 else n_results
        except:
            pass  # If count fails, just use the requested n_results
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )

        # Format results
        formatted_results = []
        if results['documents'] and results['documents'][0]:
            for i in range(len(results['documents'][0])):
                formatted_results.append({
                    'text': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                    'distance': results['distances'][0][i] if results['distances'] else None
                })

        return formatted_results

    def clear(self):
        """Clear all documents from the collection."""
        self._memory_documents = []
        self._total_chunks = 0

        if not self._use_chromadb:
            return

        # Delete and recreate collection
        try:
            self.client.delete_collection(name=self.collection.name)
        except:
            pass
        self.collection = self.client.get_or_create_collection(
            name=self.collection.name,
            metadata={"hnsw:space": "cosine"}
        )

    @staticmethod
    def _cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        """Return cosine similarity for two embedding vectors."""
        if not vec_a or not vec_b:
            return 0.0

        length = min(len(vec_a), len(vec_b))
        dot_product = sum(vec_a[i] * vec_b[i] for i in range(length))
        norm_a = math.sqrt(sum(vec_a[i] * vec_a[i] for i in range(length)))
        norm_b = math.sqrt(sum(vec_b[i] * vec_b[i] for i in range(length)))

        if norm_a == 0 or norm_b == 0:
            return 0.0

        return dot_product / (norm_a * norm_b)

