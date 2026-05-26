"""RAG (Retrieval-Augmented Generation) pipeline implementation with multiple provider support."""

import os
import requests
from typing import List, Dict, Optional

from .vector_store import VectorStore
from .document_processor import chunk_text

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Try to import optional dependencies
try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False


class RAGPipeline:
    """Main RAG pipeline for document Q&A with support for multiple providers."""

    def __init__(self):
        """Initialize the RAG pipeline."""
        self.vector_store = VectorStore()
        
        # Determine which provider to use
        self.provider = os.getenv("AI_PROVIDER", "groq").lower()  # Default to Groq (free)
        self.embedding_model = None
        self._local_embeddings_failed = False  # Flag to prevent infinite recursion
        self._fallback_warning_shown = False  # Flag to prevent spam warnings
        
        # Initialize embedding model
        self._init_embeddings()
        
        # Initialize chat model
        self._init_chat_model()

    def _init_embeddings(self):
        """Initialize embedding model based on provider."""
        use_local = os.getenv("USE_LOCAL_EMBEDDINGS", "false").lower() == "true"
        
        # Prevent infinite recursion if local embeddings already failed
        if self._local_embeddings_failed:
            use_local = False
            print("⚠️ Local embeddings previously failed, using API-based embeddings")
        
        if self.provider == "local" or use_local:
            # Use local sentence-transformers (completely free, no API needed!)
            if HAS_SENTENCE_TRANSFORMERS:
                try:
                    # Set environment variables BEFORE loading to prevent meta tensor issues
                    import os as os_module
                    os_module.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'expandable_segments:True'
                    
                    # Try loading with explicit CPU device and model_kwargs to avoid meta device
                    try:
                        # Load model with device='cpu' and avoid meta device initialization
                        self.embedding_model = SentenceTransformer(
                            'all-MiniLM-L6-v2',
                            device='cpu',
                            model_kwargs={'torch_dtype': None}  # Avoid meta device
                        )
                    except Exception:
                        # Alternative: Load without device, then manually ensure CPU
                        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
                        # Ensure all modules are on CPU
                        if hasattr(self.embedding_model, 'to'):
                            try:
                                self.embedding_model.to('cpu')
                            except:
                                pass
                    
                    print(f"✅ Using local embeddings (sentence-transformers) on CPU")
                except Exception as e:
                    error_msg = str(e)
                    if "meta tensor" in error_msg.lower() or "to_empty" in error_msg.lower():
                        # Suppress detailed error for known PyTorch issue
                        print("⚠️ Local embeddings unavailable (PyTorch compatibility issue)")
                    else:
                        print(f"⚠️ Could not load local embeddings: {error_msg[:100]}")
                    print("✅ Using API-based embeddings")
                    self._local_embeddings_failed = True
                    # Disable local embeddings for this session
                    if self.provider == "local":
                        self.provider = "groq"
                    # Don't recursively call _init_embeddings - just use API embeddings
            else:
                print("⚠️ sentence-transformers not installed. Install with: pip install sentence-transformers")
                self._local_embeddings_failed = True
                if self.provider == "local":
                    self.provider = "groq"
                print(f"✅ Using {self.provider} for embeddings (API-based)")
        else:
            print(f"✅ Using {self.provider} for embeddings")

    def _init_chat_model(self):
        """Initialize chat model (no initialization needed for API-based providers)."""
        pass

    def _get_embedding(self, text: str) -> List[float]:
        """Get embedding for text.

        Args:
            text: Text to embed.

        Returns:
            Embedding vector.
        """
        if self.embedding_model:
            # Local embeddings (sentence-transformers)
            return self.embedding_model.encode(text).tolist()
        
        # Try Groq API for embeddings first (if available)
        groq_api_key = os.getenv('GROQ_API_KEY', '')
        if groq_api_key and self.provider == "groq":
            try:
                # Use Groq's embedding API
                api_url = "https://api.groq.com/openai/v1/embeddings"
                headers = {
                    "Authorization": f"Bearer {groq_api_key}",
                    "Content-Type": "application/json"
                }
                response = requests.post(
                    api_url,
                    headers=headers,
                    json={"model": "text-embedding-3-small", "input": text},
                    timeout=10
                )
                if response.status_code == 200:
                    return response.json()["data"][0]["embedding"]
            except Exception:
                pass  # Fall through to HuggingFace or fallback
        
        # Try HuggingFace Inference API as fallback
        huggingface_key = os.getenv('HUGGINGFACE_API_KEY', '')
        if huggingface_key:
            try:
                api_url = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"
                headers = {"Authorization": f"Bearer {huggingface_key}"}
                response = requests.post(
                    api_url,
                    headers=headers,
                    json={"inputs": text, "options": {"wait_for_model": True}},
                    timeout=10
                )
                if response.status_code == 200:
                    return response.json()[0]
            except Exception:
                pass  # Fall through to simple embedding
        
        # Final fallback: use a simple hash-based embedding
        if not self._fallback_warning_shown:
            print("⚠️ Using fallback embeddings (API unavailable or rate-limited)")
            self._fallback_warning_shown = True
        return self._simple_embedding(text)

    def _simple_embedding(self, text: str) -> List[float]:
        """Simple fallback embedding (not great but works for testing)."""
        import hashlib
        # Use more of the text for better representation (but still limit for performance)
        text_sample = text[:2000] if len(text) > 2000 else text
        
        # Create a simple hash-based embedding using multiple hash passes
        hash_obj = hashlib.md5(text_sample.encode())
        hash_hex = hash_obj.hexdigest()
        
        # Also hash a sample from middle and end for better representation
        if len(text) > 2000:
            mid_sample = text[len(text)//2:len(text)//2+500]
            end_sample = text[-500:]
            hash_mid = hashlib.md5(mid_sample.encode()).hexdigest()
            hash_end = hashlib.md5(end_sample.encode()).hexdigest()
            # Combine hashes
            combined = hash_hex + hash_mid[:16] + hash_end[:16]
        else:
            combined = hash_hex
        
        # Convert to 384-dim vector (same as MiniLM)
        embedding = []
        for i in range(0, min(len(combined), 64), 2):
            if i+1 < len(combined):
                embedding.append(int(combined[i:i+2], 16) / 255.0)
        
        # Pad to 384 dimensions safely (prevent infinite loop)
        target_size = 384
        if len(embedding) < target_size:
            # Repeat pattern to fill
            pattern = embedding if embedding else [0.5] * 16
            while len(embedding) < target_size:
                needed = min(len(pattern), target_size - len(embedding))
                embedding.extend(pattern[:needed])
        
        return embedding[:target_size]

    def _get_chat_response(self, prompt: str) -> str:
        """Get chat response from the configured provider.

        Args:
            prompt: The prompt to send.

        Returns:
            The generated response.
        """
        if self.provider == "groq":
            return self._groq_chat(prompt)
        elif self.provider == "openrouter":
            return self._openrouter_chat(prompt)
        elif self.provider == "huggingface":
            return self._huggingface_chat(prompt)
        elif self.provider == "local":
            return "Local chat models not yet implemented. Please use 'groq', 'openrouter', or 'huggingface'."
        else:
            return self._groq_chat(prompt)  # Default to Groq

    def _groq_chat(self, prompt: str) -> str:
        """Get response from Groq API (FREE and FAST!).

        Args:
            prompt: The prompt to send.

        Returns:
            The generated response.
            
        Raises:
            ValueError: If API key is not found.
        """
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found. Please set it in Streamlit Cloud secrets or .env file. Get a free key at https://console.groq.com/keys")
        
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "llama-3.1-8b-instant",  # Free, fast model
            "messages": [
                {"role": "system", "content": "You are a helpful assistant that answers questions based on provided document context."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 500
        }
        
        try:
            response = requests.post(url, headers=headers, json=data, timeout=30)
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            else:
                return f"❌ Error: {response.status_code} - {response.text}"
        except Exception as e:
            return f"❌ Error calling Groq API: {str(e)}"

    def _openrouter_chat(self, prompt: str) -> str:
        """Get response from OpenRouter API.

        Args:
            prompt: The prompt to send.

        Returns:
            The generated response.
            
        Raises:
            ValueError: If API key is not found.
        """
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY not found. Please set it in Streamlit Cloud secrets or .env file. Get a free key at https://openrouter.ai/keys")
        
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8501",  # Optional
            "X-Title": "Ask Your Document"  # Optional
        }
        data = {
            "model": "google/gemini-flash-1.5-8b",  # Free model
            "messages": [
                {"role": "system", "content": "You are a helpful assistant that answers questions based on provided document context."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 500
        }
        
        try:
            response = requests.post(url, headers=headers, json=data, timeout=30)
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            else:
                return f"❌ Error: {response.status_code} - {response.text}"
        except Exception as e:
            return f"❌ Error calling OpenRouter API: {str(e)}"

    def _huggingface_chat(self, prompt: str) -> str:
        """Get response from HuggingFace Inference API.

        Args:
            prompt: The prompt to send.

        Returns:
            The generated response.
        """
        api_key = os.getenv("HUGGINGFACE_API_KEY")
        if not api_key:
            return "❌ Error: HUGGINGFACE_API_KEY not found. Get a free key at https://huggingface.co/settings/tokens"
        
        url = "https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct"
        headers = {"Authorization": f"Bearer {api_key}"}
        data = {"inputs": prompt}
        
        try:
            response = requests.post(url, headers=headers, json=data, timeout=60)
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get("generated_text", "No response generated")
                return str(result)
            else:
                return f"❌ Error: {response.status_code} - {response.text}"
        except Exception as e:
            return f"❌ Error calling HuggingFace API: {str(e)}"

    def process_document(self, text: str, progress_callback=None, max_chunks: int = 500) -> Dict:
        """Process and index a document.

        Args:
            text: Document text to process.
            progress_callback: Optional callback function(current, total, message) for progress updates.
            max_chunks: Maximum number of chunks to process (prevents memory issues).

        Returns:
            Dictionary with processing results.
        """
        try:
            # Store full text for context extraction
            self._last_processed_text = text
            
            # Clear previous documents
            self.vector_store.clear()

            # Chunk the document
            chunks = chunk_text(text)

            if not chunks:
                return {"success": False, "message": "Document is empty"}

            # Limit chunks to prevent memory issues
            original_count = len(chunks)
            if len(chunks) > max_chunks:
                chunks = chunks[:max_chunks]
                if progress_callback:
                    progress_callback(0, max_chunks, f"Limiting to {max_chunks} chunks (from {original_count})")

            total_chunks = len(chunks)
            
            # Generate embeddings for chunks in batches to prevent memory issues
            embeddings = []
            batch_size = 10  # Process 10 chunks at a time
            
            for batch_start in range(0, total_chunks, batch_size):
                batch_end = min(batch_start + batch_size, total_chunks)
                batch_chunks = chunks[batch_start:batch_end]
                
                # Process batch
                for i, chunk in enumerate(batch_chunks):
                    chunk_idx = batch_start + i
                    try:
                        # Use full chunk text (chunking already handles size limits)
                        chunk_text_limited = chunk['text']
                        
                        embedding = self._get_embedding(chunk_text_limited)
                        embeddings.append(embedding)
                        
                        # Update progress
                        if progress_callback:
                            progress_callback(chunk_idx + 1, total_chunks, f"Processing chunk {chunk_idx + 1}/{total_chunks}")
                    except Exception as e:
                        print(f"Error embedding chunk {chunk_idx}: {e}")
                        # Use fallback embedding with full chunk text
                        embeddings.append(self._simple_embedding(chunk['text']))
                
                # Small delay to prevent overwhelming the system
                import time
                time.sleep(0.1)

            # Store in vector database in batches to prevent memory issues
            if progress_callback:
                progress_callback(total_chunks, total_chunks, "Storing in database...")
            
            # Store chunks in smaller batches
            store_batch_size = 50
            for i in range(0, len(chunks), store_batch_size):
                batch_chunks = chunks[i:i+store_batch_size]
                batch_embeddings = embeddings[i:i+store_batch_size]
                self.vector_store.add_documents(batch_chunks, batch_embeddings)

            message = f"Document processed into {total_chunks} chunks"
            if original_count > max_chunks:
                message += f" (limited from {original_count})"
            message += f" using {self.provider}"

            # Store chunk count for visualization
            self.vector_store._total_chunks = total_chunks

            return {
                "success": True,
                "chunks_count": total_chunks,
                "message": message
            }
        except MemoryError:
            return {"success": False, "message": "Out of memory! File is too large. Please use a smaller document."}
        except Exception as e:
            return {"success": False, "message": f"Error processing document: {str(e)}"}

    def answer_question(self, question: str, include_sources: bool = True, 
                       conversation_context: List[Dict] = None,
                       perspective: str = "normal",
                       show_thoughts: bool = False) -> Dict:
        """Answer a question using RAG.

        Args:
            question: User's question.
            include_sources: Whether to include source citations.

        Returns:
            Dictionary with answer and optional sources.
        """
        # Get embedding for question
        question_embedding = self._get_embedding(question)

        # Search for relevant chunks - retrieve more for better context (increased to 20 for better coverage)
        all_candidate_chunks = self.vector_store.search(question_embedding, n_results=20)
        
        # Extract keywords from question for hybrid search
        question_lower = question.lower()
        keywords = [word for word in question_lower.split() if len(word) > 3]
        
        # Boost chunks that contain question keywords (hybrid semantic + keyword search)
        if keywords:
            # Create expanded terms for better matching
            expanded_terms = []
            for keyword in keywords:
                expanded_terms.append(keyword)
                # Add common variations/synonyms
                if 'use' in keyword or 'case' in keyword:
                    expanded_terms.extend(['application', 'usage', 'purpose', 'example', 'scenario'])
                if 'popular' in keyword:
                    expanded_terms.extend(['common', 'frequent', 'typical', 'widely', 'often'])
                if 'what' in question_lower:
                    expanded_terms.extend(['include', 'contains', 'features', 'has'])
            
            # Score chunks by both semantic similarity and keyword matches
            for chunk in all_candidate_chunks:
                chunk_text_lower = chunk['text'].lower()
                keyword_matches = sum(1 for term in expanded_terms if term in chunk_text_lower)
                # Boost relevance if keywords match
                if keyword_matches > 0:
                    # Reduce distance (increase relevance) for keyword matches
                    original_distance = chunk.get('distance', 1.0)
                    chunk['distance'] = max(0, original_distance - (keyword_matches * 0.1))
                    chunk['keyword_boost'] = keyword_matches
        
        # Sort by relevance (lower distance = more relevant)
        all_candidate_chunks.sort(key=lambda x: x.get('distance', 1.0))
        
        # Take top 15 most relevant chunks
        relevant_chunks = all_candidate_chunks[:15]

        if not relevant_chunks:
            return {
                "answer": "I couldn't find relevant information in the document to answer your question.",
                "sources": [],
                "confidence": 0.0
            }

        # Prepare context from chunks with better formatting
        context_parts = []
        for i, chunk in enumerate(relevant_chunks):
            chunk_text = chunk['text'].strip()
            similarity = chunk.get('distance', 1.0)
            similarity_pct = round((1 - similarity) * 100, 1) if similarity else 0
            context_parts.append(f"[Chunk {i+1} - Relevance: {similarity_pct}%]:\n{chunk_text}")
        
        context = "\n\n---\n\n".join(context_parts)

        # Handle conversational memory
        context_history = ""
        if conversation_context:
            recent_context = conversation_context[-3:]  # Last 3 exchanges
            context_history = "\n\nPrevious conversation:\n"
            for exchange in recent_context:
                if exchange.get('question'):
                    context_history += f"Q: {exchange['question']}\n"
                if exchange.get('answer'):
                    context_history += f"A: {exchange['answer'][:200]}...\n"
        
        # Handle perspective
        perspective_instruction = ""
        if perspective == "eli5":
            perspective_instruction = "Explain this in simple terms, as if explaining to a 5-year-old. Use simple words and analogies."
        elif perspective == "expert":
            perspective_instruction = "Provide a detailed, technical explanation suitable for an expert in the field. Include technical terminology and detailed analysis."
        elif perspective == "lawyer":
            perspective_instruction = "Explain this from a legal perspective. Focus on implications, requirements, and legal considerations."
        elif perspective == "poet":
            perspective_instruction = "Explain this in a creative, poetic way. Use metaphors and beautiful language."
        
        # Generate thought bubbles if requested
        thoughts = []
        if show_thoughts:
            thoughts.append("🔍 Searching document for relevant information...")
            thoughts.append(f"📚 Found {len(relevant_chunks)} relevant chunks")
            thoughts.append("🧠 Analyzing context and preparing answer...")
        
        # Generate answer using LLM with improved prompt
        base_prompt = f"""You are a helpful assistant that answers questions based on the provided document context.

Document Context:
{context}
{context_history}

Question: {question}
{perspective_instruction}

Instructions:
- Read ALL the chunks carefully - they may contain different parts of the answer.
- Answer the question using ONLY the information from the document context above.
- If information appears in multiple chunks, combine them to give a complete answer.
- Be thorough and include ALL relevant details from the document, even if they appear in different chunks.
- Look for related terms and synonyms - for example, "use cases" might be mentioned as "applications", "usage", "examples", "purposes", etc.
- If the question asks about a specific topic (like "popular use cases"), search through ALL chunks for any mention of that topic, even if the exact phrase isn't used.
- If you find partial information, include it. Don't say "not found" if you can find ANY related information.
- If the answer is truly not in the context, say "I cannot find this information in the document."
- When mentioning specific information, reference which chunk(s) it came from (e.g., "According to Chunk 1..." or "Chunks 2 and 3 mention...").

Answer:"""

        answer = self._get_chat_response(base_prompt)
        
        # Answer verification - cross-check with multiple chunks
        verification_result = self._verify_answer(answer, relevant_chunks)

        # Improved confidence calculation
        # Consider: top chunk similarity, average similarity, number of chunks, and verification
        if not relevant_chunks:
            confidence = 0.0
        else:
            # Get distances (ChromaDB cosine distance: 0 = identical, 2 = opposite, typically 0-1 for similar)
            distances = [chunk.get('distance', 1.0) for chunk in relevant_chunks]
            
            # Weight top 3 chunks more heavily (they're most relevant)
            top_3_distances = distances[:min(3, len(distances))]
            top_3_avg = sum(top_3_distances) / len(top_3_distances) if top_3_distances else 1.0
            
            # Average of all chunks
            avg_distance = sum(distances) / len(distances)
            
            # Convert distance to similarity (cosine distance 0-1 range, where 0 = most similar)
            # For cosine: similarity = 1 - distance (for normalized vectors)
            top_similarity = max(0, min(1, 1 - top_3_avg))
            avg_similarity = max(0, min(1, 1 - avg_distance))
            
            # Base confidence: weighted average (70% top chunks, 30% all chunks)
            base_confidence = (top_similarity * 0.7) + (avg_similarity * 0.3)
            
            # Boost for multiple chunks (more chunks = better coverage, but with diminishing returns)
            chunk_count_boost = min(0.15, len(relevant_chunks) * 0.01)  # Max 15% boost for 15+ chunks
            
            # Boost for verification consistency
            verification_boost = 0.0
            if verification_result.get('consistent'):
                verification_boost = 0.1  # 10% boost for verified answers
            elif verification_result.get('similarity_ratio', 0) > 50:
                verification_boost = 0.05  # 5% boost for partial verification
            
            # Penalty if answer says "cannot find" or similar
            answer_lower = answer.lower()
            if any(phrase in answer_lower for phrase in ["cannot find", "not in the document", "no information", "not found"]):
                base_confidence *= 0.5  # Halve confidence if answer indicates no info found
            
            # Final confidence calculation
            confidence = min(1.0, base_confidence + chunk_count_boost + verification_boost)
            
            # Ensure minimum confidence if we have chunks (at least 20% if we found something)
            if len(relevant_chunks) > 0 and base_confidence < 0.2:
                confidence = max(0.2, confidence)

        result = {
            "answer": answer,
            "confidence": round(confidence * 100, 1),
            "sources": [],
            "thoughts": thoughts if show_thoughts else [],
            "verification": verification_result,
            "chunks_used": len(relevant_chunks)
        }

        if include_sources:
            # Get full document text for context if available
            full_text = getattr(self, '_last_processed_text', '')
            
            result["sources"] = []
            for chunk in relevant_chunks:
                chunk_text = chunk['text']
                chunk_start = chunk['metadata'].get('start', 0)
                chunk_end = chunk['metadata'].get('end', 0)
                
                # Get before/after context if we have the full text
                before_context = ""
                after_context = ""
                if full_text and chunk_start > 0:
                    context_start = max(0, chunk_start - 200)  # 200 chars before
                    before_context = full_text[context_start:chunk_start].strip()
                    if before_context:
                        before_context = "..." + before_context[-150:]  # Last 150 chars
                
                if full_text and chunk_end < len(full_text):
                    context_end = min(len(full_text), chunk_end + 200)  # 200 chars after
                    after_context = full_text[chunk_end:context_end].strip()
                    if after_context:
                        after_context = after_context[:150] + "..."  # First 150 chars
                
                result["sources"].append({
                    "text": chunk_text,
                    "chunk_index": chunk['metadata'].get('chunk_index', 0),
                    "start": chunk_start,
                    "end": chunk_end,
                    "similarity": round((1 - chunk.get('distance', 1.0)) * 100, 1) if chunk.get('distance') else None,
                    "before_context": before_context,
                    "after_context": after_context
                })

        return result
    
    def generate_followup_questions(self, question: str, answer: str, document_context: str = None) -> List[str]:
        """Generate follow-up question suggestions based on the current question and answer.
        
        Args:
            question: The original question.
            answer: The answer that was provided.
            document_context: Optional context from the document.
            
        Returns:
            List of suggested follow-up questions.
        """
        prompt = f"""Based on this question and answer about a document, generate 3-5 concise follow-up questions that would help the user explore the document further.

Original Question: {question}

Answer Provided: {answer[:500]}

Generate 3-5 follow-up questions that:
- Are related to the original question
- Help explore different aspects of the topic
- Are specific and answerable from the document
- Are concise (one sentence each)

Format as a simple list, one question per line. Do not number them or add any prefixes."""

        try:
            response = self._get_chat_response(prompt)
            # Parse the response into a list of questions
            questions = [q.strip() for q in response.split('\n') if q.strip() and len(q.strip()) > 10]
            # Clean up questions (remove numbering, bullets, etc.)
            cleaned_questions = []
            for q in questions:
                # Remove common prefixes
                q = q.lstrip('0123456789.-•* ').strip()
                if q and q[0].isupper():  # Valid question should start with capital
                    cleaned_questions.append(q)
            
            # Return top 5 questions
            return cleaned_questions[:5]
        except Exception as e:
            print(f"Error generating follow-up questions: {e}")
            return []
    
    def generate_document_summary(self, text: str) -> Dict:
        """Generate a summary of the document.
        
        Args:
            text: The document text.
            
        Returns:
            Dictionary with summary, key_points, and suggested_questions.
        """
        # Limit text for summary generation (use first 5000 chars for efficiency)
        summary_text = text[:5000] if len(text) > 5000 else text
        
        prompt = f"""Analyze this document and provide:
1. A brief executive summary (2-3 sentences)
2. 5-7 key points (bullet points)
3. 3-5 suggested questions someone might want to ask about this document

Document (excerpt):
{summary_text}

Format your response as:
SUMMARY:
[Your summary here]

KEY POINTS:
- [Point 1]
- [Point 2]
...

SUGGESTED QUESTIONS:
1. [Question 1]
2. [Question 2]
..."""

        try:
            response = self._get_chat_response(prompt)
            
            # Check if response is an error
            if not response or response.startswith("❌ Error"):
                return {
                    "summary": "Summary could not be generated. Please check your API key configuration.",
                    "key_points": [],
                    "suggested_questions": []
                }
            
            # Parse the response
            summary = ""
            key_points = []
            suggested_questions = []
            
            current_section = None
            for line in response.split('\n'):
                line = line.strip()
                if not line:
                    continue
                
                if 'SUMMARY:' in line.upper():
                    current_section = 'summary'
                    summary = line.split(':', 1)[1].strip() if ':' in line else ""
                elif 'KEY POINTS:' in line.upper():
                    current_section = 'key_points'
                elif 'SUGGESTED QUESTIONS:' in line.upper():
                    current_section = 'questions'
                elif current_section == 'summary':
                    if summary:
                        summary += " " + line
                    else:
                        summary = line
                elif current_section == 'key_points':
                    if line.startswith('-') or line.startswith('•') or line.startswith('*'):
                        point = line.lstrip('-•* ').strip()
                        if point:
                            key_points.append(point)
                elif current_section == 'questions':
                    # Remove numbering
                    question = line.lstrip('0123456789.-) ').strip()
                    if question and question[0].isupper():
                        suggested_questions.append(question)
            
            return {
                "summary": summary or "Summary could not be generated.",
                "key_points": key_points[:7] if key_points else [],
                "suggested_questions": suggested_questions[:5] if suggested_questions else []
            }
        except Exception as e:
            print(f"Error generating document summary: {e}")
            return {
                "summary": "Summary generation failed.",
                "key_points": [],
                "suggested_questions": []
            }
    
    def _verify_answer(self, answer: str, chunks: List[Dict]) -> Dict:
        """Verify answer by cross-checking with multiple chunks.
        
        Args:
            answer: The generated answer.
            chunks: List of chunks used.
            
        Returns:
            Verification result with consistency check.
        """
        if len(chunks) < 2:
            return {"consistent": True, "message": "Single source - cannot verify"}
        
        # Check if answer mentions concepts from multiple chunks
        answer_lower = answer.lower()
        chunk_texts = [chunk['text'].lower() for chunk in chunks[:5]]  # Check top 5
        
        # Simple verification: check if key terms from answer appear in chunks
        answer_words = set([w for w in answer_lower.split() if len(w) > 4])
        chunk_words = set()
        for chunk_text in chunk_texts:
            chunk_words.update([w for w in chunk_text.split() if len(w) > 4])
        
        overlap = len(answer_words.intersection(chunk_words))
        total_unique = len(answer_words.union(chunk_words))
        similarity_ratio = overlap / total_unique if total_unique > 0 else 0
        
        consistent = similarity_ratio > 0.3  # At least 30% overlap
        
        return {
            "consistent": consistent,
            "similarity_ratio": round(similarity_ratio * 100, 1),
            "message": "Answer is consistent with document" if consistent else "Answer may contain information not in document"
        }
    
    def rewrite_query(self, question: str, confidence: float) -> List[str]:
        """Suggest query rewrites if confidence is low.
        
        Args:
            question: Original question.
            confidence: Confidence score (0-100).
            
        Returns:
            List of suggested rewritten questions.
        """
        if confidence >= 50:
            return []  # Don't suggest if confidence is good
        
        prompt = f"""The user asked: "{question}"
The answer had low confidence ({confidence}%).

Suggest 3 alternative ways to rephrase this question that might yield better results. Make them:
- More specific
- Use different keywords
- Ask the same thing in a different way

Format as a simple list, one question per line."""

        try:
            response = self._get_chat_response(prompt)
            questions = [q.strip().lstrip('0123456789.-) ').strip() 
                        for q in response.split('\n') 
                        if q.strip() and len(q.strip()) > 10 and q.strip()[0].isupper()]
            return questions[:3]
        except:
            return []
    
    def get_chunk_visualization(self) -> Dict:
        """Get chunking information for visualization.
        
        Returns:
            Dictionary with chunking metadata.
        """
        try:
            # Get all chunks from vector store
            # This is a simplified version - in production, you'd store chunk metadata
            return {
                "total_chunks": getattr(self.vector_store, '_total_chunks', 0),
                "chunk_size": 1500,
                "chunk_overlap": 300
            }
        except:
            return {"total_chunks": 0, "chunk_size": 1500, "chunk_overlap": 300}
    
    def detect_document_personality(self, text: str) -> Dict:
        """Detect document tone/personality and return style information.
        
        Args:
            text: Document text to analyze.
            
        Returns:
            Dictionary with personality traits (tone, formality, style).
        """
        # Sample text for analysis
        sample_text = text[:2000] if len(text) > 2000 else text
        
        prompt = f"""Analyze this document and determine its personality/style:

Document sample:
{sample_text[:1000]}

Determine:
1. Tone: formal, casual, technical, friendly, academic, etc.
2. Formality level: very formal, formal, neutral, casual, very casual
3. Writing style: descriptive, narrative, instructional, analytical, etc.
4. Target audience: general public, experts, students, professionals, etc.

Format your response as:
TONE: [tone]
FORMALITY: [level]
STYLE: [style]
AUDIENCE: [audience]"""

        try:
            response = self._get_chat_response(prompt)
            
            # Parse response
            personality = {
                "tone": "neutral",
                "formality": "neutral",
                "style": "descriptive",
                "audience": "general"
            }
            
            for line in response.split('\n'):
                line = line.strip()
                if 'TONE:' in line.upper():
                    personality["tone"] = line.split(':', 1)[1].strip() if ':' in line else "neutral"
                elif 'FORMALITY:' in line.upper():
                    personality["formality"] = line.split(':', 1)[1].strip() if ':' in line else "neutral"
                elif 'STYLE:' in line.upper():
                    personality["style"] = line.split(':', 1)[1].strip() if ':' in line else "descriptive"
                elif 'AUDIENCE:' in line.upper():
                    personality["audience"] = line.split(':', 1)[1].strip() if ':' in line else "general"
            
            return personality
        except Exception as e:
            print(f"Error detecting document personality: {e}")
            return {"tone": "neutral", "formality": "neutral", "style": "descriptive", "audience": "general"}
    
    def ask_clarifying_question(self, question: str, relevant_chunks: List[Dict]) -> Optional[str]:
        """Ask a clarifying question if the user's question is ambiguous.
        
        Args:
            question: User's question.
            relevant_chunks: Chunks found for the question.
            
        Returns:
            Clarifying question if needed, None otherwise.
        """
        # Check if question is ambiguous
        question_lower = question.lower()
        ambiguous_indicators = ['this', 'that', 'it', 'they', 'them', 'those', 'these']
        has_ambiguous_ref = any(indicator in question_lower for indicator in ambiguous_indicators)
        
        # Check if multiple topics might match
        if len(relevant_chunks) > 10:  # Too many chunks might indicate ambiguity
            prompt = f"""The user asked: "{question}"

I found {len(relevant_chunks)} potentially relevant sections, which suggests the question might be ambiguous.

Generate ONE clarifying question to help narrow down what the user wants to know. 
If the question is clear, respond with "CLEAR".

Clarifying question (or "CLEAR"):"""

            try:
                response = self._get_chat_response(prompt)
                if "CLEAR" not in response.upper() and len(response.strip()) > 10:
                    return response.strip()
            except:
                pass
        
        return None
    
    def generate_quiz_questions(self, text: str, num_questions: int = 5) -> List[Dict]:
        """Generate quiz questions from the document.
        
        Args:
            text: Document text.
            num_questions: Number of quiz questions to generate.
            
        Returns:
            List of quiz questions with answers.
        """
        sample_text = text[:3000] if len(text) > 3000 else text
        
        prompt = f"""Generate {num_questions} quiz questions based on this document:

Document:
{sample_text}

For each question, provide:
1. The question
2. 4 multiple choice options (A, B, C, D)
3. The correct answer (A, B, C, or D)
4. A brief explanation

Format as:
Q1: [question]
A) [option A]
B) [option B]
C) [option C]
D) [option D]
Correct: [letter]
Explanation: [explanation]

Q2: [question]
..."""

        try:
            response = self._get_chat_response(prompt)
            
            # Check if response is an error
            if not response or response.startswith("❌ Error"):
                return []
            
            quiz_questions = []
            current_question = {}
            lines = response.split('\n')
            
            for line in lines:
                line = line.strip()
                if line.startswith('Q') and ':' in line:
                    if current_question:
                        quiz_questions.append(current_question)
                    current_question = {
                        'question': line.split(':', 1)[1].strip() if ':' in line else line,
                        'options': {},
                        'correct': None,
                        'explanation': ''
                    }
                elif line.startswith(('A)', 'B)', 'C)', 'D)')):
                    option_letter = line[0]
                    option_text = line[2:].strip() if len(line) > 2 else ""
                    current_question['options'][option_letter] = option_text
                elif 'CORRECT:' in line.upper():
                    correct = line.split(':', 1)[1].strip() if ':' in line else ""
                    current_question['correct'] = correct.upper()[0] if correct else None
                elif 'EXPLANATION:' in line.upper():
                    current_question['explanation'] = line.split(':', 1)[1].strip() if ':' in line else ""
            
            if current_question:
                quiz_questions.append(current_question)
            
            return quiz_questions[:num_questions]
        except ValueError as e:
            # API key missing or configuration error
            print(f"Error generating quiz (API key issue): {e}")
            return []
        except Exception as e:
            print(f"Error generating quiz: {e}")
            return []
    
    def analyze_sentiment(self, text: str) -> Dict:
        """Analyze document sentiment.
        
        Args:
            text: Document text.
            
        Returns:
            Sentiment analysis result.
        """
        sample_text = text[:2000] if len(text) > 2000 else text
        
        prompt = f"""Analyze the sentiment of this document:

{sample_text}

Determine:
1. Overall sentiment: positive, negative, or neutral
2. Sentiment score: 0-100 (0=very negative, 50=neutral, 100=very positive)
3. Key emotional themes: what emotions are present?

Format as:
SENTIMENT: [positive/negative/neutral]
SCORE: [0-100]
THEMES: [comma-separated themes]"""

        try:
            response = self._get_chat_response(prompt)
            
            sentiment_result = {
                "sentiment": "neutral",
                "score": 50,
                "themes": []
            }
            
            for line in response.split('\n'):
                line = line.strip()
                if 'SENTIMENT:' in line.upper():
                    sentiment_result["sentiment"] = line.split(':', 1)[1].strip().lower() if ':' in line else "neutral"
                elif 'SCORE:' in line.upper():
                    try:
                        score = int(line.split(':', 1)[1].strip()) if ':' in line else 50
                        sentiment_result["score"] = max(0, min(100, score))
                    except:
                        pass
                elif 'THEMES:' in line.upper():
                    themes = line.split(':', 1)[1].strip() if ':' in line else ""
                    sentiment_result["themes"] = [t.strip() for t in themes.split(',') if t.strip()]
            
            return sentiment_result
        except Exception as e:
            print(f"Error analyzing sentiment: {e}")
            return {"sentiment": "neutral", "score": 50, "themes": []}
    
    def create_document_heatmap(self, chat_history: List[Dict]) -> Dict:
        """Create a heatmap showing which document sections are referenced most.
        
        Args:
            chat_history: List of chat messages with sources.
            
        Returns:
            Dictionary with chunk usage statistics.
        """
        chunk_usage = {}
        
        for message in chat_history:
            if message.get("role") == "assistant" and message.get("sources"):
                for source in message["sources"]:
                    chunk_idx = source.get('chunk_index', 0)
                    chunk_usage[chunk_idx] = chunk_usage.get(chunk_idx, 0) + 1
        
        # Get total chunks
        total_chunks = getattr(self.vector_store, '_total_chunks', 0)
        
        return {
            "chunk_usage": chunk_usage,
            "total_chunks": total_chunks,
            "most_referenced": sorted(chunk_usage.items(), key=lambda x: x[1], reverse=True)[:10] if chunk_usage else []
        }
