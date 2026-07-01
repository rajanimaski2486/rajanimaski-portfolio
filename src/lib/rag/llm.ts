import OpenAI from "openai";
import type {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionChunk,
} from "openai/resources/chat/completions";

/*
  Generation through the OpenAI SDK only (framework-free). Providers are tried
  in order, so the default stack is all NVIDIA NIM / open models:
    1. NIM primary model   (NIM_MODEL)
    2. NIM fallback model   (NIM_FALLBACK_MODEL, same endpoint)
    3. OpenAI fallback      (only if OPENAI_API_KEY is set)
  Configure via env; no code change needed to add or drop a provider.
*/

type Provider = { client: OpenAI; model: string; label: string };

// Routing/guardrail can use a stronger model; answer streaming can use a faster
// one (NIM_STREAM_MODEL) so the final answer is snappy. Both default to NIM_MODEL.
function providers(forStreaming = false): Provider[] {
  const list: Provider[] = [];

  const nimKey = process.env.NIM_API_KEY;
  if (nimKey) {
    const client = new OpenAI({
      apiKey: nimKey,
      baseURL: process.env.NIM_BASE_URL ?? "https://integrate.api.nvidia.com/v1",
      // Fail a hung NIM call fast so it falls back instead of timing out the function.
      timeout: 30000,
      maxRetries: 1,
    });
    const primary = process.env.NIM_MODEL ?? "meta/llama-3.1-70b-instruct";
    const streamModel = process.env.NIM_STREAM_MODEL ?? primary;
    list.push({
      client,
      model: forStreaming ? streamModel : primary,
      label: "nim-primary",
    });
    const fb = process.env.NIM_FALLBACK_MODEL;
    if (fb) list.push({ client, model: fb, label: "nim-fallback" });
  }

  const oaKey = process.env.OPENAI_API_KEY;
  if (oaKey) {
    list.push({
      client: new OpenAI({ apiKey: oaKey }),
      model: process.env.OPENAI_FALLBACK_MODEL ?? "gpt-4o-mini",
      label: "openai-fallback",
    });
  }

  if (list.length === 0)
    throw new Error("No LLM provider configured (set NIM_API_KEY or OPENAI_API_KEY)");
  return list;
}

type Params = Omit<ChatCompletionCreateParamsNonStreaming, "model" | "stream">;

// Non-streaming completion (relevance gate + tool routing).
export async function complete(params: Params) {
  const provs = providers();
  let lastErr: unknown;
  for (const p of provs) {
    try {
      return await p.client.chat.completions.create({
        ...params,
        model: p.model,
        stream: false,
      });
    } catch (err) {
      lastErr = err;
      console.warn(`${p.label} failed, trying next:`, (err as Error).message);
    }
  }
  throw lastErr ?? new Error("all providers failed");
}

// Streaming completion (final grounded answer).
export async function streamComplete(
  params: Params
): Promise<{ stream: AsyncIterable<ChatCompletionChunk>; model: string }> {
  const provs = providers(true);
  let lastErr: unknown;
  for (const p of provs) {
    try {
      const stream = await p.client.chat.completions.create({
        ...params,
        model: p.model,
        stream: true,
      });
      return { stream, model: p.model };
    } catch (err) {
      lastErr = err;
      console.warn(`${p.label} stream failed, trying next:`, (err as Error).message);
    }
  }
  throw lastErr ?? new Error("all providers failed");
}
