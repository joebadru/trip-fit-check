import { NextResponse } from "next/server";
import { routingStatus } from "@/lib/fit";

/** Reports which models are configured (true/false only). Never returns key values. */
export async function GET() {
  return NextResponse.json({ ok: true, routing: routingStatus() });
}
