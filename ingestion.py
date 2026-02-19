"""
ingestion.py
------------
Handles scraping URLs, extracting PDF text, chunking, embedding, and storing into FAISS.
"""

import os
import io
import requests
from bs4 import BeautifulSoup
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from typing import List
import re
import pypdf


# ── Constants ────────────────────────────────────────────────────────────────
FAISS_INDEX_DIR = "./faiss_index"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
CHUNK_SIZE = 800
CHUNK_OVERLAP = 100


# ── Embedding model ───────────────────────────────────────────────────────────
def get_embeddings():
    return HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)


# ── Scrape a URL ──────────────────────────────────────────────────────────────
def scrape_url(url: str) -> str:
    """Fetch and clean text from a web page."""
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
        tag.decompose()
    text = soup.get_text(separator="\n")
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


# ── Extract text from PDF bytes ───────────────────────────────────────────────
def extract_pdf_text(file_bytes: bytes) -> str:
    """Extract all text from a PDF given its raw bytes."""
    reader = pypdf.PdfReader(io.BytesIO(file_bytes))
    pages_text = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            pages_text.append(page_text.strip())
    full_text = "\n\n".join(pages_text)
    full_text = re.sub(r"\n{3,}", "\n\n", full_text).strip()
    return full_text


# ── Chunk text ────────────────────────────────────────────────────────────────
def chunk_text(text: str, source: str) -> List[dict]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )
    chunks = splitter.split_text(text)
    return [{"text": chunk, "source": source} for chunk in chunks]


# ── Store chunks in FAISS ─────────────────────────────────────────────────────
def store_chunks(chunks: List[dict]) -> int:
    """Embed and persist chunks into FAISS. Returns number of chunks stored."""
    embeddings = get_embeddings()
    texts = [c["text"] for c in chunks]
    metadatas = [{"source": c["source"]} for c in chunks]

    if os.path.exists(FAISS_INDEX_DIR):
        vectorstore = FAISS.load_local(
            FAISS_INDEX_DIR, embeddings, allow_dangerous_deserialization=True
        )
        vectorstore.add_texts(texts=texts, metadatas=metadatas)
    else:
        vectorstore = FAISS.from_texts(texts=texts, embedding=embeddings, metadatas=metadatas)

    vectorstore.save_local(FAISS_INDEX_DIR)
    return len(chunks)


# ── Public ingest functions ───────────────────────────────────────────────────
def ingest_url(url: str) -> dict:
    """Scrape URL → chunk → embed → store."""
    raw_text = scrape_url(url)
    chunks = chunk_text(raw_text, source=url)
    count = store_chunks(chunks)
    return {"source": url, "characters_scraped": len(raw_text), "chunks_stored": count}


def ingest_pdf(file_bytes: bytes, filename: str) -> dict:
    """Extract PDF text → chunk → embed → store."""
    raw_text = extract_pdf_text(file_bytes)
    if not raw_text.strip():
        raise ValueError("No readable text found in the PDF. It may be a scanned image-only PDF.")
    source_label = f"pdf::{filename}"
    chunks = chunk_text(raw_text, source=source_label)
    count = store_chunks(chunks)
    return {"source": source_label, "characters_scraped": len(raw_text), "chunks_stored": count}