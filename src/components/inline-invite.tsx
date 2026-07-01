"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { openChat } from "@/lib/chat-bus";

/*
  Second door into the chat. Subtle accent-tinted bar, one per page, hooked to
  that page's strongest claim. Day 1: visual only (the chat panel arrives Day 4).
  Clicking dispatches the shared open-chat signal, which nothing listens to yet.
*/
export function InlineInvite({
  children,
  prompt,
}: {
  children: ReactNode; // the line, with the claim wrapped in <span className="text-accent">
  prompt?: string; // optional question to preload when chat is wired
}) {
  return (
    <button
      type="button"
      onClick={() => openChat(prompt)}
      className="group flex w-full items-center gap-2.5 rounded-md border border-accent/25 bg-accent-tint px-3.5 py-2.5 text-left transition-colors hover:border-accent/40"
    >
      <Sparkles className="h-4 w-4 shrink-0 text-accent" />
      <span className="text-[13px] leading-snug text-secondary">{children}</span>
      <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
