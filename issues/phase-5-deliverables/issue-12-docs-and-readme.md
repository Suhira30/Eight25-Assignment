# Issue 12 — Write docs/, sample_prompt_log.json, and README.md

**Phase:** 5 — Deliverables
**Type:** AFK
**Blocked by:** Issue 8 (need real prompt output for sample log)

## What to build

All required written deliverables from the assignment PDF. These are what evaluators read before (and instead of) running the code.

---

**`docs/system_prompt.md`** — the full system prompt with a brief design rationale section explaining:
- Why it scopes to 5 SEO dimensions only (not GEO/AEO)
- Why every rule references a metric by value
- Why `tool_choice` is forced (schema enforcement vs free-text parsing)

**`docs/tool_schema.md`** — the `analyze_page` tool schema with a field-by-field explanation of why each constraint exists (enum categories, 5 insights, 3–5 recommendations, priority enum).

**`docs/architecture.md`** — the full architecture diagram (ASCII) + a table of module responsibilities + the data flow numbered step-by-step.

**`sample_prompt_log.json`** — a real run against a live URL showing:
```json
{
  "system_prompt": "...",
  "user_prompt": "...",
  "raw_model_output": "..."
}
```
API key redacted. Committed to repo root so evaluators can read it on GitHub without running the app.

**`README.md`** — one page maximum. Contains:
1. What it does (2 sentences)
2. Tech stack table
3. Setup in < 5 steps (`cp .env.example .env` → add keys → `pip install` → `uvicorn` → `npm run dev`)
4. Links to `docs/system_prompt.md`, `docs/architecture.md`, `sample_prompt_log.json`
5. Trade-offs section (from implementation plan)
6. What to improve with more time (from implementation plan)

## Acceptance criteria

- [ ] `docs/system_prompt.md` explains the 3 key design decisions in the prompt
- [ ] `docs/tool_schema.md` documents every field constraint with a reason
- [ ] `docs/architecture.md` includes the ASCII diagram and step-by-step data flow
- [ ] `sample_prompt_log.json` is a real run — not invented — with key redacted
- [ ] `README.md` setup section works end-to-end for a fresh clone
- [ ] README links to all three `docs/` files and `sample_prompt_log.json`
- [ ] README contains trade-offs and future improvements sections
- [ ] No redundant content between README and `docs/` — README links out, doesn't repeat

## Blocked by

Issue 8
