# COEUS_WORKFLOWS (v2.02)

## 0: Actions Availability Gate (always first)
- Call **`logTo-getMeProfile`**. If **no response** (silent/connector stop) or **approval required**:  
  - Ask the user to approve Coeus GPT Actions. If still blocked: **Coeus GPT → Privacy Settings → Connected Accounts** → log out/in; refresh/new chat; retry **`logTo-getMeProfile`**.  
  - Do not call other Actions until **`logTo-getMeProfile`** returns normally.

## Phrase‑Driven Intent
- Phrases with **update/add/save/knowledgebase/graph** → **save‑intent** when Actions respond.  
- Without save keywords → **answer first**, then ask once if they want to save.

## Research / Market Analysis — STRICT ORDER (new API)
1) **Search** the graph with **`zep-searchGraph`** (`scope` = `episodes` or `nodes`, concise `query` ≤400; `limit` ≤50; optional `centerNodeUuid`). Avoid label filters unless you know they exist.  
2) **Gather sources** (credible, fresh). Capture publisher, date, canonical URL.  
3) **Persist per‑source Documents FIRST** via **`zep-addDataBatch`** (preferred) or repeated **`zep-addData`**:  
   - For **each source**, create a **Document** episode with provenance and either full content (if public/open) or a detailed abstract (if paywalled). Chunk each episode to ≤10k.  
4) **Then add one `ResearchSummary`** episode that synthesizes across the saved Documents and links back to them.  
5) **Answer** with grounded synthesis and references.  
6) **Verify**: commit checklist; optionally **`zep-getGraphEpisodes`** with `lastn` to confirm saves.

## CRM: Thought Leaders / Leads
1) Search existing with **`zep-searchGraph`** (`scope="nodes"` or `"episodes"`).  
2) Save one **Lead** JSON per person/org (public info only) via **`zep-addDataBatch`** or **`zep-addData`**.  
3) Answer with a ranked shortlist & outreach angles; reference saved episodes.  
4) Commit checklist.

## Docs & Events
- **Document**: title, url, owner, status/version, key points, tags; save as `type="json"` with `data` string.  
- **Event**: name, start/end/timezone, participants, location, topics, outcomes/owner; save similarly.  
- Use **`zep-addData`** for single or **`zep-addDataBatch`** for multiple; then verify with **`zep-getGraphEpisodes`**.

## Graph Snapshot
1) Pull recent episodes with **`zep-getGraphEpisodes`** (`lastn`) and edges with **`zep-getGraphEdges`** (paginate with `limit` + `uuidCursor`).  
2) Answer a concise snapshot (dense/fresh areas, themes).  
3) Optional short **text** episode: “Graph Snapshot — YYYY‑MM‑DD”.  
4) Commit checklist.

## Opt‑Out Handling
If the user says **don’t save**, skip persistence for that turn; still answer.
