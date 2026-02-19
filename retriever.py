"""
retriever.py
------------
Handles similarity search against FAISS to fetch relevant context chunks.
"""

from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from ingestion import FAISS_INDEX_DIR, EMBEDDING_MODEL
from typing import List
import os


def get_vectorstore():
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    if not os.path.exists(FAISS_INDEX_DIR):
        raise FileNotFoundError("No FAISS index found. Please ingest a URL first via POST /ingest")
    return FAISS.load_local(
        FAISS_INDEX_DIR,
        embeddings,
        allow_dangerous_deserialization=True
    )


def retrieve_context(query: str, top_k: int = 4) -> List[dict]:
    """
    Search FAISS for the top_k most relevant chunks for the given query.
    Returns a list of dicts with 'text', 'source', and 'relevance_score'.
    """
    vectorstore = get_vectorstore()
    results = vectorstore.similarity_search_with_score(query, k=top_k)

    context_chunks = []
    for doc, score in results:
        context_chunks.append({
            "text": doc.page_content,
            "source": doc.metadata.get("source", "unknown"),
            "relevance_score": round(float(score), 4),
        })

    return context_chunks


def list_all_sources() -> List[str]:
    """Return all unique source URLs stored in the FAISS index."""
    vectorstore = get_vectorstore()
    docs = vectorstore.docstore._dict.values()
    sources = list({doc.metadata.get("source", "unknown") for doc in docs})
    return sources