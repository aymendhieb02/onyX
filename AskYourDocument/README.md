# Ask Your Document

Chat with your documents using AI-powered RAG (Retrieval-Augmented Generation).

## Features

- 📄 Upload text documents (.txt)
- 💬 Ask questions about your document
- 🎯 Get accurate answers with citations
- 💡 Receive follow-up question suggestions
- 🧠 See AI reasoning process (thought bubbles)

## Setup

### Prerequisites
- Python 3.11+
- Docker (optional, for deployment)

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your API keys
```

3. Run the application:
```bash
streamlit run app.py
```

## Docker

Build and run with Docker:
```bash
docker-compose up
```

## Project Structure

```
AskYourDocument/
├── app.py                 # Streamlit frontend
├── backend/
│   ├── __init__.py
│   ├── rag_pipeline.py   # RAG implementation
│   ├── document_processor.py  # Document chunking
│   └── vector_store.py   # Vector database operations
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

