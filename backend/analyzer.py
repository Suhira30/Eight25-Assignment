import json
import os

from dotenv import load_dotenv

from exceptions import ProviderRateLimitError, ProviderTimeoutError
from logger import get_logger
from models import AIAnalysis, AIInsight, PromptLog, ReadabilityResult, Recommendation, ScrapedData
from prompts import ANALYZE_PAGE_TOOL, SYSTEM_PROMPT, build_user_prompt

load_dotenv()

logger = get_logger(__name__)

_AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini").lower()


def _analyze_gemini(user_prompt: str) -> tuple:
    import google.generativeai as genai
    from google.api_core.exceptions import DeadlineExceeded, GoogleAPICallError, ResourceExhausted

    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

    gemini_system = (
        SYSTEM_PROMPT.replace(
            "You must call the analyze_page tool with your structured response.\n"
            "Do not respond with free text under any circumstances.",
            ""
        ).rstrip()
        + "\n\nRespond ONLY with a JSON object using EXACTLY this structure — no other keys:\n"
        '{\n'
        '  "insights": [\n'
        '    {"category": "<seo_structure|messaging_clarity|cta_usage|content_depth|ux_concerns>", "finding": "<metric-referenced sentence>"}\n'
        '  ],\n'
        '  "recommendations": [\n'
        '    {"priority": "<CRITICAL|HIGH|MEDIUM|LOW>", "title": "<short title>", "reasoning": "<why, tied to a metric value>"}\n'
        '  ]\n'
        '}'
    )

    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=gemini_system,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
        ),
    )

    logger.info("Gemini input prompt:\n%s", user_prompt)

    try:
        response = model.generate_content(user_prompt)
    except ResourceExhausted as exc:
        logger.exception("Gemini rate limit exceeded: %s", exc)
        raise ProviderRateLimitError()
    except DeadlineExceeded as exc:
        logger.exception("Gemini request timed out: %s", exc)
        raise ProviderTimeoutError()
    except GoogleAPICallError as exc:
        logger.exception("Gemini API error: %s", exc)
        from exceptions import AIAnalysisError
        raise AIAnalysisError(reason=str(exc)) from exc

    raw_output = response.text
    logger.info("Gemini raw output:\n%s", raw_output)
    parsed = json.loads(raw_output)

    def _norm_insight(i: dict) -> dict:
        return {
            "category": i.get("category") or i.get("dimension") or i.get("type") or "",
            "finding": i.get("finding") or i.get("observation") or i.get("insight") or i.get("description") or "",
        }

    def _norm_rec(r: dict) -> dict:
        return {
            "priority": r.get("priority") or r.get("importance") or "MEDIUM",
            "title": r.get("title") or r.get("name") or r.get("recommendation") or "",
            "reasoning": r.get("reasoning") or r.get("rationale") or r.get("description") or r.get("details") or "",
        }

    insights_raw = (
        parsed.get("insights") or parsed.get("insight_list") or parsed.get("analysis") or []
    )
    recs_raw = (
        parsed.get("recommendations") or parsed.get("recommendation_list")
        or parsed.get("suggested_actions") or parsed.get("actions") or []
    )

    ai_analysis = AIAnalysis(
        insights=[AIInsight(**_norm_insight(i)) for i in insights_raw],
        recommendations=[Recommendation(**_norm_rec(r)) for r in recs_raw],
    )
    return ai_analysis, raw_output


def _analyze_claude(user_prompt: str) -> tuple:
    import anthropic

    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            tools=[ANALYZE_PAGE_TOOL],
            tool_choice={"type": "tool", "name": "analyze_page"},
            messages=[{"role": "user", "content": user_prompt}],
        )
    except anthropic.RateLimitError as exc:
        logger.exception("Claude rate limit exceeded: %s", exc)
        raise ProviderRateLimitError()
    except anthropic.APITimeoutError as exc:
        logger.exception("Claude request timed out: %s", exc)
        raise ProviderTimeoutError()
    except anthropic.BadRequestError as exc:
        logger.exception("Claude bad request: %s", exc)
        from exceptions import AIAnalysisError
        raise AIAnalysisError(reason=str(exc)) from exc

    tool_block = next(
        block for block in response.content if block.type == "tool_use"
    )
    raw_output = json.dumps(tool_block.input, indent=2)

    ai_analysis = AIAnalysis(
        insights=[AIInsight(**i) for i in tool_block.input["insights"]],
        recommendations=[Recommendation(**r) for r in tool_block.input["recommendations"]],
    )
    return ai_analysis, raw_output


def analyze(data: ScrapedData, readability: ReadabilityResult) -> tuple:
    user_prompt = build_user_prompt(data, readability)
    logger.info("Starting AI analysis via provider=%s for %s", _AI_PROVIDER, data.url)

    if _AI_PROVIDER == "gemini":
        ai_analysis, raw_output = _analyze_gemini(user_prompt)
    elif _AI_PROVIDER == "claude":
        ai_analysis, raw_output = _analyze_claude(user_prompt)
    else:
        raise ValueError(f"Unknown AI_PROVIDER: {_AI_PROVIDER!r}. Must be 'gemini' or 'claude'.")

    prompt_log = PromptLog(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=user_prompt,
        raw_model_output=raw_output,
    )
    logger.info(
        "AI analysis complete: %d insights, %d recommendations",
        len(ai_analysis.insights),
        len(ai_analysis.recommendations),
    )
    return ai_analysis, prompt_log
