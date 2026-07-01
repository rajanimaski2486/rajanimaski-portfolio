# Local RAG test (no cloud keys)

Runs the whole RAG stack offline: **Docker OpenSearch** for retrieval +
**Ollama** for embeddings and generation. Config lives in `.env.local`
(gitignored), which Next.js loads automatically.

## One-time

```bash
# Ollama models
ollama pull llama3.1:8b        # generation + tool routing
ollama pull nomic-embed-text   # embeddings (768 dims)

# Python tooling
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements.txt
```

## Each session

```bash
# 1. Start OpenSearch (single node, security off, kNN bundled)
scripts/dev-opensearch.sh up

# 2. Build the index + load the corpus (uses .env.local config)
set -a; source .env.local; set +a
.venv/bin/python scripts/index_corpus.py --recreate

# 3. Run the app (loads .env.local automatically)
npm run dev                    # http://localhost:3000

# 4. (optional) Run the grounding eval against it
CHAT_URL=http://localhost:3000/api/chat .venv/bin/python scripts/eval.py
```

Open the chat pill and ask away, or curl it:

```bash
curl -N -X POST localhost:3000/api/chat -H 'Content-Type: application/json' \
  -d '{"question":"How does Reveal differ from Scene Finder?"}'
```

Tear down OpenSearch with `scripts/dev-opensearch.sh down`.

## Notes / limits of the local models

- `llama3.1:8b` does real tool calling, but is a small model: its rewritten
  retrieval queries are less precise than the larger NVIDIA NIM models, so recall
  on a specific chunk (e.g. the dedicated 2000+ RPS resume chunk) can vary. It
  never fabricates — it grounds in whatever was retrieved or says it does not know.
- `nomic-embed-text` (768 dims) is a solid local embedder; production uses
  NVIDIA `nv-embedqa-e5-v5` (1024 dims). Switching providers only needs env-var
  changes plus a re-index (the kNN dimension is pinned by the index mapping).
- To point the same app at production providers instead, set NIM/OpenSearch env
  vars per `.env.example` (and remove or override `.env.local`).
