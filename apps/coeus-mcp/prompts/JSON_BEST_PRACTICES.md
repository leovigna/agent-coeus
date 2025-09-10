# COEUS_JSON_BEST_PRACTICES.md

## Key Criteria
1. **Not too large** — split big JSON into smaller pieces; add each separately.  
2. **Not deeply nested** — avoid more than 3–4 levels; flatten while preserving information.  
3. **Understandable in isolation** — ensure each JSON is self‑contained with clear names and brief descriptions.  
4. **Unified entity** — each JSON should represent one coherent thing, with `id`, `name/title`, and `description/summary`.

## Handling Oversized JSON
- **Too many attributes** — split across instances; repeat `id`, `name`, `description` in each; add 3–4 extra properties per piece.  
- **Too many list elements** — split into element‑level pieces; add a context field (e.g., `kind: "car"`).  
- **Large strings** — prefer a `text` episode (with a short contextual preface); chunk very long text.

## Deep Nesting
Flatten to focused JSON pieces. Include attributes that capture the path/context so each piece is understandable alone.

## Not Understandable in Isolation
Add short descriptions and clear attribute names as needed.

## Mixed Entities
Split into separate JSON pieces (one per entity), each with its own `id`, `name`, and `description`.

## Combining Issues
Fix size/depth first (split/flatten), then ensure each resulting JSON is standalone and unified.
