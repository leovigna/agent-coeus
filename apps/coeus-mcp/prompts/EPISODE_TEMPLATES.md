# COEUS_EPISODE_TEMPLATES (v1.01)

Non‑strict JSON Schemas and JSON examples for the **`data`** payload when calling Zep Actions with `type="json"`
(`zep-addData` for one, `zep-addDataBatch` for many). Keep JSON **≤10,000 chars stringified** per episode, shallow, self‑contained, and unified.

## Document — JSON Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Document",
  "type": "object",
  "additionalProperties": true,
  "properties": {
    "type": { "const": "Document" },
    "id": { "type": "string" },
    "title": { "type": "string" },
    "url": { "type": "string", "format": "uri" },
    "publisher": { "type": "string" },
    "published_at": { "type": "string", "format": "date" },
    "authors": { "type": "array", "items": { "type": "string" } },
    "summary": { "type": "array", "items": { "type": "string" } },
    "key_points": { "type": "array", "items": { "type": "string" } },
    "metrics": { "type": "object", "additionalProperties": true },
    "topics": { "type": "array", "items": { "type": "string" } },
    "tags": { "type": "array", "items": { "type": "string" } },
    "captured_at": { "type": "string", "format": "date-time" },
    "source_url": { "type": "string", "format": "uri" },
    "description": { "type": "string" }
  }
}
```
### Document — JSON Example
```json
{
  "type": "Document",
  "title": "EU Crypto Rule Update (MiCA scope)",
  "url": "https://example.com/eu-mica-update",
  "publisher": "Example News",
  "published_at": "2025-09-09",
  "summary": [
    "MiCA X requirement applies to Y entities in 2026",
    "Licensing deadlines tighten in DE/FR; enforcement notes"
  ],
  "key_points": ["CASP registration windows", "Stablecoin reserve rules"],
  "topics": ["crypto regulation", "MiCA"],
  "captured_at": "2025-09-09T20:00:00Z",
  "source_url": "https://example.com/eu-mica-update",
  "description": "News article summarizing recent EU crypto rule updates."
}
```

## ResearchSummary — JSON Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "ResearchSummary",
  "type": "object",
  "additionalProperties": true,
  "properties": {
    "type": { "const": "ResearchSummary" },
    "id": { "type": "string" },
    "scope": { "type": "string" },
    "timeframe": { "type": "string" },
    "assumptions": { "type": "string" },
    "estimates": { "type": "object", "additionalProperties": true },
    "leaders": { "type": "array", "items": { "type": "string" } },
    "regions": { "type": "array", "items": { "type": "string" } },
    "sources": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "title": { "type": "string" },
          "url": { "type": "string", "format": "uri" },
          "publisher": { "type": "string" },
          "published_at": { "type": "string", "format": "date" }
        }
      }
    },
    "confidence": { "type": "string" },
    "captured_at": { "type": "string", "format": "date-time" },
    "description": { "type": "string" }
  }
}
```
### ResearchSummary — JSON Example
```json
{
  "type": "ResearchSummary",
  "scope": "Online sportsbooks; US/EU/LATAM",
  "timeframe": "2025–2028",
  "assumptions": "Exchange availability; licensing timelines",
  "estimates": {"TAM_2025_range": "$X–$Y", "CAGR": "~Z%"},
  "leaders": ["Org A", "Org B"],
  "regions": ["US", "EU", "LATAM"],
  "sources": [
    {"title": "Global Sports Betting Trends", "url": "https://source1.example", "publisher": "Analyst House", "published_at": "2025-08-30"},
    {"title": "Regulatory Update EU", "url": "https://source2.example", "publisher": "Policy Weekly", "published_at": "2025-08-17"}
  ],
  "confidence": "medium",
  "captured_at": "2025-09-09T20:05:00Z",
  "description": "Cross-source synthesis of market size, growth rates, and regulatory posture."
}
```

## Lead — JSON Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Lead",
  "type": "object",
  "additionalProperties": true,
  "properties": {
    "type": { "const": "Lead" },
    "id": { "type": "string" },
    "name": { "type": "string" },
    "role": { "type": "string" },
    "organization": { "type": "string" },
    "profiles": {
      "type": "object",
      "additionalProperties": true,
      "properties": {
        "linkedin": { "type": "string", "format": "uri" },
        "twitter": { "type": "string", "format": "uri" },
        "website": { "type": "string", "format": "uri" }
      }
    },
    "public_contact": {
      "type": "object",
      "additionalProperties": true,
      "properties": {
        "email": { "type": "string", "format": "email" },
        "telegram": { "type": "string" },
        "other": { "type": "string" }
      }
    },
    "focus": { "type": "string" },
    "notes": { "type": "string" },
    "tags": { "type": "array", "items": { "type": "string" } },
    "location": { "type": "string" },
    "captured_at": { "type": "string", "format": "date-time" },
    "source_url": { "type": "string", "format": "uri" },
    "description": { "type": "string" }
  }
}
```
### Lead — JSON Example
```json
{
  "type": "Lead",
  "name": "Jane Doe",
  "role": "Head of Engineering",
  "organization": "Acme",
  "profiles": {"linkedin": "https://linkedin.com/in/...", "twitter": "https://twitter.com/...", "website": "https://acme.example"},
  "public_contact": {"email": "jane@acme.example"},
  "focus": "AI infrastructure",
  "notes": "Recent talk on RAG evals; possible warm intro via X",
  "tags": ["CRM", "ThoughtLeader", "US"],
  "location": "San Francisco, CA",
  "captured_at": "2025-09-09T20:10:00Z",
  "source_url": "https://linkedin.com/in/...",
  "description": "Public information captured for CRM lead management."
}
```

## Event — JSON Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Event",
  "type": "object",
  "additionalProperties": true,
  "properties": {
    "type": { "const": "Event" },
    "id": { "type": "string" },
    "name": { "type": "string" },
    "start_at": { "type": "string", "format": "date-time" },
    "end_at": { "type": "string", "format": "date-time" },
    "timezone": { "type": "string" },
    "participants": { "type": "array", "items": { "type": "string" } },
    "location": { "type": "string" },
    "topics": { "type": "array", "items": { "type": "string" } },
    "outcomes": { "type": "array", "items": { "type": "string" } },
    "owner": { "type": "string" },
    "captured_at": { "type": "string", "format": "date-time" },
    "description": { "type": "string" }
  }
}
```
### Event — JSON Example
```json
{
  "type": "Event",
  "name": "Q3 Planning Sync",
  "start_at": "2025-09-10T15:00:00+03:00",
  "end_at": "2025-09-10T16:00:00+03:00",
  "timezone": "Europe/Istanbul",
  "participants": ["L V", "Ops Team"],
  "location": "Zoom https://zoom.us/j/...",
  "topics": ["2026 Budget", "Hiring Plan"],
  "outcomes": ["Finalize budget by 2025-09-20 (Owner: L V)"],
  "owner": "L V",
  "captured_at": "2025-09-09T20:15:00Z",
  "description": "Internal planning sync with budget and hiring objectives."
}
```

## Update — JSON Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Update",
  "type": "object",
  "additionalProperties": true,
  "properties": {
    "type": { "const": "Update" },
    "id": { "type": "string" },
    "subject": { "type": "string" },
    "changed_fields": { "type": "object", "additionalProperties": true },
    "was": { "type": "string" },
    "now": { "type": "string" },
    "reason": { "type": "string" },
    "impacts": { "type": "array", "items": { "type": "string" } },
    "effective_at": { "type": "string", "format": "date-time" },
    "captured_at": { "type": "string", "format": "date-time" },
    "description": { "type": "string" }
  }
}
```
### Update — JSON Example
```json
{
  "type": "Update",
  "subject": "HY ETF launch date",
  "changed_fields": {"launch_date": {"was": "2025-10-01", "now": "2025-10-15"}},
  "was": "2025-10-01",
  "now": "2025-10-15",
  "reason": "Custody onboarding delay",
  "impacts": ["Launch event", "Marketing timeline"],
  "effective_at": "2025-10-15T00:00:00Z",
  "captured_at": "2025-09-09T20:20:00Z",
  "description": "Schedule correction for launch date."
}
```
