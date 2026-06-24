# Issue 6 — Implement prompts.py

**Phase:** 3 — AI Layer
**Type:** AFK
**Blocked by:** Issue 2

## What to build

Implement `prompts.py` — the isolated module that owns all AI prompt design. Three exports: the system prompt string, the tool schema dict, and the user prompt builder function.

**`SYSTEM_PROMPT`** (string constant):
```
You are an expert digital marketing analyst specializing in SEO and content
optimization for high-performing marketing websites.

You will receive structured metrics extracted from a single webpage — word count,
heading structure, CTA counts, link ratios, image alt coverage, meta tags,
readability score, and a visible text excerpt.

RULES — follow these without exception:
1. Every insight must reference at least one specific extracted metric by value.
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

**`ANALYZE_PAGE_TOOL`** — tool schema dict with `insights` (array of 5, enum categories) and `recommendations` (array of 3–5, enum priorities).

**`build_user_prompt(data: ScrapedData, readability: ReadabilityResult) -> str`** — constructs the user prompt. Always includes: word count, headings, CTAs, links, images. Conditionally includes (only if not `None`): `meta_title`, `meta_description`, `readability_score`. Always ends with the visible text excerpt.

## Acceptance criteria

- [ ] `SYSTEM_PROMPT` is a module-level string constant — not a function
- [ ] `ANALYZE_PAGE_TOOL` schema enforces `category` as an enum of the 5 dimensions
- [ ] `ANALYZE_PAGE_TOOL` schema enforces `priority` as enum `["CRITICAL","HIGH","MEDIUM","LOW"]`
- [ ] `build_user_prompt` omits `meta_title` line when `data.meta_title is None`
- [ ] `build_user_prompt` omits `meta_description` line when `data.meta_description is None`
- [ ] `build_user_prompt` omits readability line when `readability.score is None`
- [ ] No API calls, no imports from `anthropic` or `google` — pure data construction

## Blocked by

Issue 2
