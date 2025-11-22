"""Vector store operations using ChromaDB."""

import os
from typing import List, Dict, Optional
import chromadb
from chromadb.config import Settings


class VectorStore:
    """Manages vector storage and retrieval using ChromaDB."""

    def __init__(self, collection_name: str = "documents"):
        """Initialize the vector store.

        Args:
            collection_name: Name of the ChromaDB collection.
        """
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
                raise

    def add_documents(self, chunks: List[Dict], embeddings: List[List[float]]):
        """Add document chunks with embeddings to the vector store.

        Args:
            chunks: List of chunk dictionaries with 'text', 'start', 'end', 'chunk_index'.
            embeddings: List of embedding vectors for each chunk.
        """
        if not chunks or not embeddings:
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

    def search(self, query_embedding: List[float], n_results: int = 3) -> List[Dict]:
        """Search for similar chunks.

        Args:
            query_embedding: Embedding vector of the query.
            n_results: Number of results to return (can be up to collection size).

        Returns:
            List of dictionaries containing matching chunks and metadata.
        """
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
        # Delete and recreate collection
        try:
            self.client.delete_collection(name=self.collection.name)
        except:
            pass
        self.collection = self.client.get_or_create_collection(
            name=self.collection.name,
            metadata={"hnsw:space": "cosine"}
        )

