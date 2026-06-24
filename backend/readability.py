from __future__ import annotations

import re
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models import ReadabilityResult


def count_syllables(word: str) -> int:
    if not word:
        return 0
    word = word.lower()
    vowel_groups = re.findall(r"[aeiouy]+", word)
    count = len(vowel_groups)
    if word.endswith("e") and count > 1:
        count -= 1
    return max(1, count)


def compute_flesch_score(text: str) -> float:
    if not text.strip():
        return 0.0

    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
    clean_words = [re.sub(r"[^a-zA-Z]", "", w) for w in text.split()]
    words = [w for w in clean_words if w]

    if not words or not sentences:
        return 0.0

    syllable_count = sum(count_syllables(w) for w in words)
    word_count = len(words)
    sentence_count = len(sentences)

    score = (
        206.835
        - 1.015 * (word_count / sentence_count)
        - 84.6 * (syllable_count / word_count)
    )
    return round(max(0.0, min(100.0, score)), 2)


def get_readability_label(score: float) -> str:
    if score >= 90:
        return "Very Easy"
    if score >= 80:
        return "Easy"
    if score >= 70:
        return "Fairly Easy"
    if score >= 60:
        return "Standard"
    if score >= 50:
        return "Fairly Difficult"
    if score >= 30:
        return "Difficult"
    return "Very Difficult"


def compute(text: str) -> "ReadabilityResult":
    from models import ReadabilityResult

    if not text.strip():
        return ReadabilityResult(score=None, label=None)
    score = compute_flesch_score(text)
    label = get_readability_label(score)
    return ReadabilityResult(score=score, label=label)
