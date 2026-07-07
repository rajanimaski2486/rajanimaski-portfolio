"use client";

import { ArrowRight, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { openChat } from "@/lib/chat-bus";

/*
  Second door into the chat: a compact accent-tinted pill (not a full-width bar,
  which reads like a text input), one per page, hooked to that page's strongest
  claim. Clicking dispatches the shared open-chat signal to preload the prompt.
*/
export function InlineInvite({
  children,
  prompt,
}: {
  children: ReactNode; // the short label, with the claim wrapped in <span className="text-accent">
  prompt?: string; // optional question to preload when chat is wired
}) {
  return (
    <button
      type="button"
      onClick={() => openChat(prompt)}
      className="group inline-flex max-w-full items-center gap-2 rounded-full border border-accent/40 bg-accent-tint px-3.5 py-2 text-left transition-colors hover:border-accent/70"
    >
      <MessageCircle className="h-4 w-4 shrink-0 text-accent" />
      <span className="truncate text-[12.5px] leading-none text-secondary">
        {children}
      </span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
