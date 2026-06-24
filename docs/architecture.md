# Architecture

## System Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      BROWSER (React 19)                       │
│                                                               │
│  [URLInput]                                                   │
│      │                                                        │
│      ├─ Phase 1: POST /analyze?metrics_only=true  (~2–3 s)   │
│      │                                                        │
│      │   <LoadingState/> skeleton shown while waiting         │
│      │                                                        │
│      │   ┌──────────────┐  ┌──────────────┐                  │
│      │   │   Metrics    │  │ Readability  │  ← appears first │
│      │   │   Section    │  │   Gauge      │                   │
│      │   └──────────────┘  └──────────────┘                  │
│      │                                                        │
│      └─ Phase 2: POST /analyze          (~8–15 s)            │
│                                                               │
│          ┌──────────────────────────────────────────────┐    │
│          │  AI Analysis + Recommendations               │    │
│          │  (skeleton → real content when ready)        │    │
│          └──────────────────────────────────────────────┘    │
│                                                               │
│  Cache hit: Phase 1 returns full result → Phase 2 skipped    │
│                                                               │
│  [Export] ──── globalThis.print() ──── browser PDF dialog    │
└──────────────────────────────────────────────────────────────┘
                     │                  │
          Phase 1 (metrics_only)   Phase 2 (full)
          POST /analyze            POST /analyze
          ?metrics_only=true       { "url": "..." }
                     │                  │
┌────────────────────▼──────────────────▼──────────────────────┐
│                     FastAPI Backend                            │
│                                                               │
│  main.py                                                      │
│    │                                                          │
│    ├── scraper.py ────────────────────► BeautifulSoup         │
│    │     retry once on timeout          └─ ScrapedData        │
│    │                                       (Pydantic)         │
│    │                                                          │
│    ├── readability.py ─────────────────► Flesch formula       │
│    │     pure function                   └─ ReadabilityResult │
│    │                                       (Pydantic)         │
│    │                                                          │
│    ├── [metrics_only=true] ────────────► return early         │
│    │     skip AI call                    AuditResponse        │
│    │                                     (ai_analysis=None)   │
│    │                                                          │
│    └── analyzer.py ───────────────────► Gemini 2.5 Flash     │
│          reads AI_PROVIDER env var      └─ AIAnalysis         │
│          returns (AIAnalysis, PromptLog)   (Pydantic)         │
│                                                               │
│  AuditResponse ◄── models.py (single shared Pydantic contract)│
│  (ai_analysis Optional — None on metrics_only path)          │
└──────────────────────────────────────────────────────────────┘
```

---

## Module Responsibilities

| Module | Single responsibility | Imports from |
|---|---|---|
| `main.py` | HTTP boundary: routing, CORS, exception → JSON mapping | scraper, readability, analyzer, models, exceptions |
| `scraper.py` | HTTP fetch + all BeautifulSoup extraction, retry logic | models, exceptions, logger |
| `readability.py` | Flesch formula: syllable counting, score, label | models (lazy) |
| `analyzer.py` | AI provider abstraction: Gemini or Claude, returns structured output | models, prompts, exceptions, logger |
| `prompts.py` | System prompt string, tool schema dict, user prompt builder | models |
| `models.py` | All Pydantic v2 data contracts — single shared truth | (none) |
| `exceptions.py` | Typed exception hierarchy — raised deep, caught at boundary | (none) |
| `logger.py` | Single structured logger factory — no `print()` anywhere | (none) |

**Separation enforced:**
- `scraper.py` never imports `anthropic` or `google.generativeai`
- `analyzer.py` never imports `requests` or `bs4`
- `readability.py` has zero third-party imports

---

## Data Flow (step by step)

```
─── PHASE 1 (metrics_only=true) ───────────────────────────────

1.  Browser sends  POST /analyze?metrics_only=true  { "url": "..." }

2.  main.py        checks TTL cache — hit returns full result immediately
                   validates URL via Pydantic AnalyzeRequest

3.  scraper.scrape(url)
      a. GET request with browser User-Agent, timeout=10s
      b. Retry once on Timeout → raise URLUnreachableError on second timeout
      c. Map 403/429 → BotBlockedError, 404 → PageNotFoundError
      d. Parse HTML with BeautifulSoup
      e. Run 6 extraction functions (pure, no side effects):
           extract_word_count, extract_headings, detect_ctas,
           classify_links, analyze_images, extract_meta
      f. Extract visible_text (first 3,000 chars, body only)
      g. Return ScrapedData (Pydantic)

4.  readability.compute(scraped_data.visible_text)
      Apply Flesch formula → ReadabilityResult (Pydantic)

5.  main.py detects metrics_only=true → return early
      AuditResponse(metrics=..., ai_analysis=None, prompt_log=None)
      ~2–3 s total

6.  Browser receives partial JSON
      MetricsSection and ReadabilityGauge render immediately
      AIAnalysis and Recommendations show skeleton placeholders

─── PHASE 2 (full analysis) ────────────────────────────────────

7.  Browser sends  POST /analyze  { "url": "..." }

8.  main.py        checks TTL cache — hit returns full result, Phase 2 done

9.  scraper.scrape(url) — re-runs scrape (~1–2 s)

10. readability.compute() — re-runs (instant)

11. analyzer.analyze(scraped_data, readability)
      a. Call build_user_prompt() — null metrics excluded from output
      b. Route to Gemini (AI_PROVIDER=gemini) or Claude (AI_PROVIDER=claude)
      c. Gemini: GenerativeModel with response_mime_type=application/json
         Claude: messages.create with tool_choice forced to analyze_page
      d. Parse structured response into AIAnalysis (Pydantic)
      e. Capture system_prompt + user_prompt + raw_model_output into PromptLog
      f. Return (AIAnalysis, PromptLog)

12. main.py assembles full AuditResponse → stores in TTL cache
      metrics dict: ScrapedData fields + ReadabilityResult
      ai_analysis:  AIAnalysis
      prompt_log:   PromptLog (system prompt, user prompt, raw model output)

13. FastAPI serializes AuditResponse to JSON → 200 OK

14. Browser receives full JSON
      AIAnalysis skeleton replaced with real insight cards
      Recommendations skeleton replaced with prioritized table
      Audit summary bar appears

─── Exception path (any step above) ────────────────────────────

      ScrapeError subclass  → 422 { error: code, reason: message }
      AIAnalysisError       → 502 { error: "AI_FAILED", reason: message }
      Unhandled exception   → 500 { error: "INTERNAL_ERROR", reason: "..." }
      All exceptions logged before mapping — no silent failures
      Phase 1 failure → error banner, no results shown
      Phase 2 failure → metrics remain visible, AI sections hidden
```
