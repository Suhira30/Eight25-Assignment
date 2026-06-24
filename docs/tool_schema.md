# Tool Schema — `analyze_page`

The `analyze_page` tool is the structured output contract between the backend and the AI model. Both the Claude path (tool use) and the Gemini path (response_schema) enforce this shape.

## Full Schema

```json
{
  "name": "analyze_page",
  "description": "Return a structured SEO and content analysis of the provided page metrics.",
  "input_schema": {
    "type": "object",
    "properties": {
      "insights": {
        "type": "array",
        "minItems": 5,
        "maxItems": 5,
        "items": {
          "type": "object",
          "properties": {
            "category": {
              "type": "string",
              "enum": ["seo_structure", "messaging_clarity", "cta_usage", "content_depth", "ux_concerns"]
            },
            "finding": { "type": "string" }
          },
          "required": ["category", "finding"]
        }
      },
      "recommendations": {
        "type": "array",
        "minItems": 3,
        "maxItems": 5,
        "items": {
          "type": "object",
          "properties": {
            "priority": {
              "type": "string",
              "enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
            },
            "title":     { "type": "string" },
            "reasoning": { "type": "string" }
          },
          "required": ["priority", "title", "reasoning"]
        }
      }
    },
    "required": ["insights", "recommendations"]
  }
}
```

---

## Field-by-Field Explanation

### `insights` — array, exactly 5 items

**Why exactly 5?**
The system prompt defines exactly 5 analysis dimensions. Requiring `minItems: 5, maxItems: 5` forces the model to produce one finding per dimension — no skipping a weak area, no padding with extras. A variable-length array would allow the model to omit `ux_concerns` if it found nothing obvious, masking a real finding.

---

### `insights[].category` — enum of 5 values

```
"seo_structure" | "messaging_clarity" | "cta_usage" | "content_depth" | "ux_concerns"
```

**Why an enum?**
Without an enum, the model invents category names: "technical_seo", "content_strategy", "heading_optimization". These are not meaningfully different but they break the frontend mapping (category → icon + title). The enum ensures the category is always a known key that the `CATEGORY_META` lookup in `App.jsx` can resolve to an icon and display title.

---

### `insights[].finding` — string (free text)

**Why free text here?**
The finding is the AI's analysis prose — it cannot be enumerated. However, Rule 1 in the system prompt constrains it: every finding must cite at least one metric value by number. Free text with a hard constraint in the prompt is the right balance — structured enough to parse, expressive enough to be useful.

---

### `recommendations` — array, 3–5 items

**Why 3–5 (not exactly 5)?**
Recommendations require genuine prioritization. Forcing exactly 5 would cause the model to pad with LOW priority items that add noise. A minimum of 3 ensures there is always something actionable. A cap of 5 keeps the report scannable — beyond 5, recommendations lose their priority signal.

---

### `recommendations[].priority` — enum

```
"CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
```

**Why an enum?**
Prevents the model from inventing priorities like "URGENT", "IMPORTANT", "NICE TO HAVE". The four-level enum maps directly to the `PRIORITY_STYLES` object in `Recommendations.jsx`, which renders each level with a distinct color. It also makes recommendations sortable and comparable across different page audits.

---

### `recommendations[].title` — string

Short, scannable action label shown in the recommendations table. Kept as free text since it cannot be enumerated — every page audit produces different recommendations.

---

### `recommendations[].reasoning` — string

The justification tied to a specific metric value (per Rule 5). This is what distinguishes a useful recommendation from a generic one: "Meta description is 182 chars — 22 over the 160-char Google display limit" tells the client exactly what to fix and why.
