import { NextResponse } from "next/server";
import { GOLDEN } from "@/lib/golden";
import { runFitCheck, type RouteChoice } from "@/lib/fit";
import { scoreCase } from "@/lib/score";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { caseId, route } = (await req.json()) as { caseId: string; route?: string };
  const c = GOLDEN.find((g) => g.id === caseId);
  if (!c) return NextResponse.json({ error: "Unknown case" }, { status: 400 });
  const choice: RouteChoice = route === "fallback" ? "fallback" : route === "primary" ? "primary" : "auto";
  try {
    const r = await runFitCheck({ needs: [c.need] }, c.hostAnswers || [], choice);
    return NextResponse.json({ ...scoreCase(c, r), model: r.meta.model, route: r.meta.route, inputTokens: r.meta.inputTokens, outputTokens: r.meta.outputTokens });
  } catch (e) {
    return NextResponse.json({
      id: c.id,
      category: c.category,
      need: c.need,
      expected: c.accept.join(" / "),
      predicted: "error",
      verdictCorrect: false,
      sourceMatch: null,
      hallucinated: false,
      evidenceTotal: 0,
      evidenceVerified: 0,
      downgrades: 0,
      latencyMs: 0,
      summary: "",
      citations: [],
      error: e instanceof Error ? e.message : "error",
    });
  }
}
