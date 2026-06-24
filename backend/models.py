from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, HttpUrl


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
    visible_text: str


class ReadabilityResult(BaseModel):
    score: Optional[float] = None
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
    metrics: dict
    ai_analysis: AIAnalysis
    prompt_log: PromptLog
