# Implementation Plan — EIGHT25MEDIA Website Audit Tool

> All decisions in this plan were resolved through structured pre-implementation
> discussion. No assumptions were made. Every choice has a documented rationale.

---

## Decision Log

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Readability score | Python Flesch formula | Clean scraper/AI separation — scores evaluator criterion directly |
| 2 | Export format | `window.print()` → PDF | Zero deps, client-side, professional enough for agency–client sharing |
| 3 | API shape | Single `POST /analyze` | One round-trip; clean module separation inside backend |
| 4 | Response structure | Unified JSON with `prompt_log` inline | Evaluators see prompt traces without running the app |
| 5 | AI structured output | Claude tool use + forced `tool_choice` | Schema-enforced JSON, never parses free text |
| 6 | CTA detection | `<button>` + keyword-matched `<a>` + `<input type="submit/button">` | Defensible, specific, referenceable by Claude |
| 7 | Error handling | Typed exceptions, retry once on timeout | Raise deep, catch at boundary |
| 8 | Loading UX | Cycling status messages | Polished, zero complexity |
| 9 | Prompt logs | In API response + `sample_prompt_log.json` committed | Evaluator reads without running app |
| 10 | AI provider | `gemini` (dev) → `claude` (production) via `AI_PROVIDER` | Cost-safe development, production-grade delivery |
| 11 | Unit tests | Pure extraction functions only — no AI, no HTTP | Fast, deterministic, demonstrates engineering discipline |
| 12 | Docs structure | `docs/` folder — system prompt, schema, architecture | README stays 1 page; depth lives in `docs/` |
| 13 | Null metrics | Excluded from user prompt — never sent to AI | Prevents hallucination; only real data reaches Claude |
| 14 | Word count | Strip `<script>`, `<style>`, `<nav>`, `<footer>`, `<header>` | Body content words only — metric is meaningful |
| 15 | Missing alt | Count both absent `alt` AND `alt=""` | SEO-correct interpretation — both are lost indexing opportunities |
| 16 | Link filter | Skip `mailto:`, `tel:`, `#`, `javascript:` hrefs | Only real navigation links counted |
| 17 | Empty headings | Count all heading tags regardless of content | Empty H1 is a real SEO issue Claude should flag |
| 18 | System prompt | Scoped to 5 SEO dimensions, grounded in extracted metrics | Built from SEO/GEO/AEO professional framework; GEO/AEO excluded (needs multi-page crawl) |

---

## Repo Structure

```
Eight25-Assignment/
│
├── README.md                        # Setup in < 5 steps + links to docs/
├── IMPLEMENTATION_PLAN.md           # This file
├── sample_prompt_log.json           # Real run output — API key redacted
│
├── docs/
│   ├── system_prompt.md             # Full system prompt + design rationale
│   ├── tool_schema.md               # analyze_page tool schema with field explanations
│   └── architecture.md             # Data flow diagram + module responsibilities
│
├── backend/
│   ├── main.py                      # FastAPI app — route, CORS, exception handlers only
│   ├── scraper.py                   # HTTP fetch + all BeautifulSoup extraction
│   ├── analyzer.py                  # AI provider abstraction — Gemini or Claude
│   ├── readability.py               # Flesch Reading Ease — pure functions, no side effects
│   ├── models.py                    # All Pydantic models — single shared contract
│   ├── prompts.py                   # System prompt, tool schema, build_user_prompt()
│   ├── logger.py                    # Structured logging — single logger instance
│   ├── exceptions.py                # Custom exception hierarchy
│   ├── requirements.txt
│   ├── .env.example
│   └── tests/
│       ├── __init__.py
│       ├── fixtures/
│       │   └── sample_page.html     # Realistic HTML fixture
│       ├── test_readability.py      # ✓ written
│       └── test_scraper_extraction.py  # ✓ written
│
└── frontend/
    └── src/
        ├── App.jsx                  # ← update: state machine + API call
        └── components/
            ├── Header.jsx           # ✓ done
            ├── URLInput.jsx         # ← update: wire to onAnalyze
            ├── MetricsSection.jsx   # ✓ done — accepts data prop
            ├── ReadabilityGauge.jsx # ✓ done — accepts score prop
            ├── AIAnalysis.jsx       # ✓ done — accepts insights prop
            ├── Recommendations.jsx  # ✓ done — accepts items prop
            ├── Footer.jsx           # ✓ done
            ├── LoadingState.jsx     # ← new
            └── ErrorBanner.jsx      # ← new
```

---

## Architecture

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
│  [Export] ──── window.print() ──── browser PDF dialog        │
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
│          reads AI_PROVIDER env var      └─ Claude Sonnet (prod│
│          both return AIAnalysis           └─ AIAnalysis       │
│          (Pydantic)                          (Pydantic)       │
│                                                               │
│  AuditResponse ◄── models.py (single shared Pydantic contract)│
└──────────────────────────────────────────────────────────────┘
```

---

## API Contract

### Request
```http
POST /analyze
Content-Type: application/json

{ "url": "https://example.com" }
```

### Success `200`
```json
{
  "url": "https://example.com",
  "scraped_at": "2024-10-24T10:30:00Z",
  "metrics": {
    "word_count": 1482,
    "headings": { "h1": 1, "h2": 8, "h3": 14 },
    "ctas": 12,
    "links": { "internal": 45, "external": 12 },
    "images": { "total": 24, "missing_alt": 6, "missing_alt_pct": 25 },
    "meta_title": { "text": "...", "length": 54 },
    "meta_description": { "text": "...", "length": 182 },
    "readability_score": 68,
    "readability_label": "Standard"
  },
  "ai_analysis": {
    "insights": [
      { "category": "seo_structure",     "finding": "..." },
      { "category": "messaging_clarity", "finding": "..." },
      { "category": "cta_usage",         "finding": "..." },
      { "category": "content_depth",     "finding": "..." },
      { "category": "ux_concerns",       "finding": "..." }
    ],
    "recommendations": [
      { "priority": "CRITICAL", "title": "...", "reasoning": "..." },
      { "priority": "HIGH",     "title": "...", "reasoning": "..." },
      { "priority": "MEDIUM",   "title": "...", "reasoning": "..." }
    ]
  },
  "prompt_log": {
    "system_prompt": "...",
    "user_prompt": "...",
    "raw_model_output": "..."
  }
}
```

### Error `422 / 502`
```json
{ "error": "BOT_BLOCKED", "reason": "Site returned 403 — bot protection detected" }
```

> `meta_title` and `meta_description` are `Optional` — absent when the page has no such tags.
> `readability_score` and `readability_label` are `Optional` — absent when visible text is too short.
> Null metrics are never included in the user prompt sent to Claude/Gemini.

---

## Module Responsibilities

### `exceptions.py`
```
ScrapeError(Exception)
├── InvalidURLError        malformed or non-HTTP URL
├── URLUnreachableError    timeout — retry once, then raise
├── BotBlockedError        403 / 429
└── PageNotFoundError      404

AIAnalysisError(Exception)
├── ProviderRateLimitError
└── ProviderTimeoutError
```
**Rule:** Raise deep inside modules. Catch only at `main.py` boundary.

---

### `models.py` — Pydantic models (shared contract)

```python
class AnalyzeRequest(BaseModel):
    url: HttpUrl

class HeadingCounts(BaseModel):
    h1: int
    h2: int
    h3: int

class LinkCounts(BaseModel):
    internal: int
    external: int

class ImageStats(BaseModel):
    total: int
    missing_alt: int
    missing_alt_pct: int

class MetaField(BaseModel):
    text: str
    length: int

class ScrapedData(BaseModel):
    url: str
    word_count: int
    headings: HeadingCounts
    ctas: int
    links: LinkCounts
    images: ImageStats
    meta_title: Optional[MetaField] = None
    meta_description: Optional[MetaField] = None
    visible_text: str                          # first 3,000 chars — for AI prompt

class ReadabilityResult(BaseModel):
    score: Optional[float] = None              # None if text too short to compute
    label: Optional[str] = None

class AIInsight(BaseModel):
    category: str
    finding: str

class Recommendation(BaseModel):
    priority: str
    title: str
    reasoning: str

class AIAnalysis(BaseModel):
    insights: list[AIInsight]
    recommendations: list[Recommendation]

class PromptLog(BaseModel):
    system_prompt: str
    user_prompt: str
    raw_model_output: str

class AuditResponse(BaseModel):
    url: str
    scraped_at: datetime
    metrics: dict                              # ScrapedData + ReadabilityResult merged
    ai_analysis: AIAnalysis
    prompt_log: PromptLog
```

---

### `scraper.py` — Extraction rules

| Metric | Method | Edge cases handled |
|---|---|---|
| Word count | Strip `script`, `style`, `nav`, `footer`, `header` tags then split | Excludes JS/CSS/navigation text |
| H1/H2/H3 | `soup.find_all('hN')` — count all, including empty | Empty heading = real SEO issue |
| CTAs | `<button>` + `<input type="submit/button">` + `<a>` matching `CTA_KEYWORDS` | Case-insensitive; multi-word match |
| Internal links | `href` starting with `/` or matching input domain | Strips `mailto:`, `tel:`, `#`, `javascript:` |
| External links | `href` starting with `http/https` and domain differs | Same exclusions as above |
| Images total | `soup.find_all('img')` | |
| Missing alt | `alt` attribute absent OR `alt=""` | Empty string = missing for SEO |
| Meta title | `<title>` tag text | Strip whitespace |
| Meta description | `<meta name="description" content="...">` | Returns `None` if absent |
| Visible text | Strip all tags from body — first 3,000 chars | Fed to AI prompt as content excerpt |

```python
CTA_KEYWORDS = [
    "get started", "contact us", "learn more", "sign up", "book",
    "schedule", "request", "download", "try", "buy", "subscribe",
    "get", "start", "register", "demo", "free", "explore"
]

REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
TIMEOUT_SECONDS = 10   # retry once on Timeout, then raise URLUnreachableError
```

---

### `readability.py` — Flesch Reading Ease

```
score = 206.835 − 1.015 × (words / sentences) − 84.6 × (syllables / words)
```
Returns `None` if text has fewer than 3 sentences (score would be meaningless).

| Score | Label |
|---|---|
| 90–100 | Very Easy |
| 80–89 | Easy |
| 70–79 | Fairly Easy |
| 60–69 | Standard |
| 50–59 | Fairly Difficult |
| 30–49 | Difficult |
| 0–29 | Very Difficult |

Syllable counting: regex vowel-group approximation. Sufficient accuracy, zero dependencies.

---

### `prompts.py` — System prompt & user prompt builder

#### System Prompt (full text also in `docs/system_prompt.md`)

```
You are an expert digital marketing analyst specializing in SEO and content
optimization for high-performing marketing websites.

You will receive structured metrics extracted from a single webpage — word count,
heading structure, CTA counts, link ratios, image alt coverage, meta tags,
readability score, and a visible text excerpt.

RULES — follow these without exception:
1. Every insight must reference at least one specific extracted metric by value.
   Say "your meta description is 182 characters — 22 over the 160-character limit",
   not "your meta description is too long."
2. Only analyze metrics present in the data. If a metric was not provided,
   do not reference, assume, or speculate about it.
3. Be specific to this page. No generic SEO advice that could apply to any site.
4. Insights must be relevant to a web marketing agency evaluating a client's page.
5. Recommendations must be prioritized CRITICAL → HIGH → MEDIUM → LOW,
   each with reasoning tied directly to a specific metric value.

ANALYSIS DIMENSIONS — cover only what the data supports:
- seo_structure    : heading hierarchy, meta tag quality, image alt coverage
- messaging_clarity: value proposition clarity from content excerpt
- cta_usage        : CTA count relative to word count — sparse, optimal, or diluted
- content_depth    : word count vs ideal range, heading distribution
- ux_concerns      : readability barriers, alt text gaps, link ratio anomalies

You must call the analyze_page tool with your structured response.
Do not respond with free text under any circumstances.
```

#### User Prompt — null metrics excluded

```python
def build_user_prompt(data: ScrapedData, readability: ReadabilityResult) -> str:
    lines = [
        f"URL: {data.url}",
        "",
        "EXTRACTED METRICS:",
        f"- Word count: {data.word_count} (ideal range: 1,000–2,000)",
        f"- Headings: H1={data.headings.h1}, H2={data.headings.h2}, H3={data.headings.h3}",
        f"- CTAs detected: {data.ctas}",
        f"- Links: {data.links.internal} internal, {data.links.external} external",
        f"- Images: {data.images.total} total, "
        f"{data.images.missing_alt} missing alt text ({data.images.missing_alt_pct}%)",
    ]

    if data.meta_title:
        lines.append(
            f'- Meta title: "{data.meta_title.text}" ({data.meta_title.length}/60 chars)'
        )
    if data.meta_description:
        lines.append(
            f'- Meta description: "{data.meta_description.text}" '
            f'({data.meta_description.length}/160 chars)'
        )
    if readability.score is not None:
        lines.append(
            f"- Readability: {readability.score}/100 ({readability.label})"
        )

    lines += [
        "",
        "PAGE CONTENT EXCERPT (first 3,000 chars of visible text):",
        data.visible_text,
    ]

    return "\n".join(lines)
```

---

### `analyzer.py` — AI provider abstraction

Reads `AI_PROVIDER` env var at startup. Both providers return the same `AIAnalysis` Pydantic model.

```
AI_PROVIDER=gemini  → google-generativeai SDK, response_schema for structured output
AI_PROVIDER=claude  → anthropic SDK, tool_choice={"type":"tool","name":"analyze_page"}
```

Both paths:
1. Call `build_user_prompt()` from `prompts.py`
2. Capture system prompt, user prompt, raw model output into `PromptLog`
3. Parse tool/schema response into `AIAnalysis`
4. Return `(AIAnalysis, PromptLog)` tuple — no HTTP, no file I/O

---

### `logger.py`

Single structured logger. Every module imports from here — no `print()` anywhere.

```python
import logging, sys

def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter(
            "%(asctime)s  %(levelname)-8s  %(name)s  %(message)s"
        ))
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger
```

Usage in every module: `logger = get_logger(__name__)`

---

### `main.py` — Orchestration only

```python
@app.post("/analyze", response_model=AuditResponse)
async def analyze(request: AnalyzeRequest) -> AuditResponse:
    scraped_data   = scraper.scrape(str(request.url))
    readability    = readability_module.compute(scraped_data.visible_text)
    ai_analysis, prompt_log = analyzer.analyze(scraped_data, readability)
    return assemble_response(scraped_data, readability, ai_analysis, prompt_log)
```

Exception handlers map each typed exception to a structured JSON error response.
`main.py` contains no business logic — only orchestration and HTTP boundary concerns.

---

## Environment Variables

**`backend/.env.example`**
```
ANTHROPIC_API_KEY=your-claude-key-here
GEMINI_API_KEY=your-gemini-key-here
AI_PROVIDER=gemini
```

Switch to `AI_PROVIDER=claude` for production / final submission.

---

## Unit Tests (already written)

Tests are spec-first (TDD). They will be red until modules are implemented.

| File | Functions tested |
|---|---|
| `test_readability.py` | `count_syllables`, `compute_flesch_score`, `get_readability_label` |
| `test_scraper_extraction.py` | `extract_word_count`, `extract_headings`, `detect_ctas`, `classify_links`, `analyze_images`, `extract_meta` |

```bash
cd backend && pytest tests/ -v
```

---

## Frontend State Machine (`App.jsx`)

```
idle
  │ user submits URL
  ▼
loading  ──── cycling messages every 2.5s
  │ API returns
  ├── success ──► pass data to all components
  └── error   ──► show <ErrorBanner error={error} />
```

State shape:
```js
const [status, setStatus] = useState('idle')   // 'idle' | 'loading' | 'success' | 'error'
const [data,   setData]   = useState(null)
const [error,  setError]  = useState(null)
```

---

## Implementation Steps

### Phase 1 — Backend foundation
- [ ] `requirements.txt` — pin all dependencies
- [ ] `logger.py` — single structured logger
- [ ] `exceptions.py` — full typed exception hierarchy
- [ ] `models.py` — all Pydantic models with full type hints

### Phase 2 — Core logic (TDD — tests already written, make them pass)
- [ ] `readability.py` — `count_syllables`, `compute_flesch_score`, `get_readability_label`
- [ ] `scraper.py` extraction functions — `extract_word_count`, `extract_headings`, `detect_ctas`, `classify_links`, `analyze_images`, `extract_meta`
- [ ] `scraper.py` HTTP layer — `scrape(url)` with retry + typed exceptions

### Phase 3 — AI layer
- [ ] `prompts.py` — system prompt string, tool schema dict, `build_user_prompt()`
- [ ] `analyzer.py` — Gemini path, Claude path, both return `(AIAnalysis, PromptLog)`
- [ ] `main.py` — FastAPI app, CORS, `POST /analyze`, exception handlers

### Phase 4 — Frontend wiring
- [ ] `LoadingState.jsx` — skeleton cards + cycling status messages
- [ ] `ErrorBanner.jsx` — renders `error` and `reason` from API
- [ ] `App.jsx` — state machine, `fetch`, pass real data to all components
- [ ] `URLInput.jsx` — connect form submit to `onAnalyze` prop
- [ ] `index.css` — `@media print` rules for PDF export

### Phase 5 — Deliverables
- [ ] `docs/system_prompt.md` — full prompt with design rationale
- [ ] `docs/tool_schema.md` — `analyze_page` schema with field explanations
- [ ] `docs/architecture.md` — diagram + module responsibilities
- [ ] `backend/.env.example`
- [ ] `sample_prompt_log.json` — real run output, API key redacted
- [ ] `README.md` — setup in < 5 steps, stack table, links to `docs/`

---

## Software Development Principles Applied Throughout

| Principle | Application |
|---|---|
| Single Responsibility | Each file does exactly one thing — no module touches two concerns |
| Separation of Concerns | `scraper.py` never calls AI; `analyzer.py` never does HTTP |
| DRY | `models.py` is the one shared contract — no type duplication |
| Raise deep, catch at boundary | Exceptions propagate to `main.py` handlers only |
| Type hints everywhere | Every Python function fully typed — no `Any` |
| No silent failures | Every exception logged and returned as structured error |
| Meaningful names | No `data`, `result`, `tmp` — every variable describes its content |
| TDD for pure logic | Tests written before implementation for scraper and readability |

---

## Trade-offs (README section)

| Trade-off | Decision | Reason |
|---|---|---|
| No JS rendering | `requests` + BeautifulSoup only | Playwright adds 500 MB and 30s/request |
| Single retry | Not exponential backoff | 24-hour scope; documented as improvement |
| Syllable approximation | Regex vowel groups | Sufficient accuracy, zero dependencies |
| No caching | Re-analyzes on every request | Avoids Redis complexity |
| Client-side PDF | `window.print()` | Universal, zero server load |
| No GEO/AEO analysis | Out of scope for single-page tool | Requires multi-page crawl + schema extraction |
| Partial analysis on missing meta | Null metrics excluded from prompt | Prevents AI hallucination over absent data |

---

## What to Improve With More Time (README section)

1. **Playwright** — render JS-heavy SPAs (React/Vue sites return near-empty HTML to `requests`)
2. **Redis caching** — URL + timestamp key, 1-hour TTL, skip re-scraping recent URLs
3. **Streaming via SSE** — real-time progress events instead of cycling client-side messages
4. **Google PageSpeed API** — Core Web Vitals (LCP, CLS, FID) as additional metrics
5. **GEO/AEO layer** — schema markup extraction, multi-page E-E-A-T signals
6. **Audit history** — compare two runs of the same URL over time
7. **Rate limiting** — per-IP throttling on FastAPI to prevent abuse
