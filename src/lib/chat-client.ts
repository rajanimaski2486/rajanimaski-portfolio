// Client-side reader for the /api/chat SSE stream (Day 3 endpoint).

export type Citation = {
  id: string;
  title: string;
  section: string;
  source_type: string;
  url?: string;
};

export type ChatHandlers = {
  onTools?: (tools: string[]) => void;
  onCitations?: (citations: Citation[]) => void;
  onToken?: (text: string) => void;
  onRefusal?: (text: string) => void;
  onDone?: (model: string) => void;
  onError?: (message: string) => void;
};

export async function streamChat(
  question: string,
  handlers: ChatHandlers,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
    signal,
  });

  if (!res.ok || !res.body) {
    handlers.onError?.("The assistant is unavailable right now.");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const dispatch = (event: string, data: string) => {
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(data);
    } catch {
      return;
    }
    switch (event) {
      case "tools":
        handlers.onTools?.((payload.tools as string[]) ?? []);
        break;
      case "citations":
        handlers.onCitations?.((payload.citations as Citation[]) ?? []);
        break;
      case "token":
        handlers.onToken?.((payload.text as string) ?? "");
        break;
      case "refusal":
        handlers.onRefusal?.((payload.text as string) ?? "");
        break;
      case "done":
        handlers.onDone?.((payload.model as string) ?? "");
        break;
      case "error":
        handlers.onError?.((payload.text as string) ?? "Something went wrong.");
        break;
    }
  };

  // SSE frames are separated by a blank line; each has `event:` and `data:` lines.
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      let event = "message";
      let data = "";
      for (const line of frame.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (data) dispatch(event, data);
    }
  }
}
