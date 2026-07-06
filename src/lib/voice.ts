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

// The default SpeechSynthesis voice is usually a low-quality robotic one.
// Most OSes ship far more natural neural voices that just aren't picked by
// default, so we rank the available voices and use the best one we can find.
let cachedVoice: SpeechSynthesisVoice | null | undefined; // undefined = not yet resolved

// Higher score = more natural. Ordered from most to least preferred.
function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = (v.lang || "").toLowerCase();
  let score = 0;

  // Only consider English voices for this (English-only) content.
  if (lang.startsWith("en")) score += 40;
  if (lang === "en-us") score += 10;

  // Microsoft "…Online (Natural)" / Neural voices — the best browser TTS.
  if (name.includes("natural") || name.includes("neural")) score += 60;
  // Chrome's bundled Google voices sound noticeably better than OS defaults.
  if (name.includes("google")) score += 45;
  // Apple's premium/enhanced named voices (Siri-tier).
  if (/\b(ava|zoe|allison|samantha|serena|evan|nathan|siri|jenny|aria|joanna)\b/.test(name))
    score += 35;
  if (name.includes("enhanced") || name.includes("premium")) score += 30;

  // Network (non-local) voices are typically the high-quality cloud ones.
  if (v.localService === false) score += 15;

  // Actively de-rank the known robotic fallbacks.
  if (/\b(albert|zarvox|bad news|good news|bahh|bells|boing|bubbles|cellos|fred|jester|junior|kathy|organ|ralph|superstar|trinoids|whisper|wobble)\b/.test(name))
    score -= 100;

  return score;
}

function pickBestVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null; // not loaded yet; resolve later
  const best = [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
  cachedVoice = best ?? null;
  return cachedVoice;
}

// Voices load asynchronously in Chrome; warm the cache as soon as they arrive.
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const warm = () => {
    cachedVoice = undefined;
    pickBestVoice();
  };
  window.speechSynthesis.onvoiceschanged = warm;
  warm();
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

  const voice = pickBestVoice();

  // Split into sentences so the engine resets intonation each clause instead of
  // flattening one long monotone run — this alone makes it sound less robotic.
  const sentences = clean.match(/[^.!?]+[.!?]*\s*/g) ?? [clean];
  const utterances = sentences
    .map((s) => s.trim())
    .filter(Boolean)
    .map((sentence) => {
      const u = new SpeechSynthesisUtterance(sentence);
      if (voice) u.voice = voice;
      u.rate = 0.98; // a touch slower reads as more deliberate and human
      u.pitch = 1.0;
      u.volume = 1;
      return u;
    });

  if (!utterances.length) {
    onEnd?.();
    return;
  }

  if (onEnd) utterances[utterances.length - 1].onend = () => onEnd();
  utterances.forEach((u) => window.speechSynthesis.speak(u));
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
