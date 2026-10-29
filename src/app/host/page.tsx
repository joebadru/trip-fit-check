"use client";
import Link from "next/link";
import { useState } from "react";
import { useHostStore, type PendingQuestion } from "@/lib/hostStore";

function PendingCard({ q, onAnswer }: { q: PendingQuestion; onAnswer: (q: PendingQuestion, t: string) => void }) {
  const [text, setText] = useState("");
  return (
    <li className="rise rounded-2xl border border-line p-4">
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <span className="rounded-full bg-partial-soft px-2 py-0.5 font-semibold text-partial">Not in your listing</span>
        <span>{new Date(q.askedAt).toLocaleString()}</span>
      </div>
      <p className="mt-2 text-[15px] font-semibold">“{q.question}”</p>
      <p className="mt-1 text-xs text-muted">From a guest checking: {q.need}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="Type your answer. It will also be added to your listing so the AI can answer the next guest instantly."
        className="mt-3 w-full rounded-xl border border-line p-3 text-sm outline-none focus:border-ink"
      />
      <div className="mt-2 flex justify-end">
        <button
          disabled={text.trim().length < 2}
          onClick={() => onAnswer(q, text.trim())}
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Reply and add to listing
        </button>
      </div>
    </li>
  );
}

export default function HostInbox() {
  const { pending, hostAnswers: answers, answer, reset } = useHostStore();
  return (
    <main className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <p className="text-xs uppercase tracking-widest text-muted">Host view · Inês</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Guest questions your listing doesn’t answer yet</h1>
      <p className="mt-2 text-muted">
        When Trip Fit Check can’t confirm something, the guest can send it here in one tap. Your reply goes to that guest and becomes part of
        your listing, so the next guest gets an instant, cited answer.
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">Waiting for you ({pending.length})</h2>
        {pending.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-line p-6 text-sm text-muted">
            No open questions. On the <Link href="/" className="font-semibold text-ink underline">guest view</Link>, ask the AI about
            something the listing doesn’t mention (try “A crib for a baby”), then tap “Ask the host”.
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {pending.map((q) => (
              <PendingCard key={q.id} q={q} onAnswer={answer} />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold">Added to your listing ({answers.length})</h2>
        {answers.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Answers you publish appear here and are used as a trusted source by the AI.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {answers.map((a) => (
              <li key={a.id} className="rounded-xl bg-fit-soft px-4 py-3 text-sm">
                <div className="flex items-center gap-2 text-xs text-fit">
                  <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] ring-1 ring-line">{a.id}</span>
                  Live in listing knowledge
                </div>
                <p className="mt-1 font-semibold">{a.question}</p>
                <p className="mt-0.5">{a.answer}</p>
              </li>
            ))}
          </ul>
        )}
        {answers.length > 0 && (
          <Link href="/" className="mt-4 inline-block rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
            Back to the guest view to re-check →
          </Link>
        )}
      </section>

      <button onClick={reset} className="mt-10 text-xs text-muted underline">
        Reset demo data
      </button>
    </main>
  );
}
