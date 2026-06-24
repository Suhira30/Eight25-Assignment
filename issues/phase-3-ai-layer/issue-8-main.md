# Issue 8 — Implement main.py (FastAPI endpoint)

**Phase:** 3 — AI Layer
**Type:** AFK
**Blocked by:** Issues 5, 7

## What to build

Implement `main.py` — the FastAPI application. This module contains zero business logic. Its only job is to orchestrate the three backend modules, handle CORS, and map typed exceptions to structured JSON error responses.

**Route:**
```
POST /analyze
Body: { "url": "https://example.com" }
Response 200: AuditResponse
Response 422: { "error": "<code>", "reason": "<message>" }
Response 502: { "error": "AI_FAILED", "reason": "<message>" }
```

**Orchestration (all synchronous, in order):**
1. `scraped_data = scraper.scrape(str(request.url))`
2. `readability = readability_module.compute(scraped_data.visible_text)`
3. `ai_analysis, prompt_log = analyzer.analyze(scraped_data, readability)`
4. Assemble and return `AuditResponse`

**CORS:** allow all origins during development (`*`).

**Exception handlers:**
- `ScrapeError` subclasses → `422` with `{ "error": exc.code, "reason": exc.reason }`
- `AIAnalysisError` subclasses → `502` with `{ "error": "AI_FAILED", "reason": exc.reason }`
- Unhandled → `500` with generic message, full traceback logged

## Acceptance criteria

- [ ] `uvicorn main:app --reload` starts without errors
- [ ] `POST /analyze` with a valid URL returns a full `AuditResponse` JSON
- [ ] `POST /analyze` with `{ "url": "not-a-url" }` returns `422` with structured error
- [ ] CORS headers present on response — frontend can call from `localhost:5173`
- [ ] `main.py` contains no BeautifulSoup imports, no Anthropic imports, no regex
- [ ] All four exception types map to the correct HTTP status codes
- [ ] Health check route `GET /health` returns `{ "status": "ok" }`

## Blocked by

Issues 5, 7
