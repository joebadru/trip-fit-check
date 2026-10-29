import type { GoldenCase } from "./golden";
import type { FitResult } from "./types";

export type CaseResult = {
  id: string;
  category: GoldenCase["category"];
  need: string;
  expected: string;
  predicted: string;
  verdictCorrect: boolean;
  sourceMatch: boolean | null;
  /** Model asserted something (fits / doesnt_fit / partial) where the truth is "not stated". */
  hallucinated: boolean;
  evidenceTotal: number;
  evidenceVerified: number;
  downgrades: number;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  summary: string;
  citations: string[];
  error?: string;
};

export function scoreCase(c: GoldenCase, r: FitResult): CaseResult {
  const a = r.assessments[0];
  const predicted = a?.verdict ?? "unknown";
  const citations = (a?.evidence || []).map((e) => e.sourceId);
  const verdictCorrect = c.accept.includes(predicted);
  const sourceMatch =
    predicted === "unknown" || c.expectSources.length === 0 ? null : citations.some((s) => c.expectSources.includes(s));
  const truthIsUnknown = c.accept.length === 1 && c.accept[0] === "unknown";
  return {
    id: c.id,
    category: c.category,
    need: c.need,
    expected: c.accept.join(" / "),
    predicted,
    verdictCorrect,
    sourceMatch,
    hallucinated: truthIsUnknown && predicted !== "unknown",
    evidenceTotal: r.meta.evidenceTotal,
    evidenceVerified: r.meta.evidenceVerified,
    downgrades: r.meta.downgrades,
    latencyMs: r.meta.latencyMs,
    inputTokens: r.meta.inputTokens,
    outputTokens: r.meta.outputTokens,
    summary: a?.summary || "",
    citations,
  };
}

export type Summary = ReturnType<typeof summarize>;

export function summarize(results: CaseResult[]) {
  const ok = results.filter((r) => !r.error);
  const n = ok.length || 1;
  const pct = (x: number, d: number) => (d ? Math.round((x / d) * 1000) / 10 : 0);
  const abstainCases = ok.filter((r) => r.expected === "unknown");
  const predictedUnknown = ok.filter((r) => r.predicted === "unknown");
  const evTotal = ok.reduce((s, r) => s + r.evidenceTotal, 0);
  const evVer = ok.reduce((s, r) => s + r.evidenceVerified, 0);
  const srcCases = ok.filter((r) => r.sourceMatch !== null);
  const lat = ok.map((r) => r.latencyMs).sort((a, b) => a - b);
  const inTok = ok.reduce((s, r) => s + (r.inputTokens || 0), 0);
  const outTok = ok.reduce((s, r) => s + (r.outputTokens || 0), 0);
  return {
    cases: results.length,
    errors: results.length - ok.length,
    verdictAccuracy: pct(ok.filter((r) => r.verdictCorrect).length, n),
    abstentionRecall: pct(abstainCases.filter((r) => r.predicted === "unknown").length, abstainCases.length),
    abstentionPrecision: pct(predictedUnknown.filter((r) => r.expected.includes("unknown")).length, predictedUnknown.length),
    hallucinationRate: pct(ok.filter((r) => r.hallucinated).length, abstainCases.length),
    citationFaithfulness: pct(evVer, evTotal),
    sourceMatchRate: pct(srcCases.filter((r) => r.sourceMatch).length, srcCases.length),
    guardrailDowngrades: ok.reduce((s, r) => s + r.downgrades, 0),
    p50LatencyMs: lat.length ? lat[Math.floor(lat.length / 2)] : 0,
    p95LatencyMs: lat.length ? lat[Math.min(lat.length - 1, Math.floor(lat.length * 0.95))] : 0,
    avgInputTokens: Math.round(inTok / n),
    avgOutputTokens: Math.round(outTok / n),
  };
}

/** Release gates: the bar a model or prompt change must clear before shipping. */
export const GATES = [
  { key: "verdictAccuracy", label: "Verdict accuracy", op: ">=", target: 90 },
  { key: "abstentionRecall", label: "Says 'unknown' when it should", op: ">=", target: 95 },
  { key: "hallucinationRate", label: "Invented answers", op: "<=", target: 0 },
  { key: "citationFaithfulness", label: "Citations found in source", op: ">=", target: 95 },
  { key: "sourceMatchRate", label: "Cites the right source", op: ">=", target: 85 },
  { key: "p95LatencyMs", label: "p95 latency (ms)", op: "<=", target: 8000 },
] as const;
