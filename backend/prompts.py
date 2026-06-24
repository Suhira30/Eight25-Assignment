from models import ReadabilityResult, ScrapedData

SYSTEM_PROMPT = """\
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
Do not respond with free text under any circumstances.\
"""

ANALYZE_PAGE_TOOL: dict = {
    "name": "analyze_page",
    "description": "Return a structured SEO and content analysis of the provided page metrics.",
    "input_schema": {
        "type": "object",
        "properties": {
            "insights": {
                "type": "array",
                "minItems": 5,
                "maxItems": 5,
                "items": {
                    "type": "object",
                    "properties": {
                        "category": {
                            "type": "string",
                            "enum": [
                                "seo_structure",
                                "messaging_clarity",
                                "cta_usage",
                                "content_depth",
                                "ux_concerns",
                            ],
                        },
                        "finding": {"type": "string"},
                    },
                    "required": ["category", "finding"],
                },
            },
            "recommendations": {
                "type": "array",
                "minItems": 3,
                "maxItems": 5,
                "items": {
                    "type": "object",
                    "properties": {
                        "priority": {
                            "type": "string",
                            "enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
                        },
                        "title": {"type": "string"},
                        "reasoning": {"type": "string"},
                    },
                    "required": ["priority", "title", "reasoning"],
                },
            },
        },
        "required": ["insights", "recommendations"],
    },
}


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
            f"({data.meta_description.length}/160 chars)"
        )
    if readability.score is not None:
        lines.append(f"- Readability: {readability.score}/100 ({readability.label})")

    lines += [
        "",
        "PAGE CONTENT EXCERPT (first 3,000 chars of visible text):",
        data.visible_text,
    ]

    return "\n".join(lines)
