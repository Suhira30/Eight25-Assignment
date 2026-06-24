# Issue 11 — Wire URLInput.jsx and Add Print CSS for PDF Export

**Phase:** 4 — Frontend Wiring
**Type:** AFK
**Blocked by:** Issue 10

## What to build

Two small but required pieces that complete the frontend:

**`URLInput.jsx`** — connect the form submit to the `onAnalyze` prop already defined. The component already exists; it just needs the `onAnalyze` call wired to the `App.jsx` handler that triggers the API call.

**Print CSS in `index.css`** — `@media print` rules that make `window.print()` produce a clean, professional PDF:
- Hide: `<Header>` export button, `<URLInput>` section, `<Footer>`
- Show: all metric cards, readability gauge, AI analysis, recommendations table
- Force white background, black text on all cards
- Add page title and URL at the top of the print view
- Prevent table rows from splitting across pages (`page-break-inside: avoid`)
- Remove box shadows and hover borders (print doesn't need them)

The Export button in `Header.jsx` calls `window.print()` — no changes needed to Header itself.

## Acceptance criteria

- [ ] Submitting a URL in `URLInput` triggers `onAnalyze` and transitions `App.jsx` to `loading`
- [ ] Pressing Enter in the input field submits the form
- [ ] Export button triggers `window.print()` producing a PDF with all report sections visible
- [ ] Print output hides the URL input bar and nav buttons
- [ ] Print output shows the URL being audited and the report date
- [ ] No layout shifts or broken styles in print preview

## Blocked by

Issue 10
