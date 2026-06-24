# Issue 1 — Scaffold Backend Project Structure

**Phase:** 1 — Backend Foundation
**Type:** AFK
**Blocked by:** None — can start immediately

## What to build

Create the complete backend folder layout with all required files in place and dependencies pinned. This is the skeleton every subsequent phase builds on. No logic yet — just structure, dependencies, and environment config.

## Acceptance criteria

- [ ] `backend/` folder exists at repo root
- [ ] `requirements.txt` lists all pinned dependencies: `fastapi`, `uvicorn`, `requests`, `beautifulsoup4`, `pydantic`, `python-dotenv`, `anthropic`, `google-generativeai`, `pytest`
- [ ] `backend/.env.example` contains `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `AI_PROVIDER=gemini`
- [ ] `backend/.env` is present in `.gitignore` and never committed
- [ ] Empty placeholder files exist for: `main.py`, `scraper.py`, `analyzer.py`, `readability.py`, `models.py`, `prompts.py`, `logger.py`, `exceptions.py`
- [ ] `backend/tests/__init__.py` exists
- [ ] `backend/tests/fixtures/sample_page.html` exists (already written)
- [ ] `pip install -r requirements.txt` completes without errors

## Blocked by

None — can start immediately
