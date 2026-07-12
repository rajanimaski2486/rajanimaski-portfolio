import { complete, streamComplete } from "./llm";
import { isInScope } from "./guardrail";
import { tools, runTool, TOOL_NAMES, type ToolName } from "./tools";
import type { Retrieved } from "./opensearch";
import { LOW_CONFIDENCE_THRESHOLD, REFUSAL } from "./config";

export type Citation = {
  id: string;
  title: string;
  section: string;
  source_type: string;
  url?: string;
};

export type RagEvent =
  | { type: "refusal"; text: string }
  | { type: "tools"; tools: ToolName[] }
  | { type: "citations"; citations: Citation[] }
  | { type: "token"; text: string }
  | { type: "done"; model: string };

const ROUTER_SYSTEM =
  "You are the router for a grounded portfolio assistant about Rajani Maski. " +
  "Call one or more retrieval tools to gather the facts needed to answer. " +
  "Treat second-person questions (you, your, yours, yourself) as being about Rajani: " +
  "for example 'what are you working on now' means the same as 'what is Rajani working on now'. " +
  "Questions about what Rajani is doing now, currently, right now, or these days are about her " +
  "current role and focus, not a demo project: call get_resume_section for those. " +
  "Questions about the largest, biggest, highest-scale, or most impactful system Rajani has built " +
  "are about the 2000+ RPS Generative Discovery infrastructure at Shutterstock, not the Reveal demo: " +
  "call search_projects with a query that names that 2000+ RPS Generative Discovery system. " +
  "Questions asking whether Rajani knows, has used, or is familiar with a specific technology, tool, " +
  "cloud platform (for example GCP, AWS, Azure), or programming language are about her skills: " +
  "call get_resume_section for those. " +
  "For comparison questions (e.g. how two projects differ), call the relevant tool(s) " +
  "for BOTH subjects so the answer can be synthesized from real chunks. Do not answer from memory.";

const ANSWER_SYSTEM =
  "You are Rajani Maski's AI assistant on her portfolio site. " +
  "Speak in the voice of her assistant: refer to Rajani in the third person (Rajani or she) and " +
  "never claim to be Rajani yourself. " +
  "Treat second-person questions (you, your, yours, yourself) as being about Rajani. When a question " +
  "is addressed to you directly (for example 'what are you working on'), understand that the visitor " +
  "may think they are talking to Rajani: briefly clarify that you are Rajani's AI assistant and then " +
  "answer about her, for example 'I am Rajani's AI assistant. She is currently working on ...'. " +
  "Answer ONLY from the provided context chunks. " +
  "Ground every claim in the chunks. If the chunks do not support an answer, say you do not know. " +
  "Never fabricate numbers or facts. Cite the chunk ids you used inline like [reveal-decision-01]. " +
  "When asked whether Rajani knows or has used a specific technology, tool, cloud platform, or language, " +
  "answer only from the chunks: if a chunk names it, say she works with it; if none mention it, say plainly " +
  "that it is not listed among her skills, and name the closest related tools she does use if the chunks show " +
  "them (for example, the chunks list AWS, not GCP). Do not claim familiarity that the chunks do not state. " +
  "When asked about career history, experience, or prior roles, report each distinct period and its " +
  "year count separately and accurately as stated in the chunks, and never merge two periods into a " +
  "single vague range (for example, do not turn four years in one role and six years in another into " +
  "'four to six years'). Do not omit a period of experience that the chunks describe. " +
  "Be concise and concrete. " +
  "Do not use apostrophe-contractions and do not use dashes in prose.";

function isToolName(n: string): n is ToolName {
  return (TOOL_NAMES as readonly string[]).includes(n);
}

// Async generator of RAG events. The route serializes these to SSE.
export async function* ragStream(question: string): AsyncGenerator<RagEvent> {
  // 1. Out-of-scope guardrail (before retrieval). Fixed refusal, no citation.
  if (!(await isInScope(question))) {
    yield { type: "refusal", text: REFUSAL };
    return;
  }

  // 2. Tool routing — the model picks the retrieval tool(s).
  let chosen: { name: ToolName; args: { query?: string } }[] = [];
  try {
    const routing = await complete({
      temperature: 0,
      messages: [
        { role: "system", content: ROUTER_SYSTEM },
        { role: "user", content: question },
      ],
      tools,
      tool_choice: "auto",
    });
    const calls = routing.choices[0]?.message?.tool_calls ?? [];
    chosen = calls
      .filter((c) => c.type === "function" && isToolName(c.function.name))
      .slice(0, 4)
      .map((c) => {
        // narrowed to function tool calls by the filter above
        const fn = (c as Extract<typeof c, { type: "function" }>).function;
        let args: { query?: string } = {};
        try {
          args = JSON.parse(fn.arguments || "{}");
        } catch {
          args = { query: question };
        }
        return { name: fn.name as ToolName, args };
      });
  } catch (err) {
    console.warn("routing failed:", (err as Error).message);
  }

  // Fallback: if the model declined to route, search the most likely domains.
  if (chosen.length === 0) {
    chosen = [
      { name: "search_projects", args: { query: question } },
      { name: "get_resume_section", args: { query: question } },
    ];
  }

  const usedTools = Array.from(new Set(chosen.map((c) => c.name)));
  yield { type: "tools", tools: usedTools };

  // 3. Execute the chosen tools (parallel) and merge results.
  const results = await Promise.all(chosen.map((c) => runTool(c.name, c.args)));
  const byId = new Map<string, Retrieved>();
  for (const r of results) {
    for (const ch of r.chunks) {
      const existing = byId.get(ch.id);
      if (!existing || ch.relevance > existing.relevance) byId.set(ch.id, ch);
    }
  }
  // Rank by hybrid relevance; keep cosine for the confidence gate.
  const merged = Array.from(byId.values()).sort((a, b) => b.relevance - a.relevance);
  const top = merged.slice(0, 6);

  // 4. Low-confidence / empty-retrieval gate -> same fixed refusal. No fabrication.
  const bestCosine = top.reduce((m, c) => Math.max(m, c.score), 0);
  if (top.length === 0 || bestCosine < LOW_CONFIDENCE_THRESHOLD) {
    yield { type: "refusal", text: REFUSAL };
    return;
  }

  // 5. Citations (what the answer is allowed to draw on).
  const citations: Citation[] = top.map((c) => ({
    id: c.id,
    title: c.title,
    section: c.section,
    source_type: c.source_type,
    url: c.url,
  }));
  yield { type: "citations", citations };

  // 6. Compose the grounded answer, streamed.
  const context = top
    .map(
      (c) =>
        `[${c.id}] (${c.source_type}/${c.section}) ${c.title}\n${c.text}`
    )
    .join("\n\n");

  const { stream, model } = await streamComplete({
    // Temperature 0 keeps the answer tight to the cited chunks (max faithfulness).
    temperature: 0,
    messages: [
      { role: "system", content: ANSWER_SYSTEM },
      {
        role: "user",
        content: `Question: ${question}\n\nContext chunks:\n${context}\n\nAnswer using only these chunks and cite the chunk ids you use.`,
      },
    ],
  });

  for await (const part of stream) {
    const delta = part.choices[0]?.delta?.content;
    if (delta) yield { type: "token", text: delta };
  }

  yield { type: "done", model };
}
