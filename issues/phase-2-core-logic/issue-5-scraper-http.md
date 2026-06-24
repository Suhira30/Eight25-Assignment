# Issue 5 — Implement scraper.py HTTP Layer

**Phase:** 2 — Core Logic
**Type:** AFK
**Blocked by:** Issue 4

## What to build

Implement the public `scrape(url: str) -> ScrapedData` function that ties together HTTP fetch and the extraction functions from Issue 4. This is the only function in `scraper.py` that does I/O.

**Behaviour:**
1. Validate URL format — raise `InvalidURLError` if not `http/https`
2. `GET` the URL with browser-like `User-Agent` header and `timeout=10`
3. On `requests.Timeout` — retry **once**, then raise `URLUnreachableError`
4. On `403/429` — raise `BotBlockedError`
5. On `404` — raise `PageNotFoundError`
6. Parse response with BeautifulSoup, call all extraction functions
7. Extract visible text (strip all tags from body, first 3,000 chars) for AI prompt
8. Return fully populated `ScrapedData`
9. Log `INFO` at start and completion (with elapsed time); log `ERROR` before raising

**Config constants:**
```python
REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
TIMEOUT_SECONDS = 10
VISIBLE_TEXT_MAX_CHARS = 3000
```

## Acceptance criteria

- [ ] `scrape("https://example.com")` returns a `ScrapedData` instance
- [ ] Timeout triggers exactly one retry — two total attempts max
- [ ] `InvalidURLError` raised for `ftp://` or plain `example.com`
- [ ] `BotBlockedError` raised for 403 response
- [ ] `PageNotFoundError` raised for 404 response
- [ ] `visible_text` is capped at 3,000 characters
- [ ] Logger emits INFO on start/complete, ERROR before every raise
- [ ] No exception is caught and swallowed — all propagate to caller

## Blocked by

Issue 4
