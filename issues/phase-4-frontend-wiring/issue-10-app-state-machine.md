# Issue 10 — Wire App.jsx State Machine and API Call

**Phase:** 4 — Frontend Wiring
**Type:** AFK
**Blocked by:** Issues 8, 9

## What to build

Update `App.jsx` to manage the full application state machine and wire all components to real API data. Replace the current static/hardcoded defaults with live data from `POST /analyze`.

**State machine:**
```
idle
  │ user submits URL
  ▼
loading ──── <LoadingState/> shown
  │ fetch completes
  ├── success ──► pass data to all components, show results
  └── error   ──► show <ErrorBanner error={error} reason={reason}/>
```

**State shape:**
```js
const [status, setStatus] = useState('idle')   // 'idle'|'loading'|'success'|'error'
const [data,   setData]   = useState(null)
const [error,  setError]  = useState(null)      // { error, reason }
```

**Data mapping to components:**
- `data.metrics` → `<MetricsSection data={data.metrics} />`
- `data.metrics.readability_score` + `data.metrics.readability_label` → `<ReadabilityGauge />`
- `data.ai_analysis.insights` → `<AIAnalysis insights={...} />`
- `data.ai_analysis.recommendations` → `<Recommendations items={...} />`
- `data.scraped_at` → audit summary bar timestamp
- Full `data` object → stored in state so Export button can include `prompt_log`

## Acceptance criteria

- [ ] Submitting a valid URL transitions to `loading`, then `success` or `error`
- [ ] All five components receive real API data — no hardcoded defaults shown after a successful call
- [ ] `<LoadingState/>` mounts during loading and unmounts on completion
- [ ] `<ErrorBanner/>` mounts on error with the API's `reason` string
- [ ] Submitting a new URL while in `success` state resets to `loading`
- [ ] `fetch` error (network down) is caught and transitions to `error` state
- [ ] `VITE_API_URL` env var used as base URL — defaults to `http://localhost:8000`

## Blocked by

Issues 8, 9
