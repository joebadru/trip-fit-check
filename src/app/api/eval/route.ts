import { NextResponse } from "next/server";
import { GOLDEN } from "@/lib/golden";
import { runFitCheck } from "@/lib/fit";
import { scoreCase } from "@/lib/score";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { caseId } = (await req.json()) as { caseId: string };
  const c = GOLDEN.find((g) => g.id === caseId);
  if (!c) return NextResponse.json({ error: "Unknown case" }, { status: 400 });
  try {
    const r = await runFitCheck({ needs: [c.need] }, c.hostAnswers || []);
    return NextResponse.json(scoreCase(c, r));
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
