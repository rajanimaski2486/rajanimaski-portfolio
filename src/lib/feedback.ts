import { getClient } from "./rag/opensearch";

// Visitor feedback lands in its own index in the SAME Aiven OpenSearch domain,
// separate from the RAG corpus. Feedback is captured text, not retrieval
// material, so it carries no embedding and is never searched by the chat layer.
export const FEEDBACK_INDEX = process.env.OPENSEARCH_FEEDBACK_INDEX ?? "feedback";

// A single note is capped at 100 words, and the index is capped at 100 docs.
export const MAX_FEEDBACK_WORDS = 100;
export const MAX_FEEDBACK_DOCS = 100;

// Words are whitespace-separated tokens; collapse runs so double spaces do not
// inflate the count.
export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export type IndexResult = { ok: true } | { ok: false; reason: "full" };

// Create the index on first write so no manual provisioning step is needed.
// Cached after the first success; a concurrent create that loses the race is
// ignored (resource_already_exists_exception is benign).
let ensured = false;

async function ensureIndex(): Promise<void> {
  if (ensured) return;
  const os = getClient();
  const exists = await os.indices.exists({ index: FEEDBACK_INDEX });
  if (!exists.body) {
    try {
      await os.indices.create({
        index: FEEDBACK_INDEX,
        body: {
          mappings: {
            properties: {
              message: { type: "text" },
              created_at: { type: "date" },
              path: { type: "keyword" },
              user_agent: { type: "text" },
            },
          },
        },
      });
    } catch (err) {
      const type = (err as { body?: { error?: { type?: string } } })?.body?.error
        ?.type;
      if (type !== "resource_already_exists_exception") throw err;
    }
  }
  ensured = true;
}

export async function indexFeedback(
  message: string,
  meta: { path?: string; userAgent?: string } = {}
): Promise<IndexResult> {
  await ensureIndex();
  const os = getClient();

  // Cap the index at MAX_FEEDBACK_DOCS documents: refuse the write once the
  // index already holds that many. Best-effort under concurrency (two writes
  // that both read the count before either lands could exceed it slightly),
  // which is fine for this low-volume box.
  const { body } = await os.count({ index: FEEDBACK_INDEX });
  if ((body?.count ?? 0) >= MAX_FEEDBACK_DOCS) {
    return { ok: false, reason: "full" };
  }

  await os.index({
    index: FEEDBACK_INDEX,
    body: {
      message,
      created_at: new Date().toISOString(),
      path: meta.path,
      user_agent: meta.userAgent,
    },
    refresh: true,
  });
  return { ok: true };
}
