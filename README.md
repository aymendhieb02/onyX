# Ask Your Document — Conversational RAG Assistant

A Streamlit application for asking questions about uploaded text documents, retrieving relevant passages, and presenting answers with source citations.

Built by **Aymen Dhieb** as a hackathon product. This branch focuses on Ask Your Document; other product concepts in the repository are separate workstreams.

## What it does

- Upload and process `.txt` documents.
- Split text into overlapping passages and index embeddings in ChromaDB.
- Retrieve relevant context for an LLM-backed answer with source citations.
- Keep conversation history, with a MongoDB storage layer.
- Generate follow-up questions and document-based quizzes through the application.

## Technology

**Python · Streamlit · sentence-transformers · ChromaDB · LLM-provider integration · MongoDB**

The main application is [`AskYourDocument/app.py`](AskYourDocument/app.py). Retrieval, chunking and storage code is under [`AskYourDocument/backend/`](AskYourDocument/backend/).

## Run locally

Use Python 3.11 or a compatible environment for the pinned dependencies.

```bash
git clone --branch Ask_Your_Document https://github.com/aymendhieb02/onyX.git
cd onyX/AskYourDocument
python -m venv .venv
```

Activate the environment for your operating system, then:

```bash
python -m pip install -r requirements.txt
```

Copy `.env.example` to a local `.env` and configure the required provider/storage values for your setup. Keep credentials out of Git.

```bash
streamlit run app.py
```

See [application setup](AskYourDocument/README.md), [deployment notes](AskYourDocument/DEPLOYMENT.md) and [feature documentation](AskYourDocument/IMPLEMENTED_FEATURES.md).

## Scope

This is a hackathon prototype. The current uploader supports text files; PDF/OCR support is not part of the stated input contract. Answer quality depends on retrieval, the selected model and the source document, so users should inspect the cited passages.

## Hackathon context

The repository originated during [BuildwithAI](https://buildwithai.space/), a rapid product-building event inspired by the AI Fund / DeepLearning.AI Buildathon.
