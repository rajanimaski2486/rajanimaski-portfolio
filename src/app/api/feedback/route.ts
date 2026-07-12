import {
  countWords,
  indexFeedback,
  MAX_FEEDBACK_WORDS,
} from "@/lib/feedback";

export const runtime = "nodejs";

/*
  Visitor feedback endpoint.
  POST { message: string, path?: string } -> { ok: true } | { error: string }
  Stores the note in the `feedback` index (created on first write). No embedding.
  Rejects notes over 100 words (400) and writes once the index holds 100 docs (429).
*/
export async function POST(req: Request) {
  let message = "";
  let path: string | undefined;
  try {
    const body = await req.json();
    // Bound the raw payload before counting; 2000 chars comfortably holds 100
    // words even when they are long.
    message = (body?.message ?? "").toString().slice(0, 2000).trim();
    path = body?.path ? String(body.path).slice(0, 200) : undefined;
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  if (!message) {
    return Response.json({ error: "Feedback cannot be empty" }, { status: 400 });
  }
  if (countWords(message) > MAX_FEEDBACK_WORDS) {
    return Response.json(
      { error: `Feedback must be ${MAX_FEEDBACK_WORDS} words or less.` },
      { status: 400 }
    );
  }

  try {
    const result = await indexFeedback(message, {
      path,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });
    if (!result.ok) {
      return Response.json(
        { error: "The feedback box is full for now. Thank you." },
        { status: 429 }
      );
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("feedback error:", err);
    return Response.json(
      { error: "Could not save feedback right now." },
      { status: 500 }
    );
  }
}
