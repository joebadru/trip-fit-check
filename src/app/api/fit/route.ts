import { NextResponse } from "next/server";
import { runFitCheck } from "@/lib/fit";
import type { HostAnswer, TripContext } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { trip: TripContext; hostAnswers?: HostAnswer[] };
    const trip: TripContext = {
      who: String(body.trip?.who || "").slice(0, 200),
      purpose: String(body.trip?.purpose || "").slice(0, 200),
      needs: (body.trip?.needs || []).map((n) => String(n).slice(0, 200)).slice(0, 6),
      notes: String(body.trip?.notes || "").slice(0, 600),
    };
    const hostAnswers = (body.hostAnswers || []).slice(0, 20).map((h) => ({
      id: String(h.id).slice(0, 40),
      question: String(h.question).slice(0, 200),
      answer: String(h.answer).slice(0, 600),
      answeredAt: String(h.answeredAt || ""),
    }));
    const result = await runFitCheck(trip, hostAnswers);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
