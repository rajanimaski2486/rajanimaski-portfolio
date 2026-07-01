import { Client } from "@opensearch-project/opensearch";
import { INDEX, TOP_K, type SourceType } from "./config";
import { embed } from "./embeddings";

let client: Client | null = null;

export function getClient(): Client {
  if (!client) {
    const node = process.env.OPENSEARCH_URL;
    if (!node) throw new Error("OPENSEARCH_URL is not set");
    client = new Client({ node });
  }
  return client;
}

export type Chunk = {
  id: string;
  source_type: SourceType;
  title: string;
  section: string;
  text: string;
  url?: string;
  tags?: string[];
};

// `score` is cosine similarity in [-1,1] (interpretable, gates confidence).
// `relevance` is the hybrid BM25+kNN score normalized to [0,1] within the tool,
// used for RANKING so a strong lexical match is not lost to cosine alone.
export type Retrieved = Chunk & { score: number; relevance: number };

function sourceFilter(sourceType: SourceType | SourceType[]) {
  return Array.isArray(sourceType)
    ? { terms: { source_type: sourceType } }
    : { term: { source_type: sourceType } };
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d ? dot / d : 0;
}

/*
  Hybrid retrieval: BM25 on `text` + kNN on `embedding`, filtered by source_type.
  BM25 + kNN jointly RANK the candidates. We then RE-SCORE each hit by cosine
  similarity to the query (computed from the returned embedding) so the
  low-confidence gate has a stable, model-meaningful number to threshold on.
*/
export async function hybridSearch(
  query: string,
  sourceType: SourceType | SourceType[],
  k: number = TOP_K
): Promise<Retrieved[]> {
  const os = getClient();
  const vector = await embed(query);

  // Over-fetch candidates (BM25 + kNN), then re-rank by cosine and keep top k.
  // This keeps a strong lexical match (e.g. "2000 RPS") from being dropped.
  const candidates = Math.max(k * 4, 12);

  const res = await os.search({
    index: INDEX,
    body: {
      size: candidates,
      query: {
        bool: {
          filter: [sourceFilter(sourceType)],
          should: [
            { multi_match: { query, fields: ["title^2", "text"], type: "best_fields" } },
            { knn: { embedding: { vector, k: candidates } } },
          ],
          minimum_should_match: 1,
        },
      },
    },
  });

  const hits = res.body.hits.hits ?? [];
  const maxScore = res.body.hits.max_score || 1;
  return hits
    .map((h) => {
      const hit = h as { _source?: Chunk & { embedding?: number[] }; _score?: number };
      const src = (hit._source ?? {}) as Chunk & { embedding?: number[] };
      const { embedding, ...chunk } = src;
      const score = embedding ? cosine(vector, embedding) : 0;
      const relevance = maxScore ? (hit._score ?? 0) / maxScore : 0;
      return { ...chunk, score, relevance } as Retrieved;
    })
    // Rank by the hybrid score (lexical + semantic), keep top k.
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, k);
}
