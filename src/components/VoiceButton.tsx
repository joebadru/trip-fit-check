"use client";
import { useEffect, useRef, useState } from "react";

type SR = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

/** Push-to-talk using the browser's built-in speech recognition (Chrome, Edge, Safari). */
export function VoiceButton({ onText, size = "md" }: { onText: (t: string) => void; size?: "sm" | "md" }) {
  const [supported, setSupported] = useState(false);
  const [live, setLive] = useState(false);
  const ref = useRef<SR | null>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = "en-US";
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (e) => {
      const t = Array.from(e.results).map((res) => res[0].transcript).join(" ");
      if (t.trim()) onText(t.trim());
    };
    r.onend = () => setLive(false);
    r.onerror = () => setLive(false);
    ref.current = r;
    setSupported(true);
  }, [onText]);

  if (!supported) return null;
  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  return (
    <button
      type="button"
      aria-label={live ? "Stop listening" : "Answer by voice"}
      title={live ? "Listening… tap to stop" : "Answer by voice"}
      onClick={() => {
        if (!ref.current) return;
        if (live) {
          ref.current.stop();
          setLive(false);
        } else {
          try {
            ref.current.start();
            setLive(true);
          } catch {}
        }
      }}
      className={`${dim} grid shrink-0 place-items-center rounded-full border transition ${live ? "mic-live border-brand bg-brand text-white" : "border-line bg-white text-ink hover:border-ink"}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
    </button>
  );
}

export function speak(text: string) {
  try {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.03;
    window.speechSynthesis.speak(u);
  } catch {}
}
