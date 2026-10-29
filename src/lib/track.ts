"use client";
/**
 * Product analytics stub. In production these events go to the analytics pipeline
 * and feed the KPI dashboard (adoption, completion, ask-host rate, booking after check).
 */
export type TrackEvent =
  | "tripfit_opened"
  | "tripfit_question_answered"
  | "tripfit_voice_used"
  | "tripfit_check_completed"
  | "tripfit_check_failed"
  | "tripfit_fallback_message_host"
  | "tripfit_need_added"
  | "tripfit_ask_host_clicked"
  | "tripfit_ask_guest_clicked"
  | "past_guest_answered"
  | "tripfit_recheck_with_host_answers"
  | "booking_cta_clicked";

export function track(event: TrackEvent, props: Record<string, unknown> = {}) {
  const payload = { event, ts: new Date().toISOString(), listing_id: "lis-prr-0417", ...props };
  if (typeof window !== "undefined") {
    console.info("[track]", payload);
    try {
      const k = "tripfit.events.v1";
      const list = JSON.parse(localStorage.getItem(k) || "[]");
      list.push(payload);
      localStorage.setItem(k, JSON.stringify(list.slice(-200)));
    } catch {}
  }
}
