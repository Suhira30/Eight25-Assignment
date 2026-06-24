# Issue 4 — Implement scraper.py Extraction Functions

**Phase:** 2 — Core Logic
**Type:** AFK
**Blocked by:** Issue 2

## What to build

Implement the six pure extraction functions in `scraper.py` that take a `BeautifulSoup` object and return structured data. No HTTP in this issue — HTTP layer is Issue 5. Goal is to make `tests/test_scraper_extraction.py` fully pass.

**Functions to implement:**

- `extract_word_count(soup) -> int` — strip `script`, `style`, `nav`, `footer`, `header` tags first
- `extract_headings(soup) -> HeadingCounts` — count all H1/H2/H3 including empty ones
- `detect_ctas(soup) -> int` — `<button>` + `<input type="submit/button">` + `<a>` matching `CTA_KEYWORDS` (case-insensitive, multi-word match)
- `classify_links(soup, base_url: str) -> LinkCounts` — internal = `/` or same domain; external = different domain; skip `mailto:`, `tel:`, `#`, `javascript:`
- `analyze_images(soup) -> ImageStats` — missing alt = absent attribute OR `alt=""`
- `extract_meta(soup) -> tuple[Optional[MetaField], Optional[MetaField]]` — title from `<title>`, description from `<meta name="description">`

**CTA keyword list:**
```python
CTA_KEYWORDS = [
    "get started", "contact us", "learn more", "sign up", "book",
    "schedule", "request", "download", "try", "buy", "subscribe",
    "get", "start", "register", "demo", "free", "explore"
]
```

## Acceptance criteria

- [ ] `pytest tests/test_scraper_extraction.py -v` passes — all tests green
- [ ] `extract_word_count` excludes nav/script/style content
- [ ] `classify_links` skips `mailto:`, `tel:`, `#`, `javascript:` hrefs
- [ ] `analyze_images` counts `alt=""` as missing
- [ ] `extract_meta` returns `None` for both fields when tags are absent
- [ ] All functions are pure — no HTTP, no file I/O, no logging calls

## Blocked by

Issue 2
