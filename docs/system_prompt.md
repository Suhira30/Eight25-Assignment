# System Prompt — Design Rationale

## Full Prompt Text

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

---

## Design Decision 1 — Scoped to 5 SEO dimensions, not GEO/AEO

**What was excluded:** Generative Engine Optimization (GEO) and Answer Engine Optimization (AEO) — structured schema markup, entity coverage, citation density, FAQ schema, knowledge graph presence.

**Why it was excluded:** GEO and AEO analysis requires:
- Multi-page crawl to assess entity consistency across the domain
- Structured data extraction (`application/ld+json`, microdata)
- Cross-referencing against external knowledge graphs

A single-page scrape cannot produce defensible GEO/AEO findings. Including them would force the model to speculate without data, violating Rule 2. The 5 dimensions chosen (SEO structure, messaging clarity, CTA usage, content depth, UX concerns) are fully supportable from single-page metrics.

**Trade-off:** The audit scope is narrower than a full-service SEO platform but every insight is grounded in real extracted data — no hallucination risk.

---

## Design Decision 2 — Every rule references a metric by value

Rule 1 explicitly instructs:
> Say "your meta description is 182 characters — 22 over the 160-character limit", not "your meta description is too long."

**Why:** LLMs default to vague, generic SEO advice when given free rein. The `build_user_prompt()` function sends every metric with its exact value. Demanding that the model echo these values back in its findings:
1. Proves the model read and used the structured data (not template-filling)
2. Makes findings immediately actionable — the client sees a number they can act on
3. Makes hallucination detectable — if a finding cites a value not in the prompt, it's wrong

This is the core "AI-native" design choice: the AI is grounded in structured scraper output, not generating prose from scratch.

---

## Design Decision 3 — `tool_choice` forced, never free text

The Claude path uses:
```python
tool_choice={"type": "tool", "name": "analyze_page"}
```

The Gemini path uses:
```python
response_mime_type="application/json",
response_schema=_PageAnalysis,
```

**Why forced tool use instead of asking the model to "respond in JSON":**

Asking a model to "return JSON" produces JSON most of the time but fails unpredictably:
- Markdown code fences around the JSON (`\`\`\`json`)
- Prose before/after the JSON block
- Escaped characters that break `json.loads()`
- Schema drift on complex nested structures

Forced tool use (`tool_choice`) and `response_schema` make the structured output a model contract, not a suggestion. The parser never needs to handle free text — if the model call succeeds, the output is guaranteed valid JSON matching the schema. No regex, no strip, no fallback parsing.
