# 🗄️ QueryVault — AI-Powered Document Search

 Chat with any website or PDF using Retrieval-Augmented Generation (RAG), powered by Groq LLaMA 3 and FAISS vector search


## ✨ Features

- 🌐 **URL Ingestion** — Scrape and index any public webpage
- 📄 **PDF Upload** — Upload and index text-based PDF files (up to 20MB)
- 🤖 **AI Answers** — Powered by Groq's fast LLaMA 3 inference
- 🔍 **Source Citations** — Every answer shows which sources were used with relevance scores
- 🌍 **Multilingual** — Get answers in 10 languages including Telugu, Hindi, Tamil, and more
- 🗑️ **Session Management** — Auto-clears index on new session, manual clear button
- ⚡ **Fast** — FAISS vector search + Groq inference = sub-second responses

---

## 🏗️ Architecture

```
User Question
     │
     ▼
[React Frontend]
     │  HTTP
     ▼
[FastAPI Backend]
     │
     ├─── POST /ingest ──────► Scrape URL → Chunk → Embed → FAISS
     ├─── POST /ingest-pdf ──► Extract PDF → Chunk → Embed → FAISS
     │
     └─── POST /chat
               │
               ├─ Retrieve top-K chunks from FAISS
               └─ Send context + question to Groq LLM
                         │
                         ▼
                    Answer + Sources
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Plus Jakarta Sans |
| **Backend** | FastAPI, Python 3.10+ |
| **LLM** | Groq API (LLaMA 3.1 8B / 3.3 70B) |
| **Vector DB** | FAISS (local, no external service needed) |
| **Embeddings** | HuggingFace `all-MiniLM-L6-v2` (runs locally) |
| **Web Scraping** | BeautifulSoup4 |
| **PDF Parsing** | pypdf |
| **Text Splitting** | LangChain RecursiveCharacterTextSplitter |

---

## 📁 Project Structure

```
queryvault/
├── main.py              # FastAPI app — all API endpoints
├── ingestion.py         # URL scraper + PDF extractor → FAISS
├── retriever.py         # Similarity search from FAISS
├── llm.py               # Groq prompt builder + LLM caller
├── requirements.txt     # Python dependencies
├── render.yaml          # Render.com deployment config
├── Procfile             # Process file for deployment
├── .gitignore
├── README.md
└── frontend/
    ├── src/
    │   ├── App.jsx      # Full React UI
    │   └── main.jsx     # Entry point
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Free [Groq API key](https://console.groq.com)

### Step 1 — Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/queryvault.git
cd queryvault
```

### Step 2 — Backend setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate       # Mac/Linux
venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your Groq API key
echo GROQ_API_KEY=your_key_here > .env
```

### Step 3 — Run the backend
```bash
python main.py
# API running at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Step 4 — Frontend setup
```bash
cd frontend
npm install
npm run dev
# UI running at http://localhost:3000
```

---

## 🧪 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/ingest` | Scrape & index a URL |
| `POST` | `/ingest-pdf` | Upload & index a PDF |
| `POST` | `/chat` | Ask a question |
| `GET` | `/sources` | List all indexed sources |
| `DELETE` | `/clear` | Clear the entire index |
| `GET` | `/languages` | List supported languages |

### Example — Ingest a URL
```bash
curl -X POST "http://localhost:8000/ingest" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://en.wikipedia.org/wiki/Artificial_intelligence"}'
```

### Example — Ask a question in Telugu
```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is AI?", "top_k": 4, "language": "te"}'
```

---

## 🌍 Supported Languages

| Code | Language | Code | Language |
|---|---|---|---|
| `en` | 🇺🇸 English | `fr` | 🇫🇷 French |
| `te` | 🇮🇳 Telugu | `de` | 🇩🇪 German |
| `hi` | 🇮🇳 Hindi | `es` | 🇪🇸 Spanish |
| `ta` | 🇮🇳 Tamil | `ja` | 🇯🇵 Japanese |
| `zh` | 🇨🇳 Chinese | `ar` | 🇸🇦 Arabic |

---

## ☁️ Deployment

### Backend → [Render](https://render.com) (Free)
1. Connect your GitHub repo on Render
2. It auto-detects `render.yaml`
3. Add environment variable: `GROQ_API_KEY`
4. Deploy → get your API URL

### Frontend → [Vercel](https://vercel.com) (Free)
1. Import repo on Vercel
2. Set root directory to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-api.onrender.com`
4. Deploy → get your frontend URL

---

## ⚙️ Configuration

| Setting | File | Default | Notes |
|---|---|---|---|
| LLM Model | `llm.py` | `llama-3.1-8b-instant` | Use `llama-3.3-70b-versatile` for better quality |
| Chunk Size | `ingestion.py` | `800` chars | Increase for more context per chunk |
| Chunk Overlap | `ingestion.py` | `100` chars | Increase to reduce context loss at boundaries |
| Top-K Results | API param | `4` | Number of chunks retrieved per query (1–10) |

---

## 🔮 Future Improvements

- [ ] Persistent sessions with database storage
- [ ] Support for DOCX, CSV, and TXT files
- [ ] Conversation history / multi-turn chat
- [ ] Authentication with user accounts
- [ ] Re-ranking with cross-encoder models
- [ ] Support for scanned PDFs with OCR

---

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT License — free to use, modify and distribute.

---

## 👨‍💻 Author

**Siva Rama Krishna Reddy**
- GitHub: [@siva-rama-krishna-reddy18](https://github.com/siva-rama-krishna-reddy18)

---

> ⭐ If this project helped you, please consider giving it a star on GitHub!

> Built as a portfolio project to demonstrate RAG, LLM integration, and full-stack AI engineering skills.
