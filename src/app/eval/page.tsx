"use client";
import { useEffect, useMemo, useState } from "react";
import { GOLDEN } from "@/lib/golden";
import { GATES, summarize, type CaseResult } from "@/lib/score";
import { VerdictPill } from "@/components/FitCard";
import type { Verdict } from "@/lib/types";

const CAT_LABEL: Record<string, string> = {
  grounded: "Clearly supported",
  mixed: "Mixed evidence",
  contradicted: "Contradicted",
  abstain: "Not stated: must abstain",
  adversarial: "Adversarial",
  "host-loop": "Host answer loop",
};

function Tile({ label, value, suffix, gate }: { label: string; value: number; suffix?: string; gate?: { op: string; target: number } }) {
  const pass = gate ? (gate.op === ">=" ? value >= gate.target : value <= gate.target) : undefined;
  return (
    <div className="rounded-2xl border border-line p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">
        {value}
        {suffix}
      </div>
      {gate && (
        <div className={`mt-1 text-xs font-semibold ${pass ? "text-fit" : "text-nofit"}`}>
          {pass ? "✓ Passes" : "✕ Below"} release gate ({gate.op} {gate.target}
          {suffix})
        </div>
      )}
    </div>
  );
}

export default function EvalPage() {
  const [results, setResults] = useState<Record<string, CaseResult>>({});
  const [running, setRunning] = useState(false);
  const [baseline, setBaseline] = useState<{ ranAt: string; model: string; results: CaseResult[] } | null>(null);

  useEffect(() => {
    fetch("/eval-baseline.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setBaseline(d))
      .catch(() => {});
  }, []);

  const list = useMemo(() => Object.values(results), [results]);
  const shown = useMemo(() => (list.length ? list : baseline?.results || []), [list, baseline]);
  const s = useMemo(() => summarize(shown), [shown]);
  const byId = useMemo(() => Object.fromEntries(shown.map((r) => [r.id, r])), [shown]);

  const runAll = async () => {
    setRunning(true);
    setResults({});
    const queue = [...GOLDEN];
    const worker = async () => {
      while (queue.length) {
        const c = queue.shift()!;
        try {
          const res = await fetch("/api/eval", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ caseId: c.id }) });
          const r = (await res.json()) as CaseResult;
          setResults((m) => ({ ...m, [c.id]: r }));
        } catch {
          setResults((m) => ({ ...m, [c.id]: { id: c.id, category: c.category, need: c.need, expected: c.accept.join(" / "), predicted: "error", verdictCorrect: false, sourceMatch: null, hallucinated: false, evidenceTotal: 0, evidenceVerified: 0, downgrades: 0, latencyMs: 0, summary: "", citations: [], error: "network" } }));
        }
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
    setRunning(false);
  };

  const download = () => {
    const blob = new Blob([JSON.stringify({ ranAt: new Date().toISOString(), model: "see meta", summary: s, results: list }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tripfit-eval-${new Date().toISOString().slice(0, 16)}.json`;
    a.click();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
      <p className="text-xs uppercase tracking-widest text-muted">Model validation</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Is the AI telling the truth about this home?</h1>
      <p className="mt-2 max-w-3xl text-muted">
        A golden dataset of {GOLDEN.length} hand-labelled cases, each with the correct verdict and the source that proves it. It covers
        clear facts, mixed reviews, contradictions, things the listing never mentions, adversarial prompts and the host-answer loop. Every
        prompt or model change must pass the release gates before it ships.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button onClick={runAll} disabled={running} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          {running ? `Running… ${list.length}/${GOLDEN.length}` : "Run evaluation live"}
        </button>
        {list.length > 0 && !running && (
          <button onClick={download} className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold">
            Download results (JSON)
          </button>
        )}
        {!list.length && baseline && (
          <span className="text-xs text-muted">
            Showing last recorded run · {new Date(baseline.ranAt).toLocaleString()} · {baseline.model}
          </span>
        )}
      </div>

      {shown.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {GATES.map((g) => (
            <Tile key={g.key} label={g.label} value={s[g.key]} suffix={g.key === "p95LatencyMs" ? "" : "%"} gate={g} />
          ))}
        </div>
      )}
      {shown.length > 0 && (
        <p className="mt-3 text-xs text-muted">
          {s.cases - s.errors}/{s.cases} cases scored · abstention precision {s.abstentionPrecision}% · {s.guardrailDowngrades} answer(s)
          withheld by the citation guardrail · p50 {s.p50LatencyMs}ms · avg {s.avgInputTokens} input / {s.avgOutputTokens} output tokens per check
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-gray-50 text-xs text-muted">
            <tr>
              <th className="px-3 py-2.5">Case</th>
              <th className="px-3 py-2.5">Guest need</th>
              <th className="px-3 py-2.5">Expected</th>
              <th className="px-3 py-2.5">AI verdict</th>
              <th className="px-3 py-2.5">Cited</th>
              <th className="px-3 py-2.5">Result</th>
            </tr>
          </thead>
          <tbody>
            {GOLDEN.map((c) => {
              const r = byId[c.id];
              return (
                <tr key={c.id} className="border-t border-line align-top">
                  <td className="px-3 py-3">
                    <div className="font-mono text-xs">{c.id}</div>
                    <div className="mt-0.5 text-[11px] text-muted">{CAT_LABEL[c.category]}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div>{c.need}</div>
                    <div className="mt-0.5 text-[11px] text-muted">{c.why}</div>
                    {r?.summary && <div className="mt-1 text-xs italic text-muted">AI: {r.summary}</div>}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.accept.map((v) => (
                        <VerdictPill key={v} v={v} />
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {r ? r.predicted === "error" ? <span className="text-xs text-nofit">{r.error}</span> : <VerdictPill v={r.predicted as Verdict} /> : running ? <div className="skeleton h-6 w-20 rounded-full" /> : <span className="text-xs text-muted">–</span>}
                  </td>
                  <td className="px-3 py-3 font-mono text-[11px]">{r?.citations.join(", ") || (r ? "none" : "")}</td>
                  <td className="px-3 py-3">
                    {r && r.predicted !== "error" && (
                      <div className="space-y-0.5 text-xs">
                        <div className={r.verdictCorrect ? "text-fit" : "text-nofit"}>{r.verdictCorrect ? "✓ verdict" : "✕ verdict"}</div>
                        {r.sourceMatch !== null && <div className={r.sourceMatch ? "text-fit" : "text-partial"}>{r.sourceMatch ? "✓ source" : "~ other source"}</div>}
                        {r.hallucinated && <div className="font-semibold text-nofit">invented answer</div>}
                        {r.downgrades > 0 && <div className="text-partial">withheld by guardrail</div>}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          ["Offline (before release)", "This golden set runs on every prompt, model or retrieval change. Release gates block regressions. The set grows from real failures found in production."],
          ["Guardrail (every request)", "The model must quote its evidence word for word. The server checks each quote against the source text and withholds any verdict it can't verify, so an unverifiable claim never reaches a guest."],
          ["Online (after release)", "A/B test against listings without the feature. Watch booking conversion, host-message volume, ask-host rate, thumbs down on answers, and ‘not as described’ complaints. A weekly human review samples 50 live checks."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-2xl bg-gray-50 p-4">
            <div className="text-sm font-semibold">{t}</div>
            <p className="mt-1 text-sm text-muted">{d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
