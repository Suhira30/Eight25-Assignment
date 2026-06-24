# Issue 2 — Implement Shared Foundation (logger, exceptions, models)

**Phase:** 1 — Backend Foundation
**Type:** AFK
**Blocked by:** Issue 1

## What to build

Implement the three shared modules every other backend module depends on. No HTTP, no AI, no scraping — just the typed contracts, exception hierarchy, and logging setup that all other modules import.

**`logger.py`** — single `get_logger(name)` factory. Every module calls `logger = get_logger(__name__)`. No `print()` anywhere in the codebase.

**`exceptions.py`** — full typed hierarchy:
```
ScrapeError(Exception)          code: str, reason: str
├── InvalidURLError
├── URLUnreachableError
├── BotBlockedError
└── PageNotFoundError

AIAnalysisError(Exception)      reason: str
├── ProviderRateLimitError
└── ProviderTimeoutError
```

**`models.py`** — all Pydantic v2 models with full type hints:
`AnalyzeRequest`, `HeadingCounts`, `LinkCounts`, `ImageStats`, `MetaField`, `ScrapedData`, `ReadabilityResult`, `AIInsight`, `Recommendation`, `AIAnalysis`, `PromptLog`, `AuditResponse`

`meta_title`, `meta_description`, `readability_score`, `readability_label` are all `Optional` with `None` defaults.

## Acceptance criteria

- [ ] `get_logger(__name__)` returns a configured logger with stdout handler and `%(asctime)s %(levelname)-8s %(name)s %(message)s` format
- [ ] All exception classes carry typed fields (`code`, `reason`) and are importable from `exceptions`
- [ ] All Pydantic models import cleanly — `from models import AuditResponse` works
- [ ] `Optional` fields default to `None` — `ScrapedData(url="x", word_count=0, ...)` works without meta fields
- [ ] Every function and model field has a type annotation — no bare `Any`
- [ ] No business logic in any of these three files

## Blocked by

Issue 1
