# Architecture

## System Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      BROWSER (React 19)                       │
│                                                               │
│  [URLInput] ──── POST /analyze ──────────────────────────┐   │
│                                                           │   │
│  <LoadingState/>                                          │   │
│   "Fetching page..." (0s)                                 │   │
│   "Extracting metrics..." (2.5s)                          │   │
│   "Generating insights..." (5s)                           │   │
│                                                           ▼   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐│
│  │   Metrics    │  │ Readability  │  │  AI Analysis +       ││
│  │   Section    │  │   Gauge      │  │  Recommendations     ││
│  └──────────────┘  └──────────────┘  └──────────────────────┘│
│                                                               │
│  [Export] ──── globalThis.print() ──── browser PDF dialog    │
└──────────────────────────────────────────────────────────────┘
                            │
                     POST /analyze
                     { "url": "..." }
                            │
┌───────────────────────────▼──────────────────────────────────┐
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
│    └── analyzer.py ───────────────────► Gemini Flash (dev)   │
│          reads AI_PROVIDER env var      └─ Claude Sonnet (prod)
│          both return (AIAnalysis,         └─ AIAnalysis       │
│                        PromptLog)            (Pydantic)       │
│                                                               │
│  AuditResponse ◄── models.py (single shared Pydantic contract)│
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
1.  Browser sends  POST /analyze  { "url": "https://client-site.com" }

2.  main.py        validates URL via Pydantic AnalyzeRequest
                   raises 422 immediately if malformed

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
      a. Tokenize into sentences and words
      b. Count syllables per word (regex vowel-group approximation)
      c. Apply Flesch formula: 206.835 − 1.015×(w/s) − 84.6×(syl/w)
      d. Map score to label (Very Easy → Very Difficult)
      e. Return ReadabilityResult (Pydantic)

5.  analyzer.analyze(scraped_data, readability)
      a. Call build_user_prompt() — null metrics excluded from output
      b. Route to Gemini (AI_PROVIDER=gemini) or Claude (AI_PROVIDER=claude)
      c. Gemini: GenerativeModel with response_schema=_PageAnalysis
         Claude: messages.create with tool_choice forced to analyze_page
      d. Parse structured response into AIAnalysis (Pydantic)
      e. Capture system_prompt + user_prompt + raw_model_output into PromptLog
      f. Return (AIAnalysis, PromptLog)

6.  main.py assembles AuditResponse
      metrics dict: ScrapedData fields + ReadabilityResult (null metrics included)
      ai_analysis:  AIAnalysis
      prompt_log:   PromptLog (system prompt, user prompt, raw model output)

7.  FastAPI serializes AuditResponse to JSON → 200 OK

8.  Browser receives JSON
      App.jsx normalizes snake_case → camelCase
      Passes data to MetricsSection, ReadabilityGauge, AIAnalysis, Recommendations
      Audit summary bar shows URL + scraped_at timestamp

9.  Exception path (any step above):
      ScrapeError subclass  → 422 { error: code, reason: message }
      AIAnalysisError       → 502 { error: "AI_FAILED", reason: message }
      Unhandled exception   → 500 { error: "INTERNAL_ERROR", reason: "..." }
      All exceptions logged before mapping — no silent failures
```
