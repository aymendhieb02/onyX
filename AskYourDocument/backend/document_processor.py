"""Document processing and chunking utilities."""

from typing import List


def chunk_text(text: str, chunk_size: int = 1500, chunk_overlap: int = 300, max_chunks: int = 500) -> List[dict]:
    """Split text into overlapping chunks.

    Args:
        text: The text to chunk.
        chunk_size: Maximum size of each chunk in characters.
        chunk_overlap: Number of characters to overlap between chunks.
        max_chunks: Maximum number of chunks to create (prevents memory issues).

    Returns:
        List of dictionaries containing chunk text and metadata.
    """
    if not text.strip():
        return []

    chunks = []
    start = 0
    text_length = len(text)
    max_iterations = max_chunks * 2  # Safety limit to prevent infinite loops
    iteration = 0

    while start < text_length and len(chunks) < max_chunks:
        iteration += 1
        # Safety check to prevent infinite loops
        if iteration > max_iterations:
            break
            
        # Calculate end position
        end = min(start + chunk_size, text_length)

        # Extract chunk
        chunk_text = text[start:end]

        # Try to break at sentence/paragraph boundary if not at end
        if end < text_length:
            # Look for better break points (paragraphs, sentences, etc.)
            # Prefer paragraph breaks (double newlines)
            last_paragraph = chunk_text.rfind('\n\n')
            # Then sentence endings
            last_period = chunk_text.rfind('.')
            last_exclamation = chunk_text.rfind('!')
            last_question = chunk_text.rfind('?')
            last_newline = chunk_text.rfind('\n')
            
            # Find the best break point (prefer paragraphs, then sentences)
            break_point = -1
            if last_paragraph > chunk_size * 0.3:  # Prefer paragraph breaks
                break_point = last_paragraph + 2  # Include the double newline
            elif max(last_period, last_exclamation, last_question) > chunk_size * 0.4:
                break_point = max(last_period, last_exclamation, last_question) + 1
            elif last_newline > chunk_size * 0.5:
                break_point = last_newline + 1

            if break_point > chunk_size * 0.3:  # Break if we're past 30% (more flexible)
                chunk_text = chunk_text[:break_point]
                end = start + break_point

        chunks.append({
            'text': chunk_text.strip(),
            'start': start,
            'end': end,
            'chunk_index': len(chunks)
        })

        # Move start position with overlap
        new_start = end - chunk_overlap
        # Safety check: ensure we're making progress
        if new_start <= start:
            new_start = start + 1
        start = new_start
        
        if start >= text_length:
            break

    return chunks

