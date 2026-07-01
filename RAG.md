# RAG endpoint — SDK-native tool routing

This is **RAG with tool routing, not a ReAct agent**. Grounded retrieval over a
small static corpus, with real tool selection. Framework-free on purpose: OpenAI
SDK + OpenSearch directly, **no LangChain, no LlamaIndex, no LangSmith**.

> For the end-to-end data flow (how content is chunked, embedded, indexed, and
> retrieved), see [RAG_PIPELINE.md](RAG_PIPELINE.md).

## Architecture

```
POST /api/chat { question }
  │
  ├─ 1. guardrail.isInScope()        relevance gate BEFORE retrieval
  │        └─ out of scope ─────────► fixed refusal, no citation
  │
  ├─ 2. router (LLM + tools)         model picks retrieval tool(s)
  │        search_projects · search_talks · get_resume_section
  │        · search_about · get_contact
  │        (comparison questions call tools for BOTH subjects)
  │
  ├─ 3. runTool() → hybridSearch()   BM25 + kNN on OpenSearch, filtered by
  │                                   source_type; re-scored by cosine
  │
  ├─ 4. low-confidence gate          top cosine < threshold OR empty
  │        └─ ─────────────────────► same fixed refusal, no fabrication
  │
  ├─ 5. citations event              the chunks the answer may use
  │
  └─ 6. grounded answer (streamed)   NIM primary, gpt-4o-mini fallback
           cites chunk ids inline, explicit "I do not know" path
```

The endpoint streams **Server-Sent Events**: `tools`, `citations`, `token`,
`refusal`, `done` (and `error`). The chosen tool(s) are surfaced so the routing
is visible (the chat UI renders them as `→ search_projects`).

## Files

- `src/app/api/chat/route.ts` — serverless function (SSE).
- `src/lib/rag/answer.ts` — orchestration (guardrail → route → retrieve → gate → answer).
- `src/lib/rag/tools.ts` — tool defs + executors (each maps to a targeted query).
- `src/lib/rag/opensearch.ts` — hybrid BM25 + kNN, cosine re-scoring.
- `src/lib/rag/guardrail.ts` — out-of-scope relevance gate.
- `src/lib/rag/llm.ts` — NIM primary, OpenAI fallback (both via OpenAI SDK).
- `src/lib/rag/embeddings.ts` — OpenAI embeddings (indexing + query must match).
- `scripts/index_corpus.py` — build the index + load the corpus.
- `scripts/eval.py` — hand-rolled grounding eval (routing + grounding + faithfulness + guardrail).
- `corpus/corpus.json` — the corpus (one object per logical chunk).

## Setup

1. Provision an Aiven OpenSearch instance (free tier). Set env vars (see `.env.example`):
   `OPENSEARCH_URL`, `NIM_API_KEY`, `OPENAI_API_KEY`, and optionally `NIM_MODEL`.
   In production, add these in the Vercel project settings.
2. Edit `corpus/corpus.json` with your real content (the drafts are placeholders).
3. Build the index and load:
   ```bash
   pip install -r scripts/requirements.txt
   export OPENSEARCH_URL=... OPENAI_API_KEY=...
   python scripts/index_corpus.py --recreate
   ```
4. Run the eval (with the dev server or the deployed URL running):
   ```bash
   export CHAT_URL=http://localhost:3000/api/chat
   python scripts/eval.py
   ```

> If you change `EMBEDDING_MODEL` / `EMBEDDING_DIM`, you must re-index — the
> mapping pins the kNN vector dimension.

## curl examples

### 1. Grounded answer

```bash
curl -N -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"question":"What is the 2000+ RPS retrieval system and how was it built?"}'
```

Expected stream (abbreviated):

```
event: tools
data: {"tools":["search_projects"]}

event: citations
data: {"citations":[{"id":"resume-ir-serving-01","title":"Relevance serving at 2000+ RPS","section":"result","source_type":"projects"}]}

event: token
data: {"text":"Rajani"}
event: token
data: {"text":" served"}
...
event: done
data: {"model":"meta/llama-3.1-70b-instruct"}
```

### 2. Comparison question (plan-then-answer)

```bash
curl -N -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"question":"How does Reveal differ from Scene Finder?"}'
```

Routes to `search_projects` for both subjects, retrieves chunks for each, then
synthesizes a single grounded answer with citations from both.

### 3. Out-of-scope refusal

```bash
curl -N -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"question":"What is the capital of France?"}'
```

```
event: refusal
data: {"text":"I only answer questions about Rajani's work and background."}
```

No `tools`, no `citations`, no `token` — the guardrail fires before retrieval.
The same refusal is returned when retrieval comes back empty or below the
low-confidence threshold. The agent never fabricates to fill a gap.
```
