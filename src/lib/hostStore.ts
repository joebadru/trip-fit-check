"use client";
import { useCallback, useEffect, useState } from "react";
import type { HostAnswer } from "./types";

export type PendingQuestion = { id: string; need: string; question: string; askedAt: string };

const PKEY = "tripfit.pending.v1";
const AKEY = "tripfit.answers.v1";
const EVT = "tripfit-store";

function read<T>(k: string, fallback: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
    window.dispatchEvent(new Event(EVT));
  } catch {}
}

export function useHostStore() {
  const [pending, setPending] = useState<PendingQuestion[]>([]);
  const [answers, setAnswers] = useState<HostAnswer[]>([]);

  const sync = useCallback(() => {
    setPending(read(PKEY, []));
    setAnswers(read(AKEY, []));
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  const ask = (need: string, question: string) => {
    const list = read<PendingQuestion[]>(PKEY, []);
    if (list.some((p) => p.question === question)) return;
    write(PKEY, [...list, { id: `Q-${Date.now()}`, need, question, askedAt: new Date().toISOString() }]);
  };

  const answer = (q: PendingQuestion, text: string) => {
    const list = read<PendingQuestion[]>(PKEY, []).filter((p) => p.id !== q.id);
    const ans = read<HostAnswer[]>(AKEY, []);
    write(PKEY, list);
    write(AKEY, [...ans, { id: `H-${ans.length + 1}`, question: q.question, answer: text, answeredAt: new Date().toISOString() }]);
  };

  const reset = () => {
    write(PKEY, []);
    write(AKEY, []);
  };

  return { pending, answers, ask, answer, reset };
}
