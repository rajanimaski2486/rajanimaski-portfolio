import { ragStream } from "@/lib/rag/answer";

export const runtime = "nodejs";
export const maxDuration = 60;

/*
  RAG endpoint with SDK-native tool routing (NOT a ReAct agent).
  POST { question: string } -> Server-Sent Events:
    event: tools      data: { tools: [...] }
    event: citations  data: { citations: [...] }
    event: token      data: { text: "..." }
    event: refusal    data: { text: "..." }   (out-of-scope or low-confidence)
    event: done       data: { model: "..." }
*/
export async function POST(req: Request) {
  let question = "";
  try {
    const body = await req.json();
    question = (body?.question ?? "").toString().slice(0, 1000).trim();
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (!question) return new Response("Missing question", { status: 400 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      try {
        for await (const ev of ragStream(question)) {
          const { type, ...rest } = ev;
          send(type, rest);
        }
      } catch (err) {
        console.error("rag error:", err);
        send("error", { text: "Something went wrong answering that." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
