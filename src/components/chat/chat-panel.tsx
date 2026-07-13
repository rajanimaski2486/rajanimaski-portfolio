"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, Mic, X } from "lucide-react";
import { streamChat, type Citation } from "@/lib/chat-client";
import { FeedbackTrigger } from "./feedback-modal";
import { suggestedPrompts } from "@/lib/content";
import groundingEval from "@/lib/grounding-eval.json";
import {
  createRecognition,
  speak,
  stopSpeaking,
  voiceSupported,
} from "@/lib/voice";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
  tools?: string[];
  citations?: Citation[];
  refusal?: boolean;
  error?: boolean;
  pending?: boolean;
};

export function ChatPanel({
  open,
  onClose,
  incoming,
}: {
  open: boolean;
  onClose: () => void;
  incoming?: { text: string; nonce: number };
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [supportsVoice, setSupportsVoice] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Cache of answered questions (normalized) so an identical question replays the
  // stored answer instead of regenerating it.
  const cacheRef = useRef<Map<string, Message>>(new Map());
  // Refs so async voice callbacks read current values, not stale closures.
  const voiceModeRef = useRef(false);
  const finalAnswerRef = useRef("");
  const recRef = useRef<ReturnType<typeof createRecognition>>(null);

  const prompts = suggestedPrompts;

  useEffect(() => setSupportsVoice(voiceSupported()), []);
  useEffect(() => {
    voiceModeRef.current = voiceMode;
  }, [voiceMode]);

  // Mutate the last (assistant) message in place during streaming.
  const patchLast = (patch: Partial<Message>) =>
    setMessages((prev) => {
      const next = [...prev];
      const i = next.length - 1;
      next[i] = { ...next[i], ...patch };
      return next;
    });
  const appendToken = (text: string) =>
    setMessages((prev) => {
      const next = [...prev];
      const i = next.length - 1;
      next[i] = { ...next[i], content: next[i].content + text };
      return next;
    });

  async function send(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setInput("");
    finalAnswerRef.current = "";

    // Replay a previously answered question instead of regenerating it.
    const key = q.toLowerCase();
    const cached = cacheRef.current.get(key);
    if (cached) {
      finalAnswerRef.current = cached.content;
      setMessages((prev) => [...prev, { role: "user", content: q }, { ...cached }]);
      if (voiceModeRef.current && cached.content) {
        speak(cached.content, () => {
          if (voiceModeRef.current) startListening();
        });
      }
      return;
    }

    setBusy(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: q },
      { role: "assistant", content: "", pending: true },
    ]);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Collect the final answer shape so we can cache it once complete.
    let tools: string[] | undefined;
    let citations: Citation[] | undefined;
    let refusal = false;
    let errored = false;

    await streamChat(
      q,
      {
        onTools: (t) => {
          tools = t;
          patchLast({ tools: t });
        },
        onCitations: (c) => {
          citations = c;
          patchLast({ citations: c });
        },
        onToken: (t) => {
          finalAnswerRef.current += t;
          appendToken(t);
        },
        onRefusal: (text) => {
          finalAnswerRef.current = text;
          refusal = true;
          patchLast({ content: text, refusal: true, pending: false });
        },
        onDone: () => patchLast({ pending: false }),
        onError: (msg) => {
          finalAnswerRef.current = "";
          errored = true;
          patchLast({ content: msg, error: true, pending: false });
        },
      },
      controller.signal
    );
    setBusy(false);

    // Cache successful answers (including refusals) so a repeat replays instantly.
    if (!errored && !controller.signal.aborted && finalAnswerRef.current) {
      cacheRef.current.set(key, {
        role: "assistant",
        content: finalAnswerRef.current,
        tools,
        citations,
        refusal,
        pending: false,
      });
    }

    // Voice mode: read the grounded answer back, then re-listen hands-free.
    if (voiceModeRef.current && finalAnswerRef.current) {
      speak(finalAnswerRef.current, () => {
        if (voiceModeRef.current) startListening();
      });
    }
  }

  function startListening() {
    if (!voiceSupported()) return;
    stopSpeaking();
    const rec = createRecognition(
      (text) => {
        setListening(false);
        send(text);
      },
      () => setListening(false)
    );
    if (!rec) return;
    recRef.current = rec;
    rec.onend = () => setListening(false);
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  function toggleVoice() {
    if (voiceMode) {
      // exit voice mode
      setVoiceMode(false);
      voiceModeRef.current = false;
      recRef.current?.abort();
      setListening(false);
      stopSpeaking();
    } else {
      setVoiceMode(true);
      voiceModeRef.current = true;
      startListening();
    }
  }

  // Auto-submit a prompt that arrived from an inline invite.
  useEffect(() => {
    if (open && incoming?.text) send(incoming.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incoming?.nonce]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Keep the off-screen panel out of the tab order / a11y tree when closed.
  useEffect(() => {
    const el = asideRef.current;
    if (!el) return;
    if (open) el.removeAttribute("inert");
    else el.setAttribute("inert", "");
  }, [open]);

  // Closing the panel stops any listening or speaking and exits voice mode.
  useEffect(() => {
    if (!open) {
      recRef.current?.abort();
      stopSpeaking();
      setListening(false);
      setVoiceMode(false);
      voiceModeRef.current = false;
    }
  }, [open]);

  return (
    <aside
      ref={asideRef}
      role="dialog"
      aria-label="Chat with Rajani's portfolio assistant"
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col border-l bg-panel shadow-2xl transition-transform duration-300",
        open ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <p className="text-[13px] font-medium text-primary">Ask about Rajani&apos;s work and interests</p>
          <p className="font-meta text-[10px] text-tertiary">
            RAG with tool routing, grounded in a small corpus
          </p>
        </div>
        <div className="flex items-center gap-2">
          {supportsVoice && (
            <button
              type="button"
              onClick={toggleVoice}
              aria-pressed={voiceMode}
              aria-label={voiceMode ? "Turn off voice mode" : "Turn on voice mode"}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
                voiceMode
                  ? "border-accent/60 text-accent"
                  : "text-secondary hover:border-hover",
                listening && "animate-pulse"
              )}
            >
              <Mic className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="text-secondary transition-colors hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div>
            <p className="text-[13px] text-secondary">
              Grounded answers about Rajani&rsquo;s work, projects, talks, and
              background. Try:
            </p>
            <div className="mt-3 space-y-2">
              {prompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  className="block w-full rounded-md border bg-surface px-3 py-2 text-left text-[12.5px] text-secondary transition-colors hover:border-hover hover:text-primary"
                >
                  {p}
                </button>
              ))}
            </div>
            <GroundingNote />
          </div>
        ) : (
          messages.map((m, i) => <MessageBubble key={i} m={m} />)
        )}
      </div>

      {/* Voice status */}
      {voiceMode && (
        <div className="flex items-center gap-2 border-t px-4 py-2 font-meta text-[11px] text-accent">
          <span className={cn("h-2 w-2 rounded-full bg-accent", listening && "animate-pulse")} />
          {listening ? "Listening…" : busy ? "Thinking…" : "Voice mode on. Tap the mic to speak."}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t px-4 py-3"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about current work, projects, talks or interests"
          className="flex-1 rounded-md border bg-surface px-3 py-2 text-[13px] text-primary outline-none placeholder:text-tertiary focus:border-hover"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-accent/50 text-accent transition-colors hover:bg-accent/10 disabled:opacity-40"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>

      {/* Feedback affordance, separate from the chat message flow. */}
      <div className="flex justify-center border-t px-4 py-2.5">
        <FeedbackTrigger />
      </div>
    </aside>
  );
}

function MessageBubble({ m }: { m: Message }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg rounded-br-sm border bg-surface px-3 py-2 text-[13px] text-primary">
          {m.content}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Chosen tool(s) — makes the routing visible. */}
      {m.tools && m.tools.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {m.tools.map((t) => (
            <span key={t} className="font-meta text-[10px] text-tertiary">
              → {t}
            </span>
          ))}
        </div>
      )}

      <div
        className={cn(
          "max-w-[92%] text-[13px] leading-relaxed",
          m.refusal ? "text-tertiary" : m.error ? "text-tertiary" : "text-primary"
        )}
      >
        {m.content}
        {m.pending && !m.content && (
          <span className="inline-flex gap-1 align-middle">
            <Dot /> <Dot /> <Dot />
          </span>
        )}
      </div>

      {/* Citation chips (accent earns its keep here). */}
      {!m.refusal && m.citations && m.citations.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {m.citations.map((c) => {
            const chip = (
              <span className="inline-flex items-center rounded-full border border-accent/40 px-2 py-0.5 font-meta text-[10px] text-accent">
                {c.title}
              </span>
            );
            return c.url ? (
              <a key={c.id} href={c.url} target="_blank" rel="noreferrer">
                {chip}
              </a>
            ) : (
              <span key={c.id}>{chip}</span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Dot() {
  return <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-tertiary" />;
}

// "evaluated for grounding" note, fed by scripts/eval.py output.
function GroundingNote() {
  const passed = groundingEval.grounded.passed + groundingEval.guardrail.passed;
  const total = groundingEval.grounded.total + groundingEval.guardrail.total;
  return (
    <p
      className="mt-4 flex items-center gap-1.5 font-meta text-[10px] text-tertiary"
      title={`Offline grounding eval: ${groundingEval.grounded.passed}/${groundingEval.grounded.total} grounded cases and ${groundingEval.guardrail.passed}/${groundingEval.guardrail.total} out-of-scope refusals passed on ${groundingEval.date}.`}
    >
      <Check className="h-3 w-3 text-accent" />
      evaluated for grounding · {passed}/{total} cases
    </p>
  );
}
