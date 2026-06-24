# Issue 9 — Add LoadingState.jsx and ErrorBanner.jsx

**Phase:** 4 — Frontend Wiring
**Type:** AFK
**Blocked by:** None — can start immediately (no backend dependency)

## What to build

Two new React components that handle the non-happy-path UI states.

**`LoadingState.jsx`** — shown while `status === 'loading'`. Displays skeleton placeholder cards matching the MetricsSection layout, with a cycling status message that advances every 2.5 seconds:
- 0s: `"Fetching page..."`
- 2.5s: `"Extracting metrics..."`
- 5s: `"Generating insights..."`

Uses a single `isLoading` boolean — no streaming, no SSE. The cycling is a `useEffect` with `setInterval`.

**`ErrorBanner.jsx`** — shown when `status === 'error'`. Accepts `{ error, reason }` props (matching the API error shape). Displays a dismissible banner with the user-friendly `reason` message. Uses `text-error` and `bg-error-container` from the existing Tailwind theme.

## Acceptance criteria

- [ ] `LoadingState` cycles through all 3 messages and stops when unmounted
- [ ] `LoadingState` renders skeleton cards that match the grid layout of `MetricsSection`
- [ ] `ErrorBanner` renders `reason` — not the raw `error` code
- [ ] `ErrorBanner` has a dismiss/close button that clears the error state
- [ ] Both components use existing Tailwind theme tokens — no hardcoded hex values
- [ ] No API calls in either component

## Blocked by

None — can start immediately
