"use client";
import { useState } from "react";
import type { Assessment, FitResult, Verdict } from "@/lib/types";
import { suggestReviewer, type Reviewer } from "@/lib/listing";

export const VERDICT: Record<Verdict, { label: string; cls: string; dot: string; icon: string }> = {
  fits: { label: "Fits", cls: "bg-fit-soft text-fit", dot: "bg-fit", icon: "✓" },
  partial: { label: "Partly", cls: "bg-partial-soft text-partial", dot: "bg-partial", icon: "◐" },
  doesnt_fit: { label: "Doesn't fit", cls: "bg-nofit-soft text-nofit", dot: "bg-nofit", icon: "✕" },
  unknown: { label: "Can't tell yet", cls: "bg-unknown-soft text-unknown", dot: "bg-unknown", icon: "?" },
};

export function VerdictPill({ v }: { v: Verdict }) {
  const s = VERDICT[v];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
      <span aria-hidden>{s.icon}</span>
      {s.label}
    </span>
  );
}

type RowProps = {
  a: Assessment;
  onAsk: (a: Assessment) => void;
  asked: boolean;
  onAskGuest: (a: Assessment, r: Reviewer) => void;
  askedGuest: boolean;
};

function GuestAvatar({ r }: { r: Reviewer }) {
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-300 to-amber-200 text-[11px] font-bold text-ink">
      {r.name[0]}
    </span>
  );
}

function Row({ a, onAsk, asked, onAskGuest, askedGuest }: RowProps) {
  const [open, setOpen] = useState(a.verdict !== "fits");
  const reviewer = suggestReviewer(a.need, a.evidence.map((e) => e.sourceId));
  return (
    <li className="rise rounded-xl border border-line bg-white p-3.5">
      <button className="flex w-full items-start justify-between gap-3 text-left" onClick={() => setOpen((o) => !o)}>
        <div>
          <div className="text-[15px] font-semibold leading-snug">{a.need}</div>
          <div className="mt-1 text-sm text-muted">{a.summary}</div>
        </div>
        <VerdictPill v={a.verdict} />
      </button>
      {open && a.evidence.length > 0 && (
        <div className="mt-3 space-y-2">
          {a.evidence.map((e, i) => (
            <figure key={i} className="rounded-lg bg-gray-50 px-3 py-2">
              <blockquote className="text-sm leading-snug">“{e.quote}”</blockquote>
              <figcaption className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-ink ring-1 ring-line">{e.sourceId}</span>
                {e.sourceLabel}
                <span className="ml-auto text-fit" title="This quote was checked against the source text">✓ verified</span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      {a.verdict === "unknown" && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-line px-3 py-2">
          <span className="text-xs text-muted">
            {a.downgraded ? "The AI's answer couldn't be verified, so we're not guessing." : "The listing and reviews don't say."}
          </span>
          <div className="flex flex-wrap gap-2">
            {asked ? (
              <span className="text-xs font-semibold text-fit">Sent to the host ✓</span>
            ) : (
              <button
                onClick={() => onAsk(a)}
                className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"
              >
                Ask the host
              </button>
            )}
            {reviewer &&
              (askedGuest ? (
                <span className="text-xs font-semibold text-fit">Sent to {reviewer.name} ✓</span>
              ) : (
                <button
                  onClick={() => onAskGuest(a, reviewer)}
                  className="rounded-full border border-ink px-3 py-1.5 text-xs font-semibold text-ink hover:bg-gray-50"
                >
                  Ask {reviewer.name}, a past guest
                </button>
              ))}
          </div>
        </div>
      )}
      {a.verdict !== "unknown" && reviewer && (
        <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-rose-50 to-amber-50 px-3 py-2">
          <GuestAvatar r={reviewer} />
          <div className="min-w-0 flex-1 text-xs leading-snug">
            <span className="font-semibold">Want a first-hand take?</span>{" "}
            <span className="text-muted">
              {reviewer.name} stayed in {reviewer.stayed} ({reviewer.trip.toLowerCase()}) and is happy to answer questions.
            </span>
          </div>
          {askedGuest ? (
            <span className="shrink-0 text-xs font-semibold text-fit">Sent ✓</span>
          ) : (
            <button
              onClick={() => onAskGuest(a, reviewer)}
              className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold ring-1 ring-line hover:ring-ink"
            >
              Ask {reviewer.name}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

export function FitCard({
  result,
  onAsk,
  askedNeeds,
  onAskGuest,
  askedGuestNeeds,
}: {
  result: FitResult;
  onAsk: (a: Assessment) => void;
  askedNeeds: Set<string>;
  onAskGuest: (a: Assessment, r: Reviewer) => void;
  askedGuestNeeds: Set<string>;
}) {
  const counts = result.assessments.reduce(
    (m, a) => ({ ...m, [a.verdict]: (m[a.verdict] || 0) + 1 }),
    {} as Record<Verdict, number>,
  );
  const total = result.assessments.length || 1;
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-ink p-4 text-white">
        <div className="text-[11px] uppercase tracking-widest text-white/60">Your trip fit</div>
        <p className="mt-1 text-[15px] leading-snug">{result.overall}</p>
        <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/10">
          {(["fits", "partial", "doesnt_fit", "unknown"] as Verdict[]).map((v) =>
            counts[v] ? <div key={v} className={VERDICT[v].dot} style={{ width: `${(counts[v] / total) * 100}%` }} /> : null,
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/75">
          {(["fits", "partial", "doesnt_fit", "unknown"] as Verdict[]).map((v) =>
            counts[v] ? (
              <span key={v} className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${VERDICT[v].dot}`} />
                {counts[v]} {VERDICT[v].label.toLowerCase()}
              </span>
            ) : null,
          )}
        </div>
      </div>
      <ul className="space-y-2">
        {result.assessments.map((a, i) => (
          <Row key={a.need + i} a={a} onAsk={onAsk} asked={askedNeeds.has(a.need)} onAskGuest={onAskGuest} askedGuest={askedGuestNeeds.has(a.need)} />
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[11px] text-muted">
        <span>
          {result.meta.evidenceVerified}/{result.meta.evidenceTotal} citations verified against source text
        </span>
        {result.meta.downgrades > 0 && <span>· {result.meta.downgrades} unverifiable answer(s) withheld</span>}
        <span>· {(result.meta.latencyMs / 1000).toFixed(1)}s</span>
        <span>· {result.meta.model}</span>
        {result.meta.route === "fallback" && (
          <span className="rounded-full bg-partial-soft px-2 py-0.5 font-medium text-partial" title={result.meta.fallbackReason}>
            Answered by the backup model ({result.meta.fallbackReason || "routing"})
          </span>
        )}
      </div>
    </div>
  );
}
