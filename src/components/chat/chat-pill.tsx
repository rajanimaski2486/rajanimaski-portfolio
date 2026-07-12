"use client";

import { useEffect, useState } from "react";
import { Mic } from "lucide-react";

/*
  Docked pill, bottom-right, collapsed by default. Accent border, green status
  dot, "Ask about Rajani's work and interests", mic icon. One-time attention: ~1.2s after load it
  double-pulses (2 iterations, finite) then settles. It NEVER loops.
*/
export function ChatPill({ onClick }: { onClick: () => void }) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setTimeout(() => setPulse(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ask about Rajani's work and interests"
      title="Open chat"
      style={{ borderColor: "rgba(93,204,165,0.4)" }}
      className={`fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-[22px] border bg-panel px-4 py-2.5 text-[13px] text-primary shadow-lg transition-colors hover:border-accent/70 ${
        pulse ? "animate-pill-pulse" : ""
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      <span>Ask about Rajani&apos;s work and interests</span>
      <Mic className="h-4 w-4 text-accent" />
    </button>
  );
}
