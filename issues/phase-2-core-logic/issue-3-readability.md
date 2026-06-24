# Issue 3 — Implement readability.py (Flesch formula)

**Phase:** 2 — Core Logic
**Type:** AFK
**Blocked by:** Issue 2

## What to build

Implement three pure functions in `readability.py`. No side effects, no I/O, no imports beyond `re`. The goal is to make `tests/test_readability.py` fully pass.

- `count_syllables(word: str) -> int` — regex vowel-group approximation
- `compute_flesch_score(text: str) -> float` — returns `0.0` if text is empty; returns `None` if fewer than 3 sentences
- `get_readability_label(score: float) -> str` — maps score to label using the scale below

**Score → Label mapping:**
| Score | Label |
|---|---|
| 90–100 | Very Easy |
| 80–89 | Easy |
| 70–79 | Fairly Easy |
| 60–69 | Standard |
| 50–59 | Fairly Difficult |
| 30–49 | Difficult |
| 0–29 | Very Difficult |

**Formula:** `206.835 − 1.015 × (words/sentences) − 84.6 × (syllables/words)`

## Acceptance criteria

- [ ] `pytest tests/test_readability.py -v` passes — all tests green
- [ ] `compute_flesch_score("")` returns `0.0`
- [ ] Simple text scores higher than complex text
- [ ] `get_readability_label(90)` returns `"Very Easy"`
- [ ] `get_readability_label(30)` returns `"Difficult"` (boundary check)
- [ ] No imports beyond Python stdlib

## Blocked by

Issue 2
