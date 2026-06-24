# Issue 7 — Implement analyzer.py (Gemini + Claude provider abstraction)

**Phase:** 3 — AI Layer
**Type:** AFK
**Blocked by:** Issue 6

## What to build

Implement `analyzer.py` — the AI provider abstraction that reads `AI_PROVIDER` from the environment at startup and routes to either Gemini Flash (dev) or Claude Sonnet (production). Both paths return an identical `(AIAnalysis, PromptLog)` tuple.

**Public interface:**
```python
def analyze(data: ScrapedData, readability: ReadabilityResult) -> tuple[AIAnalysis, PromptLog]:
    ...
```

**Gemini path** (`AI_PROVIDER=gemini`):
- Use `google.generativeai` with `response_mime_type="application/json"` and `response_schema` matching the `analyze_page` tool shape
- Model: `gemini-2.0-flash`

**Claude path** (`AI_PROVIDER=claude`):
- Use `anthropic` SDK with `tools=[ANALYZE_PAGE_TOOL]` and `tool_choice={"type": "tool", "name": "analyze_page"}`
- Model: `claude-sonnet-4-6`

**Both paths must:**
1. Call `build_user_prompt()` from `prompts.py`
2. Capture raw model output (before parsing) into `PromptLog.raw_model_output`
3. Parse the structured response into `AIAnalysis`
4. Raise `ProviderRateLimitError` on 429, `ProviderTimeoutError` on timeout
5. Log INFO at start/complete, ERROR before raising

## Acceptance criteria

- [ ] `AI_PROVIDER=gemini` routes to Gemini, `AI_PROVIDER=claude` routes to Claude
- [ ] Both paths return a valid `AIAnalysis` with exactly 5 insights and 3–5 recommendations
- [ ] `PromptLog` captures `system_prompt`, `user_prompt`, and `raw_model_output`
- [ ] `ProviderRateLimitError` raised on rate limit from either provider
- [ ] No HTTP logic, no scraping, no file I/O — pure AI call and parse
- [ ] `analyzer.py` does not import from `scraper.py` or `readability.py` directly

## Blocked by

Issue 6
