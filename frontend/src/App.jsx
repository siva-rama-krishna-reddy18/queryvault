import { useState, useRef, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Icons ─────────────────────────────────────────────────────────────────────
const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const GlobeIcon = ({ size=13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const FileIcon = ({ size=13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const UploadIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const ExternalIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);
const SparkleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);
const NewSessionIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);
const SpinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{animation:"qv-spin .7s linear infinite"}}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);
const DBIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const getDomain = (src) => {
  if (src.startsWith("pdf::")) return src.replace("pdf::", "");
  try { return new URL(src).hostname.replace("www.", ""); } catch { return src; }
};
const isPdf = (src) => src.startsWith("pdf::");
const getMatch = (score) => Math.max(0, Math.min(100, Math.round((1 - score / 2) * 100)));

// ── Source Reference Card ─────────────────────────────────────────────────────
function RefCard({ source, score, index }) {
  const pct = getMatch(score);
  const pdf = isPdf(source);
  const label = getDomain(source);
  const inner = (
    <div className="ref-card">
      <div className="ref-header">
        <span className="ref-num">#{String(index + 1).padStart(2,"0")}</span>
        <span className={`ref-badge ${pdf ? "ref-badge-pdf" : "ref-badge-web"}`}>
          {pdf ? <FileIcon size={9}/> : <GlobeIcon size={9}/>}
          {pdf ? "PDF" : "WEB"}
        </span>
        {!pdf && <ExternalIcon />}
      </div>
      <div className="ref-name">{label}</div>
      <div className="ref-track"><div className="ref-fill" style={{width:`${pct}%`}}/></div>
      <div className="ref-pct">{pct}% match</div>
    </div>
  );
  return pdf
    ? <div>{inner}</div>
    : <a href={source} target="_blank" rel="noopener noreferrer" className="ref-link">{inner}</a>;
}

// ── Message ───────────────────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === "user";
  const isErr  = msg.role === "error";
  return (
    <div className={`msg ${isUser ? "msg-u" : "msg-a"}`}>
      {!isUser && (
        <div className={`msg-av ${isErr ? "av-err" : "av-ai"}`}>
          {isErr ? <AlertIcon /> : <SparkleIcon />}
        </div>
      )}
      <div className="msg-col">
        {!isUser && (
          <div className="msg-name">{isErr ? "Error" : "QueryVault AI"}</div>
        )}
        <div className={`bubble ${isUser ? "b-user" : isErr ? "b-err" : "b-ai"}`}>
          {msg.content}
        </div>
        {msg.sources?.length > 0 && (
          <div className="refs-wrap">
            <div className="refs-header">
              <div className="refs-line"/>
              <span className="refs-label">Referenced Sources</span>
              <div className="refs-line"/>
            </div>
            <div className="refs-grid">
              {msg.sources.map((s,i) => (
                <RefCard key={i} index={i} source={s.source} score={s.relevance_score}/>
              ))}
            </div>
          </div>
        )}
      </div>
      {isUser && <div className="msg-av av-user">YOU</div>}
    </div>
  );
}

function Thinking() {
  return (
    <div className="msg msg-a">
      <div className="msg-av av-ai"><SparkleIcon /></div>
      <div className="msg-col">
        <div className="msg-name">QueryVault AI</div>
        <div className="bubble b-ai b-thinking">
          <span className="td"/><span className="td"/><span className="td"/>
        </div>
      </div>
    </div>
  );
}

// ── URL Form ──────────────────────────────────────────────────────────────────
function UrlForm({ onDone }) {
  const [url, setUrl] = useState("");
  const [st, setSt] = useState("idle");
  const [fb, setFb] = useState("");

  const go = async () => {
    if (!url.trim() || st === "loading") return;
    setSt("loading"); setFb("");
    try {
      const r = await fetch(`${API_BASE}/ingest`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({url: url.trim()})
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || "Failed");
      setSt("ok"); setFb(`${d.chunks_stored} chunks indexed`);
      onDone({label: url.trim(), type:"url"});
      setUrl("");
      setTimeout(()=>{setSt("idle");setFb("");}, 3500);
    } catch(e) {
      setSt("err"); setFb(e.message);
      setTimeout(()=>setSt("idle"), 4000);
    }
  };

  return (
    <div className="form-wrap">
      <div className="url-row">
        <span className="url-ico"><GlobeIcon /></span>
        <input className="url-inp" type="url" placeholder="https://example.com"
          value={url} onChange={e=>setUrl(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&go()} disabled={st==="loading"}/>
        <button className="go-btn" onClick={go} disabled={!url.trim()||st==="loading"}>
          {st==="loading" ? <SpinIcon/> : <><PlusIcon/>Add</>}
        </button>
      </div>
      {fb && (
        <div className={`fb ${st==="ok"?"fb-ok":"fb-err"}`}>
          {st==="ok"?<CheckIcon/>:<AlertIcon/>}{fb}
        </div>
      )}
    </div>
  );
}

// ── PDF Form ──────────────────────────────────────────────────────────────────
function PdfForm({ onDone }) {
  const [st, setSt] = useState("idle");
  const [fb, setFb] = useState("");
  const [drag, setDrag] = useState(false);
  const inp = useRef();

  const upload = async (file) => {
    if (!file?.name.toLowerCase().endsWith(".pdf")) {
      setSt("err"); setFb("Only PDF files accepted.");
      setTimeout(()=>setSt("idle"),3000); return;
    }
    setSt("loading"); setFb("");
    const fd = new FormData(); fd.append("file", file);
    try {
      const r = await fetch(`${API_BASE}/ingest-pdf`, {method:"POST", body:fd});
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail||"Failed");
      setSt("ok"); setFb(`${d.chunks_stored} chunks indexed`);
      onDone({label: file.name, type:"pdf"});
      setTimeout(()=>{setSt("idle");setFb("");},3500);
    } catch(e) {
      setSt("err"); setFb(e.message);
      setTimeout(()=>setSt("idle"),4000);
    }
  };

  return (
    <div className="form-wrap">
      <div
        className={`dz ${drag?"dz-over":""} ${st==="loading"?"dz-busy":""}`}
        onClick={()=>st!=="loading"&&inp.current?.click()}
        onDragOver={e=>{e.preventDefault();setDrag(true);}}
        onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);upload(e.dataTransfer.files[0]);}}>
        <input ref={inp} type="file" accept=".pdf" style={{display:"none"}}
          onChange={e=>e.target.files[0]&&upload(e.target.files[0])}/>
        <div className={`dz-icon-wrap ${drag||st==="loading"?"dz-icon-active":""}`}>
          {st==="loading" ? <SpinIcon/> : <UploadIcon/>}
        </div>
        <p className="dz-title">{st==="loading" ? "Indexing…" : "Drop PDF or click to browse"}</p>
        <p className="dz-hint">Max 20 MB · text-based PDFs only</p>
      </div>
      {fb && (
        <div className={`fb ${st==="ok"?"fb-ok":"fb-err"}`}>
          {st==="ok"?<CheckIcon/>:<AlertIcon/>}{fb}
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ sources, onAdd, onClear }) {
  const [tab, setTab] = useState("url");
  return (
    <aside className="sb">
      {/* Logo */}
      <div className="sb-logo">
        <div className="sb-logo-icon"><DBIcon /></div>
        <div>
          <div className="sb-logo-name">QueryVault</div>
          <div className="sb-logo-tag">AI · RAG · Search</div>
        </div>
      </div>

      {/* Add source */}
      <div className="sb-block">
        <p className="sb-eyebrow">Add Source</p>
        <div className="tabs">
          <button className={`tabx ${tab==="url"?"tabx-on":""}`} onClick={()=>setTab("url")}>
            <GlobeIcon /> URL
          </button>
          <button className={`tabx ${tab==="pdf"?"tabx-on":""}`} onClick={()=>setTab("pdf")}>
            <FileIcon /> PDF
          </button>
        </div>
        {tab==="url" ? <UrlForm onDone={onAdd}/> : <PdfForm onDone={onAdd}/>}
      </div>

      {/* Source list */}
      <div className="sb-block sb-sources">
        <p className="sb-eyebrow">
          Indexed Sources
          {sources.length > 0 && <span className="eyebrow-pill">{sources.length}</span>}
        </p>

        {sources.length === 0 ? (
          <div className="sb-empty">No sources yet.<br/>Add a URL or PDF above.</div>
        ) : (
          <>
            <div className="src-list">
              {sources.map((s,i) => (
                <div key={i} className="src-item">
                  <div className={`src-dot ${s.type==="pdf"?"src-dot-pdf":""}`}/>
                  <span className="src-ico">{s.type==="pdf"?<FileIcon size={11}/>:<GlobeIcon size={11}/>}</span>
                  <span className="src-name">{s.type==="pdf" ? s.label : getDomain(s.label)}</span>
                  <span className={`src-pill ${s.type==="pdf"?"src-pill-pdf":"src-pill-url"}`}>
                    {s.type==="pdf"?"PDF":"URL"}
                  </span>
                </div>
              ))}
            </div>
            <button className="clear-btn" onClick={onClear}>
              <TrashIcon /> Clear all sources
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="sb-foot">
        <span className="sb-stack">Groq · LLaMA 3 · FAISS</span>
        <span className="sb-live"><span className="live-dot"/>Live</span>
      </div>
    </aside>
  );
}


// ── Language Selector ─────────────────────────────────────────────────────────
const LANGUAGES = [
  { code:"en", name:"English",    flag:"🇺🇸" },
  { code:"te", name:"Telugu",     flag:"🇮🇳" },
  { code:"hi", name:"Hindi",      flag:"🇮🇳" },
  { code:"ta", name:"Tamil",      flag:"🇮🇳" },
  { code:"fr", name:"French",     flag:"🇫🇷" },
  { code:"de", name:"German",     flag:"🇩🇪" },
  { code:"es", name:"Spanish",    flag:"🇪🇸" },
  { code:"ja", name:"Japanese",   flag:"🇯🇵" },
  { code:"zh", name:"Chinese",    flag:"🇨🇳" },
  { code:"ar", name:"Arabic",     flag:"🇸🇦" },
];

function LangSelector({ value, onChange }) {
  return (
    <div className="lang-wrap">
      <span className="lang-label">Respond in</span>
      <select className="lang-select" value={value} onChange={e => onChange(e.target.value)}>
        {LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
        ))}
      </select>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([{
    role:"bot",
    content:"Welcome to QueryVault! Add a website URL or upload a PDF in the left panel, then ask me anything about the content. I'll retrieve the most relevant passages and generate a precise answer with cited sources."
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState([]);
  const [language, setLanguage] = useState("en");
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Auto-clear stale index when app first loads
  useEffect(()=>{
    const clearOnStart = async () => {
      try {
        await fetch(`${API_BASE}/clear`, {method:"DELETE"});
      } catch(e) { /* silently ignore if backend not ready */ }
    };
    clearOnStart();
  }, []); // runs once on mount

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,loading]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages(p=>[...p, {role:"user", content:q}]);
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/chat`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({question:q, top_k:4, language})
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail||"Failed");
      setMessages(p=>[...p, {role:"bot", content:d.answer, sources:d.sources_used}]);
    } catch(e) {
      setMessages(p=>[...p, {role:"error", content:e.message}]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear all indexed sources? This cannot be undone.")) return;
    try {
      const r = await fetch(`${API_BASE}/clear`, {method:"DELETE"});
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail);
      setSources([]);
      setMessages([{role:"bot", content:"All sources cleared. Add a new URL or PDF to get started."}]);
    } catch(e) { alert("Failed: " + e.message); }
  };

  const qCount = messages.filter(m=>m.role==="user").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Fira+Code:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        :root {
          --white:      #ffffff;
          --bg:         #f5f6fa;
          --surface:    #ffffff;
          --surface2:   #f0f2f7;
          --border:     #e3e6ef;
          --border2:    #d0d4e0;
          --text:       #1a1d2e;
          --text2:      #5a6072;
          --text3:      #9ea3b5;
          --indigo:     #4f61f5;
          --indigo-d:   #3d4ed8;
          --indigo-bg:  #eef0fe;
          --indigo-bd:  rgba(79,97,245,0.2);
          --teal:       #0891b2;
          --teal-bg:    #ecfeff;
          --teal-bd:    rgba(8,145,178,0.2);
          --amber:      #d97706;
          --amber-bg:   #fffbeb;
          --amber-bd:   rgba(217,119,6,0.2);
          --red:        #dc2626;
          --red-bg:     #fef2f2;
          --red-bd:     rgba(220,38,38,0.2);
          --green:      #059669;
          --green-bg:   #ecfdf5;
          --green-bd:   rgba(5,150,105,0.2);
          --font:       'Plus Jakarta Sans', sans-serif;
          --mono:       'Fira Code', monospace;
          --r:          12px;
          --r-sm:       8px;
          --shadow-sm:  0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          --shadow-md:  0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
          --shadow-lg:  0 8px 32px rgba(79,97,245,0.12);
          --t:          0.17s ease;
        }

        html, body { height:100%; background:var(--bg); color:var(--text); font-family:var(--font); overflow:hidden; }
        #root { height:100vh; display:flex; }
        .app { display:flex; width:100%; height:100vh; }

        /* ── SIDEBAR ── */
        .sb {
          width:285px; min-width:285px;
          background:var(--surface);
          border-right:1px solid var(--border);
          display:flex; flex-direction:column;
          box-shadow:2px 0 12px rgba(0,0,0,0.04);
        }

        .sb-logo {
          display:flex; align-items:center; gap:11px;
          padding:20px 18px 17px;
          border-bottom:1px solid var(--border);
        }

        .sb-logo-icon {
          width:40px; height:40px; border-radius:10px;
          background:var(--indigo-bg); border:1px solid var(--indigo-bd);
          display:flex; align-items:center; justify-content:center;
          color:var(--indigo); flex-shrink:0;
        }

        .sb-logo-name { font-size:16px; font-weight:700; color:var(--text); letter-spacing:-0.02em; }
        .sb-logo-tag  { font-size:10px; font-family:var(--mono); color:var(--text3); margin-top:2px; }

        .sb-block { padding:16px 16px 0; }
        .sb-sources { flex:1; overflow-y:auto; padding-bottom:10px; }

        .sb-eyebrow {
          font-size:10px; font-weight:700; letter-spacing:0.12em;
          text-transform:uppercase; color:var(--text3);
          font-family:var(--mono); margin-bottom:10px;
          display:flex; align-items:center; gap:7px;
        }

        .eyebrow-pill {
          background:var(--indigo-bg); color:var(--indigo);
          border:1px solid var(--indigo-bd);
          border-radius:20px; padding:1px 8px;
          font-size:10px; font-family:var(--mono);
        }

        /* Tabs */
        .tabs {
          display:flex; gap:4px; margin-bottom:12px;
          background:var(--surface2); border-radius:var(--r-sm); padding:3px;
        }
        .tabx {
          flex:1; display:flex; align-items:center; justify-content:center; gap:5px;
          padding:7px; border:none; border-radius:6px; cursor:pointer;
          font-size:12px; font-weight:500; font-family:var(--font);
          color:var(--text3); background:transparent;
          transition:all var(--t);
        }
        .tabx:hover:not(.tabx-on) { color:var(--text2); background:rgba(255,255,255,0.6); }
        .tabx-on {
          background:var(--white) !important; color:var(--indigo) !important;
          box-shadow:var(--shadow-sm); border:1px solid var(--border) !important;
        }

        /* Forms */
        .form-wrap { display:flex; flex-direction:column; gap:8px; padding-bottom:16px; }

        .url-row {
          display:flex; align-items:center;
          background:var(--surface2); border:1.5px solid var(--border);
          border-radius:var(--r-sm); overflow:hidden;
          transition:border-color var(--t), box-shadow var(--t);
        }
        .url-row:focus-within {
          border-color:var(--indigo); background:var(--white);
          box-shadow:0 0 0 3px var(--indigo-bg);
        }
        .url-ico { padding:0 9px; color:var(--text3); display:flex; flex-shrink:0; }
        .url-inp {
          flex:1; background:transparent; border:none; outline:none;
          padding:9px 6px; font-size:12px; font-family:var(--mono); font-weight:300;
          color:var(--text); min-width:0;
        }
        .url-inp::placeholder { color:var(--text3); }
        .go-btn {
          display:flex; align-items:center; gap:5px;
          padding:0 14px; height:37px; flex-shrink:0;
          background:var(--indigo); color:var(--white);
          font-size:12px; font-weight:600; font-family:var(--font);
          border:none; cursor:pointer; transition:background var(--t);
        }
        .go-btn:hover:not(:disabled) { background:var(--indigo-d); }
        .go-btn:disabled { opacity:0.45; cursor:not-allowed; }

        /* Drop zone */
        .dz {
          display:flex; flex-direction:column; align-items:center; gap:7px;
          padding:22px 12px; text-align:center;
          border:1.5px dashed var(--border2); border-radius:var(--r);
          background:var(--surface2); cursor:pointer;
          transition:all var(--t);
        }
        .dz:hover, .dz-over { border-color:var(--indigo); background:var(--indigo-bg); }
        .dz-busy { cursor:not-allowed; opacity:0.65; }
        .dz-icon-wrap { color:var(--text3); transition:color var(--t); }
        .dz-icon-active { color:var(--indigo); }
        .dz:hover .dz-icon-wrap { color:var(--indigo); }
        .dz-title { font-size:12.5px; font-weight:500; color:var(--text2); }
        .dz-hint  { font-size:10.5px; font-family:var(--mono); color:var(--text3); font-weight:300; }

        /* Feedback */
        .fb {
          display:flex; align-items:center; gap:6px;
          padding:7px 10px; border-radius:var(--r-sm);
          font-size:11.5px; font-family:var(--mono);
        }
        .fb-ok  { background:var(--green-bg); color:var(--green); border:1px solid var(--green-bd); }
        .fb-err { background:var(--red-bg);   color:var(--red);   border:1px solid var(--red-bd); }

        /* Source list */
        .sb-empty {
          text-align:center; font-size:12px; font-family:var(--mono);
          color:var(--text3); font-weight:300; line-height:1.7;
          padding:18px 10px; border:1.5px dashed var(--border);
          border-radius:var(--r-sm);
        }
        .src-list { display:flex; flex-direction:column; gap:3px; margin-bottom:10px; }
        .src-item {
          display:flex; align-items:center; gap:7px;
          padding:8px 10px; border-radius:var(--r-sm);
          background:var(--surface2); border:1px solid var(--border);
          transition:background var(--t);
        }
        .src-item:hover { background:var(--indigo-bg); border-color:var(--indigo-bd); }
        .src-dot { width:6px; height:6px; border-radius:50%; background:var(--teal); flex-shrink:0; }
        .src-dot-pdf { background:var(--amber); }
        .src-ico { color:var(--text3); flex-shrink:0; display:flex; }
        .src-name { flex:1; font-size:11.5px; font-family:var(--mono); color:var(--text2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .src-pill { font-size:9px; font-family:var(--mono); font-weight:600; padding:2px 7px; border-radius:20px; flex-shrink:0; }
        .src-pill-url { color:var(--teal); background:var(--teal-bg); border:1px solid var(--teal-bd); }
        .src-pill-pdf { color:var(--amber); background:var(--amber-bg); border:1px solid var(--amber-bd); }

        .clear-btn {
          width:100%; display:flex; align-items:center; justify-content:center; gap:6px;
          padding:8px; border-radius:var(--r-sm); cursor:pointer;
          background:transparent; border:1.5px solid var(--red-bd);
          color:var(--red); font-size:11.5px; font-weight:500; font-family:var(--font);
          transition:all var(--t);
        }
        .clear-btn:hover { background:var(--red-bg); border-color:var(--red); }

        /* Sidebar footer */
        .sb-foot {
          padding:12px 16px; border-top:1px solid var(--border);
          display:flex; align-items:center; justify-content:space-between;
          margin-top:auto;
        }
        .sb-stack { font-size:10.5px; font-family:var(--mono); color:var(--text3); }
        .sb-live { display:flex; align-items:center; gap:5px; font-size:10.5px; font-family:var(--mono); color:var(--green); font-weight:500; }
        .live-dot { width:6px; height:6px; border-radius:50%; background:var(--green); animation:livepulse 2s infinite; }
        @keyframes livepulse { 0%,100%{opacity:1;} 50%{opacity:.35;} }

        /* ── MAIN ── */
        .main { flex:1; display:flex; flex-direction:column; background:var(--bg); min-width:0; }

        /* Topbar */
        .topbar {
          display:flex; align-items:center; justify-content:space-between;
          padding:15px 28px; background:var(--surface);
          border-bottom:1px solid var(--border);
          box-shadow:var(--shadow-sm); flex-shrink:0;
        }
        .tb-title { font-size:15px; font-weight:700; color:var(--text); letter-spacing:-0.02em; }
        .tb-sub   { font-size:11px; font-family:var(--mono); color:var(--text3); margin-top:2px; }
        .tb-chips { display:flex; gap:7px; }
        .tb-chip {
          display:flex; align-items:center; gap:5px;
          padding:5px 12px; border-radius:20px;
          background:var(--surface2); border:1px solid var(--border);
          font-size:11px; font-family:var(--mono); color:var(--text2);
        }
        .chip-dot { width:5px; height:5px; border-radius:50%; background:var(--indigo); }

        /* Messages */
        .msgs {
          flex:1; overflow-y:auto; padding:28px 28px 0;
          display:flex; flex-direction:column; gap:22px;
          scrollbar-width:thin; scrollbar-color:var(--border) transparent;
        }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:var(--border2); border-radius:4px; }

        .msg { display:flex; gap:11px; animation:rise .22s ease; }
        @keyframes rise { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:translateY(0)} }
        .msg-u { flex-direction:row-reverse; }

        .msg-av {
          width:33px; height:33px; border-radius:10px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; margin-top:18px;
        }
        .av-ai  { background:var(--indigo-bg); border:1px solid var(--indigo-bd); color:var(--indigo); }
        .av-err { background:var(--red-bg); border:1px solid var(--red-bd); color:var(--red); }
        .av-user {
          background:var(--text); color:var(--white);
          font-size:8px; font-weight:700; font-family:var(--mono);
        }

        .msg-col { display:flex; flex-direction:column; gap:5px; max-width:67%; }
        .msg-u .msg-col { align-items:flex-end; }

        .msg-name { font-size:10.5px; font-weight:600; color:var(--text3); font-family:var(--mono); letter-spacing:0.04em; }

        .bubble {
          padding:13px 17px; font-size:14px; line-height:1.74; font-weight:400;
          border-radius:14px; box-shadow:var(--shadow-sm);
        }
        .b-ai {
          background:var(--surface); border:1px solid var(--border);
          color:var(--text); border-radius:3px 14px 14px 14px;
        }
        .b-user {
          background:var(--indigo); color:var(--white);
          border-radius:14px 3px 14px 14px;
          box-shadow:var(--shadow-lg);
        }
        .b-err {
          background:var(--red-bg); border:1px solid var(--red-bd);
          color:var(--red); border-radius:14px;
        }

        /* Typing */
        .b-thinking { display:flex; align-items:center; gap:5px; padding:15px 18px !important; }
        .td {
          display:inline-block; width:7px; height:7px; border-radius:50%;
          background:var(--border2); animation:bop 1.3s infinite;
        }
        .td:nth-child(2){animation-delay:.2s} .td:nth-child(3){animation-delay:.4s}
        @keyframes bop { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-5px);opacity:1} }

        /* Refs */
        .refs-wrap { display:flex; flex-direction:column; gap:10px; }
        .refs-header {
          display:flex; align-items:center; gap:8px;
          font-size:10px; font-family:var(--mono); color:var(--text3); font-weight:500; letter-spacing:0.1em;
        }
        .refs-line { flex:1; height:1px; background:var(--border); }
        .refs-label { white-space:nowrap; }
        .refs-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(142px,1fr)); gap:8px; }

        .ref-link { text-decoration:none; }
        .ref-card {
          background:var(--surface); border:1px solid var(--border);
          border-radius:var(--r-sm); padding:10px 12px;
          display:flex; flex-direction:column; gap:6px;
          transition:all var(--t); cursor:pointer;
        }
        .ref-link:hover .ref-card { border-color:var(--indigo); box-shadow:0 0 0 3px var(--indigo-bg); }

        .ref-header { display:flex; align-items:center; gap:6px; }
        .ref-num { font-size:9px; font-family:var(--mono); color:var(--text3); }
        .ref-badge {
          display:flex; align-items:center; gap:3px;
          font-size:9px; font-family:var(--mono); font-weight:600;
          padding:2px 6px; border-radius:3px;
        }
        .ref-badge-web { background:var(--teal-bg); color:var(--teal); }
        .ref-badge-pdf { background:var(--amber-bg); color:var(--amber); }
        .ref-header > svg:last-child { margin-left:auto; color:var(--text3); }
        .ref-name { font-size:11px; font-family:var(--mono); color:var(--text2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .ref-track { height:3px; background:var(--surface2); border-radius:2px; overflow:hidden; }
        .ref-fill  { height:100%; background:var(--indigo); border-radius:2px; }
        .ref-pct   { font-size:10px; font-family:var(--mono); color:var(--text3); }

        /* Input */
        .input-area { padding:18px 28px 24px; flex-shrink:0; }
        .input-card {
          display:flex; align-items:center; gap:10px;
          background:var(--surface); border:1.5px solid var(--border);
          border-radius:16px; padding:7px 7px 7px 18px;
          box-shadow:var(--shadow-md);
          transition:border-color var(--t), box-shadow var(--t);
        }
        .input-card:focus-within {
          border-color:var(--indigo);
          box-shadow:0 0 0 4px var(--indigo-bg), var(--shadow-md);
        }
        .chat-inp {
          flex:1; background:transparent; border:none; outline:none;
          font-size:14px; font-family:var(--font); color:var(--text);
          padding:8px 0; line-height:1.5;
        }
        .chat-inp::placeholder { color:var(--text3); }
        .send-btn {
          width:42px; height:42px; border-radius:12px; flex-shrink:0;
          background:var(--indigo); border:none; color:var(--white);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; box-shadow:0 3px 12px rgba(79,97,245,0.35);
          transition:all var(--t);
        }
        .send-btn:hover:not(:disabled) { background:var(--indigo-d); transform:translateY(-1px); box-shadow:0 5px 18px rgba(79,97,245,0.45); }
        .send-btn:disabled { opacity:0.35; cursor:not-allowed; transform:none; box-shadow:none; }
        .input-hint { text-align:center; margin-top:9px; font-size:11px; font-family:var(--mono); color:var(--text3); }

        /* Language Selector */
        .lang-wrap {
          display:flex; align-items:center; gap:9px;
          margin-bottom:10px;
        }
        .lang-label {
          font-size:12px; font-family:var(--mono); color:var(--text3); font-weight:400; white-space:nowrap;
        }
        .lang-select {
          flex:1; padding:7px 12px; border-radius:var(--r-sm);
          border:1.5px solid var(--border); background:var(--surface);
          font-size:12.5px; font-family:var(--font); color:var(--text2);
          outline:none; cursor:pointer; appearance:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ea3b5' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position:right 10px center;
          padding-right:30px;
          transition:border-color var(--t), box-shadow var(--t);
        }
        .lang-select:focus { border-color:var(--indigo); box-shadow:0 0 0 3px var(--indigo-bg); }
        .lang-select:hover { border-color:var(--border2); }

        .new-session-btn {
          display:flex; align-items:center; gap:5px;
          padding:6px 12px; border-radius:20px;
          background:transparent; border:1.5px solid var(--border2);
          color:var(--text3); font-size:11.5px; font-weight:500; font-family:var(--font);
          cursor:pointer; transition:all var(--t);
        }
        .new-session-btn:hover {
          background:var(--red-bg); border-color:var(--red-bd);
          color:var(--red);
        }
        @keyframes qv-spin { to{transform:rotate(360deg)} }
      `}</style>

      <div className="app">
        <Sidebar sources={sources} onAdd={s=>setSources(p=>[...p,s])} onClear={handleClear}/>

        <div className="main">
          <div className="topbar">
            <div>
              <div className="tb-title">Research Assistant</div>
              <div className="tb-sub">Retrieval-Augmented Generation · URLs & PDFs</div>
            </div>
            <div className="tb-chips" style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <button className="new-session-btn" onClick={handleClear} title="Clear all sources and start fresh">
                <NewSessionIcon /> New Session
              </button>
              <div className="tb-chip"><div className="chip-dot"/>{sources.length} source{sources.length!==1?"s":""}</div>
              <div className="tb-chip">{qCount} quer{qCount!==1?"ies":"y"}</div>
            </div>
          </div>

          <div className="msgs">
            {messages.map((m,i)=><Message key={i} msg={m}/>)}
            {loading && <Thinking/>}
            <div ref={bottomRef} style={{height:28}}/>
          </div>

          <div className="input-area">
            <LangSelector value={language} onChange={setLanguage}/>
          <div className="input-card">
              <input ref={inputRef} className="chat-inp"
                placeholder="Ask anything about your indexed sources…"
                value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
                disabled={loading}/>
              <button className="send-btn" onClick={send} disabled={loading||!input.trim()}>
                {loading?<SpinIcon/>:<SendIcon/>}
              </button>
            </div>
            <div className="input-hint">Press Enter to send · Shift+Enter for new line</div>
          </div>
        </div>
      </div>
    </>
  );
}