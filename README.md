# Rajani Maski — portfolio

Resume-first portfolio with an optional grounded chat + voice assistant. Dark,
calm, one-glance. The landing is the resume; the AI is a reward for the curious,
never imposed.

Live: https://rajanimaskiportfolio.vercel.app

## Stack

- **Next.js 14** App Router, TypeScript, deployed on **Vercel**.
- **Tailwind** + shadcn/ui foundations, dark design tokens (one accent `#5dcca5`).
- **RAG**: OpenAI SDK + **OpenSearch** (BM25 + kNN hybrid). **NVIDIA NIM** primary
  for embeddings and generation, OpenAI optional fallback. **No LangChain /
  LlamaIndex / LangSmith** — framework-free is the deliberate position.
- **Voice**: browser Web Speech API (STT + TTS). Zero extra infra.

## Routes

- `/` landing (hero latent-space canvas, positioning, current work, chat invite)
- `/projects` filterable grid (active + past)
- `/talks` talks, writing, certifications strip
- `/about` running, hiking, autism advocacy
- `/api/chat` RAG endpoint with SDK-native tool routing (SSE) — see [RAG.md](RAG.md)

Chat + voice is a persistent docked pill, not a route.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (runs lint + typecheck)
```

> Do not run `npm run build` while `npm run dev` is running — both write `.next`
> and the prod build will clobber the dev server's asset manifest.

## RAG backend

The chat endpoint needs three things provisioned (see [`.env.example`](.env.example)):

1. An **OpenSearch** instance with the kNN plugin (Aiven, AWS OpenSearch, or
   self-hosted via Docker). Set `OPENSEARCH_URL`.
2. A **NVIDIA NIM** API key (free credits at build.nvidia.com). Set `NIM_API_KEY`.
3. Edit `corpus/corpus.json` with real content (the drafts are placeholders),
   then build the index and run the grounding eval:

```bash
pip install -r scripts/requirements.txt
python scripts/index_corpus.py --recreate     # create index + load corpus
CHAT_URL=http://localhost:3000/api/chat python scripts/eval.py
```

In production, add the same env vars in the Vercel project settings. Until they
are set, the endpoint returns the fixed refusal / a graceful error and the rest
of the site works unchanged.

Full architecture, SSE event shapes, and curl examples: [RAG.md](RAG.md).

## Architecture

Three focused diagrams, each answering one reviewer question. They render natively
on GitHub and track the shipped code (framework-free, OpenAI SDK used directly,
OpenSearch as the retrieval layer, NeMo Retriever embedding NIM, NIM-primary
generation with an OpenAI fallback, browser Web Speech for voice). It is RAG with
SDK-native tool routing, not a ReAct agent.

### 1. System architecture — the layers and what they are built with

```mermaid
flowchart TB
  subgraph CLIENT["Client · Next.js 14 App Router (Vercel)"]
    direction TB
    PAGES["Static pages<br/>/ · /projects · /talks · /about"]
    HERO["Latent-space hero canvas"]
    CHAT["Docked chat + voice pill/panel"]
    PAGES --> CHAT
    HERO --> CHAT
  end

  subgraph EDGE["Serverless · Vercel Functions"]
    API["POST /api/chat<br/>Node runtime · SSE stream"]
    LOGIC["RAG logic (framework-free)<br/>guardrail → route → retrieve → gate → generate"]
    API --> LOGIC
  end

  OS[("OpenSearch · Aiven<br/>portfolio_corpus<br/>hybrid BM25 + kNN · 1024-d")]

  subgraph INFER["Inference · OpenAI SDK, direct"]
    EMB["Embeddings<br/>NeMo Retriever NIM<br/>nv-embedqa-e5-v5 · 1024-d"]
    GEN["Generation<br/>NIM primary (llama-3.1-70b)<br/>→ gpt-4o-mini fallback"]
  end

  subgraph INGEST["Ingestion · offline, one-time"]
    CORPUS["corpus/corpus.json<br/>25 hand-authored chunks"]
    INDEXER["scripts/index_corpus.py<br/>create index · embed · bulk load"]
    CORPUS --> INDEXER
  end

  CHAT -->|question| API
  LOGIC -->|hybrid query| OS
  LOGIC -->|embed query| EMB
  LOGIC -->|grounded answer| GEN
  GEN -->|SSE tokens| CHAT

  INDEXER -->|passage embeddings| EMB
  INDEXER -->|write vectors + fields| OS
```

*Client and serverless functions on Vercel; OpenSearch is the retrieval layer; the
embedding and generation NIMs are reached through the OpenAI SDK. The offline
indexing script is a separate ingestion path that fills the store once.*

### 2. Request + agent workflow — how one question is answered

```mermaid
flowchart TB
  Q["Question → POST /api/chat"] --> G{"Guardrail: in scope?<br/>keyword fast-path, else LLM gate"}
  G -->|out of scope| R1["Fixed refusal<br/>no retrieval, no citation"]
  G -->|in scope| ROUTE["SDK-native tool router · tool_choice auto (≤ 4 tools)<br/>comparison Q → calls tools for BOTH subjects"]

  ROUTE --> T1["search_projects"]
  ROUTE --> T2["search_talks"]
  ROUTE --> T3["get_resume_section"]
  ROUTE --> T4["search_about"]
  ROUTE --> T5["get_contact<br/>synthetic chunk · no search"]

  T1 --> HS["Hybrid OpenSearch query per tool<br/>source_type filter · BM25 + kNN<br/>cosine re-score · top-k = 4"]
  T2 --> HS
  T3 --> HS
  T4 --> HS
  T5 --> MERGE

  HS --> MERGE["Merge + dedupe by id<br/>rank by hybrid score · keep top 6"]
  MERGE --> GATE{"Best cosine ≥ threshold?<br/>default 0.28, non-empty"}
  GATE -->|no / empty| R2["Fixed refusal"]
  GATE -->|yes| GEN["Grounded generation @ temp 0<br/>cite chunk ids inline<br/>NIM primary → gpt-4o-mini fallback"]
  GEN --> OUT["Stream SSE:<br/>tools → citations → tokens → done"]
```

*The guardrail exits early on out-of-scope questions. The router picks targeted
tools (planning both subjects for a comparison), each runs a filtered hybrid query,
and a cosine confidence gate refuses rather than fabricate on weak retrieval.*

### 3. Voice integration — a second front door to the same agent

```mermaid
sequenceDiagram
  actor U as User
  participant Panel as Chat panel (mic)
  participant STT as Browser Web Speech · STT
  participant Pipe as /api/chat RAG pipeline (Diagram 2)
  participant TTS as Browser Web Speech · TTS

  U->>Panel: tap mic, speak
  Panel->>STT: start recognition
  STT-->>Panel: final transcript (text)
  Panel->>Pipe: POST { question }  (identical to a typed question)
  Pipe-->>Panel: SSE grounded answer (citations + tokens)
  Panel->>TTS: speak(answer)  ·  citation markers stripped
  TTS-->>U: reads the answer aloud
```

*Voice is only a second input path: speech becomes text and enters the exact same
pipeline as a typed question. There is no separate voice backend.*

A standalone dark-themed render of Diagram 1 (for optional landing-page use) lives at
[`public/architecture.svg`](public/architecture.svg).

## Content

Site copy and project data live in `src/lib/content.ts`. Items marked `TODO`
(GitHub/LinkedIn handles, project links, one-liners) are placeholders to confirm.
Replace `public/resume.pdf` and the portrait placeholder in
`src/components/portrait.tsx` with the real assets.

## Writing style

No apostrophe-contractions and no dashes in user-facing prose. One accent color,
used only where it means something. Two font weights site-wide (400 / 500).
