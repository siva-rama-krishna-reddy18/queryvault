"""
main.py
-------
FastAPI application exposing endpoints:
  POST /ingest        - scrape & store a URL
  POST /ingest-pdf    - upload & store a PDF
  POST /chat          - ask a question (with language param)
  GET  /sources       - list all ingested sources
  DELETE /clear       - wipe the FAISS index
  GET  /languages     - list supported languages
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from ingestion import ingest_url, ingest_pdf
from retriever import retrieve_context, list_all_sources
from llm import ask_groq, LANGUAGES
import uvicorn
import os

app = FastAPI(
    title="QueryVault API",
    description="QueryVault — AI-powered document search with multilingual support",
    version="3.0.0",
)

# Read allowed origins from env so you can set your Vercel URL in Render dashboard
import os as _os
_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
_frontend_url = _os.getenv("FRONTEND_URL")
if _frontend_url:
    _origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ───────────────────────────────────────────────────────────────────

class IngestRequest(BaseModel):
    url: HttpUrl
    model_config = {"json_schema_extra": {"example": {"url": "https://en.wikipedia.org/wiki/Artificial_intelligence"}}}

class IngestResponse(BaseModel):
    source: str
    characters_scraped: int
    chunks_stored: int
    message: str

class ChatRequest(BaseModel):
    question: str
    top_k: int = 4
    language: str = "en"   # language code: en, te, hi, ta, fr, de, es, ja, zh, ar
    model_config = {"json_schema_extra": {"example": {"question": "What is deep learning?", "top_k": 4, "language": "te"}}}

class ContextChunk(BaseModel):
    text: str
    source: str
    relevance_score: float

class ChatResponse(BaseModel):
    question: str
    answer: str
    language: str
    sources_used: list[ContextChunk]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"status": "running", "message": "QueryVault API v3 — multilingual RAG."}


@app.get("/languages", tags=["Config"])
def get_languages():
    """Returns all supported response languages."""
    return {"languages": [{"code": k, "name": v} for k, v in LANGUAGES.items()]}


@app.post("/ingest", response_model=IngestResponse, tags=["Ingestion"])
def ingest(request: IngestRequest):
    """Scrape a URL, chunk, embed, and store in FAISS."""
    try:
        result = ingest_url(str(request.url))
        return IngestResponse(**result, message=f"Indexed {result['chunks_stored']} chunks from URL.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"URL ingestion failed: {str(e)}")


@app.post("/ingest-pdf", response_model=IngestResponse, tags=["Ingestion"])
async def ingest_pdf_endpoint(file: UploadFile = File(...)):
    """Upload a PDF file, extract text, chunk, embed, and store in FAISS."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")
    file_bytes = await file.read()
    if len(file_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 20MB.")
    try:
        result = ingest_pdf(file_bytes, filename=file.filename)
        return IngestResponse(**result, message=f"Indexed {result['chunks_stored']} chunks from PDF.")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF ingestion failed: {str(e)}")


@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
def chat(request: ChatRequest):
    """Ask a question in any supported language."""
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    if request.language not in LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language. Choose from: {list(LANGUAGES.keys())}")
    try:
        context_chunks = retrieve_context(request.question, top_k=request.top_k)
        if not context_chunks:
            raise HTTPException(status_code=404, detail="No relevant context found. Please ingest some sources first.")
        answer = ask_groq(request.question, context_chunks, language=request.language)
        return ChatResponse(
            question=request.question,
            answer=answer,
            language=request.language,
            sources_used=[ContextChunk(**c) for c in context_chunks],
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@app.get("/sources", tags=["Ingestion"])
def list_sources():
    try:
        sources = list_all_sources()
        return {"total_sources": len(sources), "sources": sources}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not retrieve sources: {str(e)}")


@app.delete("/clear", tags=["Ingestion"])
def clear_index():
    """Delete the entire FAISS index."""
    import shutil
    from ingestion import FAISS_INDEX_DIR
    try:
        if os.path.exists(FAISS_INDEX_DIR):
            shutil.rmtree(FAISS_INDEX_DIR)
            return {"message": "Index cleared successfully."}
        return {"message": "No index found. Nothing to clear."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear index: {str(e)}")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)