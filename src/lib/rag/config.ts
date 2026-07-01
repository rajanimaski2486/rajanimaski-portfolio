// Central RAG config + the fixed strings the spec pins down.

export const INDEX = process.env.OPENSEARCH_INDEX ?? "portfolio_corpus";
export const TOP_K = Number(process.env.RETRIEVAL_TOP_K ?? 4);
export const LOW_CONFIDENCE_THRESHOLD = Number(
  process.env.LOW_CONFIDENCE_THRESHOLD ?? 0.28
);

export const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL ?? "nvidia/nv-embedqa-e5-v5";

// The one fixed refusal line. Out-of-scope AND low-confidence both return this.
export const REFUSAL =
  "I only answer questions about Rajani's work and background.";

// source_type values used for routing (mirror of the indexing script).
export type SourceType = "projects" | "talks" | "resume" | "about" | "courses";
