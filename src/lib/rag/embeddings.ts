import OpenAI from "openai";
import type { EmbeddingCreateParams } from "openai/resources/embeddings";

/*
  Embeddings via NVIDIA NIM by default (OpenAI-compatible endpoint, open models,
  free credits). Indexing (Python) and query (here) MUST use the same model.
  NVIDIA nv-embedqa models require an input_type ("query" vs "passage").
  Set EMBEDDING_BASE_URL / EMBEDDING_API_KEY to point elsewhere (e.g. OpenAI).
*/
let oa: OpenAI | null = null;
function client(): OpenAI {
  if (!oa) {
    const baseURL =
      process.env.EMBEDDING_BASE_URL ??
      process.env.NIM_BASE_URL ??
      "https://integrate.api.nvidia.com/v1";
    const apiKey =
      process.env.EMBEDDING_API_KEY ??
      process.env.NIM_API_KEY ??
      process.env.OPENAI_API_KEY;
    if (!apiKey)
      throw new Error(
        "No embedding API key (set EMBEDDING_API_KEY, NIM_API_KEY, or OPENAI_API_KEY)"
      );
    oa = new OpenAI({ apiKey, baseURL });
  }
  return oa;
}

// nv-embedqa needs input_type; OpenAI embeddings reject it. Toggle via env.
const SUPPORTS_INPUT_TYPE =
  (process.env.EMBEDDING_INPUT_TYPE ?? "true") !== "false";

type ExtendedEmbeddingParams = EmbeddingCreateParams & {
  input_type?: "query" | "passage";
  truncate?: string;
};

export async function embed(
  text: string,
  inputType: "query" | "passage" = "query"
): Promise<number[]> {
  const params: ExtendedEmbeddingParams = {
    model: process.env.EMBEDDING_MODEL ?? "nvidia/nv-embedqa-e5-v5",
    input: text,
  };
  if (SUPPORTS_INPUT_TYPE) {
    params.input_type = inputType;
    params.truncate = "END";
  }
  const res = await client().embeddings.create(params);
  return res.data[0].embedding;
}
