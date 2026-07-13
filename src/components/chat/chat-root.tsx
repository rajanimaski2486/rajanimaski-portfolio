"use client";

import { useEffect, useState } from "react";
import { ChatPill } from "./chat-pill";
import { ChatPanel } from "./chat-panel";
import { FeedbackModal } from "./feedback-modal";
import { onOpenChat, onOpenFeedback } from "@/lib/chat-bus";

/*
  Global chat mount (in the root layout, so it lives on every page).
  Listens for openChat() from the pill and the inline invites. When an invite
  carries a prompt, it is auto-submitted in the panel.
*/
export function ChatRoot() {
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [incoming, setIncoming] = useState<{ text: string; nonce: number }>();

  useEffect(() => {
    return onOpenChat((detail) => {
      setOpen(true);
      if (detail.prompt) setIncoming({ text: detail.prompt, nonce: Date.now() });
    });
  }, []);

  useEffect(() => onOpenFeedback(() => setFeedbackOpen(true)), []);

  return (
    <>
      {!open && <ChatPill onClick={() => setOpen(true)} />}
      <ChatPanel open={open} onClose={() => setOpen(false)} incoming={incoming} />
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
