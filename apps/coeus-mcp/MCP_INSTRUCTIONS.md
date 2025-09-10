# Coeus MCP — Server Instructions

## What Coeus Is
Coeus is an MCP server backed by **Zep Cloud’s temporal knowledge graph**. Clients:
- **Add** “episodes” (content snippets) → Zep automatically extracts **entities (nodes)** and **facts (edges)**.
- **Search** for entities and relationships to ground task execution.

> Clients **do not** set entity/edge types when writing. Zep infers them from the episode. Types are only used when **searching**.

## Auth & Scope
- Authenticate with a **Bearer token** (or MCP auth handshake if supported).
- One graph per authenticated user; **no `group_id` required**.
- Writes are processed **asynchronously** and **sequentially** per user to avoid race conditions.

## Tools Overview
Introspect the tool schemas at connect time and follow the JSON parameter specs exposed by MCP.

### `add_memory`
Primary write path: add an **episode** to the graph.

**Parameters**
- `name` *(string, required)* — concise, scannable title (e.g., `Event: Q3 Planning Sync — 2025-09-10`).
- `episode_body` *(string, required)* — content to persist.  
  - If `source="json"`, this must be a **properly escaped JSON string**.
- `source` *(string, optional)* — one of: `text` | `message` | `json`. Default: `text`.
- `source_description` *(string, optional)* — human-readable provenance (e.g., `Chat:ChatGPT`).
- `uuid` *(string, optional)* — client-supplied episode UUID (rare).

**Behavior**
- Returns immediately; ingestion runs in the background and is **sequenced** per user.
- Zep extracts entities/facts from the episode (you don’t set labels).

**Examples**
- `text`:
  ```json
  {
    "name": "Company News",
    "episode_body": "Acme Corp announced a new product line today.",
    "source": "text",
    "source_description": "news article"
  }
  ```
- `message`:
  ```json
  {
    "name": "Customer Conversation",
    "episode_body": "user: What's your return policy?\nassistant: You can return items within 30 days.",
    "source": "message",
    "source_description": "chat transcript"
  }
  ```
- `json`:
  ```json
  {
    "name": "Customer Profile",
    "episode_body": "{\"company\":{\"name\":\"Acme Technologies\"},\"products\":[{\"id\":\"P001\",\"name\":\"CloudSync\"}]}",
    "source": "json",
    "source_description": "customer profile data"
  }
  ```

### `search_nodes`
Search entities (people, orgs, docs, events, topics, preferences, etc.).

**Typical parameters**
- `query` *(string)* — natural language or keywords.
- `search_filters.node_labels` *(string[])* — optional filter by entity type labels.
- Pagination/limits as defined in the tool schema.

**Use cases**
- Find `Document`s by title/URL, `Event`s by name/date, `Organization`s, `Preference`s, etc.

### `search_facts`
Search relationships/edges between entities.

**Typical parameters**
- `query` *(string, optional)*.
- `center_node_uuid` *(string, optional)* — expand from a known node.
- Optional edge filters (per schema).

**Use cases**
- Who attended an event, what documents relate to a topic, who works for which org, etc.

### (Optional management helpers, if advertised)
- `get_episodes`, `delete_episode`, `delete_entity_edge`, `clear_graph` — use with care.

## Ontology (for **retrieval** filters)
**Entities:** `User`, `Assistant`, `Preference`, `Location`, `Event`, `Object`, `Topic`, `Organization`, `Document`  
**Edges:** `LocatedAt`, `OccurredAt`, `ParticipatedIn`, `Owns`, `Uses`, `WorksFor`, `Discusses`, `RelatesTo`

> These are **not** provided on write; they are useful for `search_nodes`/`search_facts` filters and for interpreting results.

## Client Best Practices
- **Search before write** to reduce duplicates.
- **Keep episodes atomic** and concise; split long material into logical chunks.
- Include **identifiers** (URLs, IDs, timestamps) in `episode_body` when known.
- Always set `source` + `source_description`.
- Do **not** store secrets/credentials/PII or entire transcripts unless truly necessary.

## Common Errors & Handling
- **401/403**: invalid/expired auth token.
- **413**: payload too large → split into smaller episodes.
- **429**: back off/retry; avoid blasting near-duplicates due to sequential ingestion.
- **5xx**: transient; retry with jitter.
