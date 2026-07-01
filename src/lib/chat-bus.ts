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
