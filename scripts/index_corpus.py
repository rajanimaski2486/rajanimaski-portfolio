#!/usr/bin/env python3
"""
Index the portfolio corpus into Aiven OpenSearch.

Creates the `portfolio_corpus` index with the spec mapping (knn enabled, a
source_type keyword for routing), embeds each chunk with the SAME embedding
model the query layer uses, and bulk loads.

  pip install -r scripts/requirements.txt
  export OPENSEARCH_URL=...   OPENAI_API_KEY=...
  python scripts/index_corpus.py            # create + load
  python scripts/index_corpus.py --recreate # drop and rebuild (re-index)

Framework free: opensearch-py + openai directly. No LangChain.
"""
import argparse
import json
import os
import sys
from pathlib import Path

from openai import OpenAI
from opensearchpy import OpenSearch, helpers

INDEX = os.environ.get("OPENSEARCH_INDEX", "portfolio_corpus")
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "nvidia/nv-embedqa-e5-v5")
EMBEDDING_DIM = int(os.environ.get("EMBEDDING_DIM", "1024"))
EMBEDDING_INPUT_TYPE = os.environ.get("EMBEDDING_INPUT_TYPE", "true") != "false"
# Embeddings via NVIDIA NIM by default (override with EMBEDDING_BASE_URL/KEY).
EMBEDDING_BASE_URL = (
    os.environ.get("EMBEDDING_BASE_URL")
    or os.environ.get("NIM_BASE_URL")
    or "https://integrate.api.nvidia.com/v1"
)
EMBEDDING_API_KEY = (
    os.environ.get("EMBEDDING_API_KEY")
    or os.environ.get("NIM_API_KEY")
    or os.environ.get("OPENAI_API_KEY")
)
CORPUS = Path(__file__).resolve().parent.parent / "corpus" / "corpus.json"


def mapping() -> dict:
    return {
        "settings": {"index": {"knn": True}},
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "source_type": {"type": "keyword"},
                "title": {
                    "type": "text",
                    "fields": {"keyword": {"type": "keyword"}},
                },
                "section": {"type": "keyword"},
                "text": {"type": "text", "analyzer": "standard"},
                "embedding": {
                    "type": "knn_vector",
                    "dimension": EMBEDDING_DIM,
                    "method": {
                        "name": "hnsw",
                        "space_type": "cosinesimil",
                        # lucene engine is built in and works on OpenSearch 2.x and 3.x
                        # (nmslib was removed in 3.0).
                        "engine": "lucene",
                    },
                },
                "url": {"type": "keyword"},
                "tags": {"type": "keyword"},
            }
        },
    }


def embed_all(oa: OpenAI, texts: list[str]) -> list[list[float]]:
    # Documents are embedded with input_type "passage" (queries use "query").
    # Batch in modest sizes to respect NIM embedding limits.
    out: list[list[float]] = []
    extra = {"input_type": "passage", "truncate": "END"} if EMBEDDING_INPUT_TYPE else {}
    for i in range(0, len(texts), 32):
        batch = texts[i : i + 32]
        res = oa.embeddings.create(model=EMBEDDING_MODEL, input=batch, extra_body=extra)
        out.extend(d.embedding for d in res.data)
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--recreate", action="store_true", help="drop and rebuild the index")
    args = ap.parse_args()

    url = os.environ.get("OPENSEARCH_URL")
    if not url:
        print("OPENSEARCH_URL is not set", file=sys.stderr)
        return 1
    if not EMBEDDING_API_KEY:
        print("No embedding key (set NIM_API_KEY, EMBEDDING_API_KEY, or OPENAI_API_KEY)", file=sys.stderr)
        return 1

    chunks = json.loads(CORPUS.read_text())
    print(f"Loaded {len(chunks)} chunks from {CORPUS}")

    os_client = OpenSearch(hosts=[url])
    oa = OpenAI(base_url=EMBEDDING_BASE_URL, api_key=EMBEDDING_API_KEY)

    if args.recreate and os_client.indices.exists(INDEX):
        print(f"Deleting existing index {INDEX}")
        os_client.indices.delete(INDEX)

    if not os_client.indices.exists(INDEX):
        print(f"Creating index {INDEX} (dim={EMBEDDING_DIM}, model={EMBEDDING_MODEL})")
        os_client.indices.create(INDEX, body=mapping())

    vectors = embed_all(oa, [c["text"] for c in chunks])

    actions = []
    for c, vec in zip(chunks, vectors):
        actions.append(
            {
                "_index": INDEX,
                "_id": c["id"],
                "_source": {**c, "embedding": vec},
            }
        )

    ok, errors = helpers.bulk(os_client, actions, stats_only=False)
    os_client.indices.refresh(INDEX)
    print(f"Indexed {ok} chunks into {INDEX}")
    if errors:
        print(f"{len(errors)} errors", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
