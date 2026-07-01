// Browser Web Speech API helpers (STT in, TTS out). Zero extra infra.
// Same agent, two front doors: voice feeds the same /api/chat endpoint.

/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

function RecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
}

export function voiceSupported(): boolean {
  return !!RecognitionCtor() && typeof window !== "undefined" && "speechSynthesis" in window;
}

// Create a one-shot recognizer. onFinal fires with the final transcript.
export function createRecognition(
  onFinal: (text: string) => void,
  onError?: (msg: string) => void
): SpeechRecognitionLike | null {
  const Ctor = RecognitionCtor();
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = "en-US";
  rec.interimResults = false;
  rec.continuous = false;
  rec.onresult = (e: any) => {
    const transcript = e.results?.[0]?.[0]?.transcript ?? "";
    if (transcript) onFinal(transcript);
  };
  rec.onerror = (e: any) => onError?.(e?.error ?? "speech error");
  return rec;
}

export function speak(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }
  // Strip inline citation markers like [reveal-decision-01] before reading aloud.
  const clean = text.replace(/\[[a-z0-9-]+\]/gi, "").replace(/\s+/g, " ").trim();
  if (!clean) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  u.rate = 1.02;
  u.pitch = 1;
  if (onEnd) u.onend = () => onEnd();
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
