"use client";

import { useEffect, useRef, useState } from "react";
import { Check, MessageSquarePlus, X } from "lucide-react";
import { openFeedback } from "@/lib/chat-bus";
import { cn } from "@/lib/utils";

// Mirrors the server cap; the server is the source of truth.
const MAX_WORDS = 100;

const wordCount = (text: string) => {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
};

type Status = "idle" | "sending" | "sent" | "error";

// Reusable trigger (chat panel footer and page footer). It only signals via the
// bus; the modal itself is lifted to the root so its backdrop covers the
// viewport (the sliding chat panel uses a CSS transform, which would otherwise
// trap a fixed-position child inside it).
export function FeedbackTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => openFeedback()}
      className={cn(
        "flex items-center gap-1.5 font-meta text-[11px] text-tertiary transition-colors hover:text-secondary",
        className
      )}
    >
      <MessageSquarePlus className="h-3.5 w-3.5" />
      Share feedback
    </button>
  );
}

/*
  Controlled feedback modal: a single textarea (up to a paragraph) that submits
  to /api/feedback, which indexes the note into the OpenSearch `feedback` index.
  Rendered at the root so it overlays the whole viewport.
*/
export function FeedbackModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setMessage("");
      setStatus("idle");
      setError("");
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const words = wordCount(message);
  const overLimit = words > MAX_WORDS;

  async function submit() {
    const note = message.trim();
    if (!note || overLimit || status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: note, path: window.location.pathname }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Could not save feedback right now.");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Could not save feedback right now."
      );
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share feedback"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close feedback"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div className="relative w-full max-w-[400px] rounded-xl border bg-panel p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-medium text-primary">Share feedback</p>
            <p className="mt-0.5 font-meta text-[10px] text-tertiary">
              A note about this site or my work. It goes straight to me.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close feedback"
            className="text-secondary transition-colors hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {status === "sent" ? (
          <div className="mt-6 flex flex-col items-center gap-2 py-4 text-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/50 text-accent">
              <Check className="h-4 w-4" />
            </span>
            <p className="text-[13px] text-primary">Thanks for the feedback.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-1 font-meta text-[11px] text-tertiary transition-colors hover:text-secondary"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
              }}
              rows={4}
              placeholder="What worked, what did not, or what you would want to see."
              className="mt-4 w-full resize-none rounded-md border bg-surface px-3 py-2 text-[13px] leading-relaxed text-primary outline-none placeholder:text-tertiary focus:border-hover"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="font-meta text-[10px] text-tertiary">
                {status === "error" ? (
                  <span className="text-red-400">{error}</span>
                ) : (
                  <span className={overLimit ? "text-red-400" : undefined}>
                    {words}/{MAX_WORDS} words
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={submit}
                disabled={!message.trim() || overLimit || status === "sending"}
                className="rounded-md border border-accent/50 px-3 py-1.5 text-[12.5px] text-accent transition-colors hover:bg-accent/10 disabled:opacity-40"
              >
                {status === "sending" ? "Sending" : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
