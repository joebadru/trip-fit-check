"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { REVIEWERS } from "@/lib/listing";
import { useHostStore, type PendingQuestion } from "@/lib/hostStore";
import { track } from "@/lib/track";

function Card({ q, onAnswer }: { q: PendingQuestion; onAnswer: (q: PendingQuestion, t: string) => void }) {
  const [text, setText] = useState("");
  return (
    <li className="rise rounded-2xl border border-line p-4">
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <span>A future guest is considering the loft in Príncipe Real</span>
        <span>{new Date(q.askedAt).toLocaleString()}</span>
      </div>
      <p className="mt-2 text-[15px] font-semibold">“{q.question}”</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="Share what it was like during your stay"
        className="mt-3 w-full rounded-xl border border-line p-3 text-sm outline-none focus:border-ink"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-muted">Shared with your first name and stay month only. Checked by moderation before it appears.</span>
        <button
          disabled={text.trim().length < 2}
          onClick={() => {
            onAnswer(q, text.trim());
            track("past_guest_answered", { reviewer: q.to });
          }}
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Send answer
        </button>
      </div>
    </li>
  );
}

export default function GuestInbox() {
  const { pendingGuests, guestAnswers, answer } = useHostStore();
  const opted = REVIEWERS.filter((r) => r.optIn);
  const [who, setWho] = useState(opted[0].reviewId);
  const counts = useMemo(() => Object.fromEntries(opted.map((r) => [r.reviewId, pendingGuests.filter((p) => p.to === r.reviewId).length])), [opted, pendingGuests]);
  const me = opted.find((r) => r.reviewId === who)!;
  const mine = pendingGuests.filter((p) => p.to === who);

  return (
    <main className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <p className="text-xs uppercase tracking-widest text-muted">Past guest view · demo</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Ask a past guest</h1>
      <p className="mt-2 text-muted">
        Guests who reviewed a stay can opt in to answer a few questions from future guests. Questions arrive here asynchronously; answers become
        a cited source in Trip Fit Check, alongside reviews and host answers. Switch between past guests below to play their part.
      </p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {opted.map((r) => (
          <button
            key={r.reviewId}
            onClick={() => setWho(r.reviewId)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${who === r.reviewId ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-rose-300 to-amber-200 text-[11px] font-bold text-ink">{r.name[0]}</span>
            {r.name}
            {counts[r.reviewId] > 0 && <span className="rounded-full bg-brand px-1.5 text-[10px] font-semibold text-white">{counts[r.reviewId]}</span>}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        You are {me.name} · stayed {me.stayed} · {me.trip}
      </p>

      <section className="mt-5">
        {mine.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted">
            No questions for {me.name} yet. On the <Link href="/" className="font-semibold text-ink underline">guest view</Link>, run a check and tap
            “Ask {me.name}” on a need related to their stay.
          </div>
        ) : (
          <ul className="space-y-3">
            {mine.map((q) => (
              <Card key={q.id} q={q} onAnswer={answer} />
            ))}
          </ul>
        )}
      </section>

      {guestAnswers.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold">Published past-guest answers ({guestAnswers.length})</h2>
          <ul className="mt-3 space-y-2">
            {guestAnswers.map((a) => (
              <li key={a.id} className="rounded-xl bg-fit-soft px-4 py-3 text-sm">
                <div className="flex items-center gap-2 text-xs text-fit">
                  <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] ring-1 ring-line">{a.id}</span>
                  {a.author} · now a source for Trip Fit Check
                </div>
                <p className="mt-1 font-semibold">{a.question}</p>
                <p className="mt-0.5">{a.answer}</p>
              </li>
            ))}
          </ul>
          <Link href="/" className="mt-4 inline-block rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
            Back to the guest view to re-check →
          </Link>
        </section>
      )}

      <section className="mt-10 rounded-2xl bg-gray-50 p-5">
        <h2 className="text-sm font-semibold">Designed for trust and privacy</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          <li>• Opt-in only, after a completed stay and review. Past guests can turn it off any time.</li>
          <li>• First name and stay month only. No contact details or profiles shared; messages stay inside the platform.</li>
          <li>• Asynchronous Q&amp;A, not open chat: one question per need, rate-limited per guest and per listing.</li>
          <li>• Moderation before publishing, and hosts can flag an answer for review (never edit it).</li>
          <li>• Small thank-you incentive (e.g. travel credit) is an experiment to test, not a default.</li>
        </ul>
      </section>
    </main>
  );
}
