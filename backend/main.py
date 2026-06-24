import os
import time
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import analyzer
import readability as readability_module
import scraper
from exceptions import AIAnalysisError, ScrapeError
from logger import get_logger
from models import AnalyzeRequest, AuditResponse

load_dotenv()

logger = get_logger(__name__)

# In-memory TTL cache keyed by normalized URL.
# Avoids re-running the full scrape + AI pipeline for repeat requests.
_CACHE_TTL = int(os.getenv("CACHE_TTL_SECONDS", "1800"))  # default 30 min
_cache: dict[str, dict] = {}


def _cache_get(url: str) -> AuditResponse | None:
    entry = _cache.get(url)
    if not entry:
        return None
    if time.time() - entry["ts"] > _CACHE_TTL:
        del _cache[url]
        return None
    return entry["data"]


def _cache_set(url: str, data: AuditResponse) -> None:
    _cache[url] = {"ts": time.time(), "data": data}


app = FastAPI(title="Website Audit Tool")

_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
_allowed_origins = [o.strip() for o in _raw_origins.split(",")] if _raw_origins != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ScrapeError)
async def scrape_error_handler(request: Request, exc: ScrapeError) -> JSONResponse:
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=422,
        content={"error": exc.code, "reason": exc.reason},
        headers={"Access-Control-Allow-Origin": origin},
    )


@app.exception_handler(AIAnalysisError)
async def ai_error_handler(request: Request, exc: AIAnalysisError) -> JSONResponse:
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=502,
        content={"error": "AI_FAILED", "reason": exc.reason},
        headers={"Access-Control-Allow-Origin": origin},
    )


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s: %s", request.url.path, exc)
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        content={"error": "INTERNAL_ERROR", "reason": "An unexpected error occurred."},
        headers={"Access-Control-Allow-Origin": origin},
    )


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(request: AnalyzeRequest) -> AuditResponse:
    url = str(request.url)

    cached = _cache_get(url)
    if cached:
        logger.info("Cache hit for %s", url)
        return cached

    scraped_data = scraper.scrape(url)
    readability = readability_module.compute(scraped_data.visible_text)
    ai_analysis, prompt_log = analyzer.analyze(scraped_data, readability)

    metrics: dict = {
        "word_count": scraped_data.word_count,
        "headings": scraped_data.headings.model_dump(),
        "ctas": scraped_data.ctas,
        "links": scraped_data.links.model_dump(),
        "images": scraped_data.images.model_dump(),
        "readability_score": readability.score,
        "readability_label": readability.label,
    }
    if scraped_data.meta_title:
        metrics["meta_title"] = scraped_data.meta_title.model_dump()
    if scraped_data.meta_description:
        metrics["meta_description"] = scraped_data.meta_description.model_dump()

    result = AuditResponse(
        url=url,
        scraped_at=datetime.now(timezone.utc),
        metrics=metrics,
        ai_analysis=ai_analysis,
        prompt_log=prompt_log,
    )
    _cache_set(url, result)
    return result
