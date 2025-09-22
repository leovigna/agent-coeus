# COEUS_JSON_BEST_PRACTICES (v1.01)

Guidelines for preparing JSON to place in the **`data`** field when `type="json"` for Zep Actions.

## Key Criteria
1. **Not too large** — split big JSON into smaller episodes; each ≤ **10,000 chars** stringified.  
2. **Not deeply nested** — avoid >3–4 levels; flatten while preserving information.  
3. **Understandable in isolation** — each episode should stand alone (clear names, brief descriptions).  
4. **Unified entity** — each episode represents one coherent thing with `id`, `name/title`, and `description/summary`.

## Handling Oversized JSON
- **Too many attributes** — split across instances; repeat `id`, `name`, `description` in each; add 3–4 extra props per piece.  
- **Long lists** — split into element-level episodes; add context fields (e.g., `kind: "car"`).  
- **Large strings** — prefer a `type="text"` episode with a short contextual preface; chunk very long text.

## Deep Nesting
Flatten into focused episodes; include attributes that capture the original path/context so the piece is self-describing.

## Not Understandable in Isolation
Add short descriptions and clear attribute names.

## Mixed Entities
Split into separate episodes (one per entity), each with its own `id`, `name`, and `description`.

## Combining Issues
Fix size/depth first (split/flatten), then ensure each resulting JSON is standalone and unified.
