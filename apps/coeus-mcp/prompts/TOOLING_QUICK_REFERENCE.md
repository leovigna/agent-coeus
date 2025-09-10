# COEUS_TOOLING_QUICK_REFERENCE.md (Actions v1.4)

You are using **Coeus GPT Actions** (alias: `neat-perfectly-buck.ngrok-free.app`).  
**Always** call the configured **GPT Actions by operationId**. Do **not** construct raw HTTP or bare paths.

## Auth
### `whoami` — Auth Check (startup; before writes; after any 401/403)
**Args:** none  
**Success:** proceed. **401/403:** prompt sign‑in; set **PERSIST=OFF**; do not claim writes.

## Write
### `add_memory` — Add Episode
**Args:**  
- `name` *(string, required)* — short, scannable title (prefer `Type: Subject — YYYY‑MM‑DD`).  
- `episode_body` *(string, required)* — content to persist (≤ **10,000** chars). If `source="json"`, this is a **stringified JSON** object.  
- `source` *(string, optional)* — one of `text | json | message`.  
- `source_description` *(string, optional)* — human‑readable provenance (e.g., `Web:domain | Title | YYYY‑MM‑DD`).  
- `uuid` *(string, optional)* — client‑supplied episode UUID.

**Returns:** success or error payload (check; then optionally confirm via `get_episodes`).

## Search
### `search_memory_nodes` — Search Node Summaries (no label filters)
**Args:** `query` (string), optional `group_ids` (array), `max_nodes` (default 10, **max 50**), `center_node_uuid` (string), `entity` (omit/empty).

### `search_memory_facts` — Search Relationships
**Args:** `query` (string), optional `group_ids`, `max_facts` (default 10, **max 50**), `center_node_uuid` (string).

### `search` — Generic Search
**Args:** `query` (string).

## Verify & Manage
### `get_episodes` — Retrieve Recent Episodes (spot‑check writes)
**Args:** optional `group_id`, `last_n` (default 10).

### `get_entity_edge` / `delete_entity_edge` / `delete_episode` / `clear_graph` / `fetch`
Follow the arguments advertised by each Action.

## Error Patterns
- **401/403**: unauthenticated/unauthorized → prompt sign‑in, set **PERSIST=OFF**, retry after auth.  
- **413**: episode too large → chunk JSON/text (≤ 10k each).  
- **429**: rate limit → back off; avoid near‑duplicate bursts.  
- **5xx**: transient → retry with jitter.  
- **Anti‑hallucination**: after `add_memory` success, confirm via `get_episodes` before claiming “saved.”
