# Website Audit Tool

An AI-powered single-page audit tool that scrapes a URL, extracts factual SEO metrics, and runs structured AI analysis via Claude Sonnet 4.6 or Gemini Flash 2.0 -- returning grounded, metric-referenced insights and prioritized recommendations.

Built for the EIGHT25MEDIA AI-Native Software Engineer assignment.

---

| Layer          | Technology                                |
| -------------- | ----------------------------------------- |
| Frontend       | React 19 + Vite 8 + Tailwind CSS v4       |
| Backend        | FastAPI + Uvicorn (Python 3.9+)           |
| Scraping       | BeautifulSoup4 + Requests                 |
| Data contracts | Pydantic v2                               |
| AI (dev)       | Gemini Flash 2.0 (google-generativeai)    |
| AI (prod)      | Claude Sonnet 4.6 (anthropic)             |
| Readability    | Flesch Reading Ease -- pure Python, no AI |

---

## Setup

1. Clone the repo and enter the directory
2. Copy backend/.env.example to backend/.env and add your API keys
3. pip install -r backend/requirements.txt
4. cd backend && uvicorn main:app --reload (http://localhost:8000)
5. cd frontend && npm install && npm run dev (http://localhost:5173)

Switch AI provider: set AI_PROVIDER=claude in backend/.env for production.

**Optional — JS-rendered page support (Playwright):**

```
pip install playwright && playwright install chromium
```

Then set USE_PLAYWRIGHT=true in backend/.env. This enables headless Chromium scraping,
which handles JS-rendered DOM, lazy-loaded images (Intersection Observer), and
async-resolved URLs. Default is false (requests + BeautifulSoup, faster, no browser dep).

---

## Docs

- docs/system_prompt.md -- full prompt text + 3 key design decisions
- docs/tool_schema.md -- analyze_page schema with field-by-field reasoning
- docs/architecture.md -- data flow diagram + module responsibilities
- sample_prompt_log.json -- real run output (API key redacted)

---

## Running Tests

cd backend && pytest tests/ -v

41 unit tests covering pure extraction functions (no AI, no HTTP).

---

## Trade-offs

- Single POST /analyze: one round-trip, simple state machine -- no streaming progress
- Flesch formula: zero cost, deterministic -- less accurate than ML-based models
- window.print() for PDF: zero dependencies -- limited styling vs headless Chrome
- GEO/AEO excluded: all insights grounded in real data -- narrower audit scope
- Null metrics excluded from AI prompt: prevents hallucination -- model cannot infer missing tags
- Retry once on timeout: handles transient failures -- doubles worst-case latency
- Default scraper (requests) misses JS-injected images -- USE_PLAYWRIGHT=true resolves this at the cost of a Chromium dep and ~3-5s extra latency
- Playwright scroll covers one viewport only -- infinite-scroll content below fold is not captured (multi-scroll simulation is out of scope for single-page audit)

---

## What I Would Improve With More Time

1. PageSpeed API integration -- real Lighthouse score via Google PageSpeed Insights API
2. Streaming response -- Server-Sent Events for real-time pipeline progress
3. Multi-page crawl -- crawl 10 internal links to enable GEO/AEO analysis
4. Caching -- Redis layer to avoid re-scraping the same URL within a time window
5. Auth + history -- save past audits per user so agencies can track improvements
6. Webhook / async -- accept request immediately, notify via webhook when done
