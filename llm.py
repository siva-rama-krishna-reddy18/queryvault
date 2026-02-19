"""
llm.py
------
Builds the prompt from retrieved context and calls the Groq LLM.
Supports multilingual responses via a language parameter.
"""

import os
from groq import Groq
from dotenv import load_dotenv
from typing import List

load_dotenv()

GROQ_MODEL = "llama-3.1-8b-instant"  # swap to llama-3.3-70b-versatile for better quality

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ── Supported languages ───────────────────────────────────────────────────────
LANGUAGES = {
    "en": "English",
    "te": "Telugu",
    "hi": "Hindi",
    "ta": "Tamil",
    "fr": "French",
    "de": "German",
    "es": "Spanish",
    "ja": "Japanese",
    "zh": "Chinese",
    "ar": "Arabic",
}

# ── Build the RAG prompt ──────────────────────────────────────────────────────
def build_prompt(query: str, context_chunks: List[dict], language: str = "en") -> str:
    lang_name = LANGUAGES.get(language, "English")
    context_text = "\n\n---\n\n".join(
        [f"Source: {c['source']}\n{c['text']}" for c in context_chunks]
    )
    prompt = f"""You are a helpful assistant. Answer the user's question using ONLY the context provided below.
You MUST respond in {lang_name} language only. Do not respond in any other language.
If the answer is not in the context, say so in {lang_name}.

## Context:
{context_text}

## Question:
{query}

## Answer (respond in {lang_name} only):"""
    return prompt


# ── Call Groq ─────────────────────────────────────────────────────────────────
def ask_groq(query: str, context_chunks: List[dict], language: str = "en") -> str:
    """Send prompt to Groq and return the answer string in the requested language."""
    lang_name = LANGUAGES.get(language, "English")
    prompt = build_prompt(query, context_chunks, language)

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": f"You are a precise and helpful RAG assistant. Always respond in {lang_name} language only, regardless of the language of the source documents.",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        model=GROQ_MODEL,
        temperature=0.2,
        max_tokens=1024,
    )

    return chat_completion.choices[0].message.content.strip()