"use client";
import { useCallback, useEffect, useState } from "react";
import type { HostAnswer } from "./types";

export type PendingQuestion = {
  id: string;
  need: string;
  question: string;
  askedAt: string;
  /** "host" or a past guest's review id (e.g. "R1"). */
  to: string;
  toName?: string;
};

const PKEY = "tripfit.pending.v2";
const AKEY = "tripfit.answers.v2";
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

/** Prototype store in browser storage. Production: messaging service + moderation + DynamoDB. */
export function useHostStore() {
  const [pendingAll, setPendingAll] = useState<PendingQuestion[]>([]);
  const [answers, setAnswers] = useState<HostAnswer[]>([]);

  const sync = useCallback(() => {
    setPendingAll(read(PKEY, []));
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

  const askTo = (to: string, toName: string | undefined, need: string, question: string) => {
    const list = read<PendingQuestion[]>(PKEY, []);
    if (list.some((p) => p.question === question && p.to === to)) return;
    write(PKEY, [...list, { id: `Q-${Date.now()}`, need, question, askedAt: new Date().toISOString(), to, toName }]);
  };

  const respond = (q: PendingQuestion, text: string) => {
    const list = read<PendingQuestion[]>(PKEY, []).filter((p) => p.id !== q.id);
    const ans = read<HostAnswer[]>(AKEY, []);
    const isGuest = q.to !== "host";
    const n = ans.filter((a) => (a.kind === "guest") === isGuest).length + 1;
    write(PKEY, list);
    write(AKEY, [
      ...ans,
      {
        id: isGuest ? `G-${n}` : `H-${n}`,
        question: q.question,
        answer: text,
        answeredAt: new Date().toISOString(),
        kind: isGuest ? "guest" : "host",
        author: isGuest ? q.toName : undefined,
      },
    ]);
  };

  const reset = () => {
    write(PKEY, []);
    write(AKEY, []);
  };

  const pending = pendingAll.filter((p) => p.to === "host");
  const pendingGuests = pendingAll.filter((p) => p.to !== "host");

  return {
    pending,
    pendingGuests,
    answers,
    hostAnswers: answers.filter((a) => a.kind !== "guest"),
    guestAnswers: answers.filter((a) => a.kind === "guest"),
    ask: (need: string, question: string) => askTo("host", "Inês", need, question),
    askGuest: (reviewId: string, name: string, need: string, question: string) => askTo(reviewId, name, need, question),
    answer: respond,
    reset,
  };
}
