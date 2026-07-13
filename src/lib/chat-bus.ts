/*
  Decoupled open-chat signal. Inline invites and the docked pill call openChat();
  the chat panel (Day 4) subscribes. No storage, just a window CustomEvent.
*/
export const OPEN_CHAT_EVENT = "open-chat";

export type OpenChatDetail = { prompt?: string };

export function openChat(prompt?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<OpenChatDetail>(OPEN_CHAT_EVENT, { detail: { prompt } })
  );
}

export function onOpenChat(handler: (detail: OpenChatDetail) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<OpenChatDetail>).detail ?? {});
  window.addEventListener(OPEN_CHAT_EVENT, listener);
  return () => window.removeEventListener(OPEN_CHAT_EVENT, listener);
}

/*
  Decoupled open-feedback signal, same pattern. The feedback trigger (in the
  chat panel and the page footer) calls openFeedback(); the global feedback
  modal (mounted in ChatRoot) subscribes.
*/
export const OPEN_FEEDBACK_EVENT = "open-feedback";

export function openFeedback() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_FEEDBACK_EVENT));
}

export function onOpenFeedback(handler: () => void) {
  window.addEventListener(OPEN_FEEDBACK_EVENT, handler);
  return () => window.removeEventListener(OPEN_FEEDBACK_EVENT, handler);
}
