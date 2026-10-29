"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FitCard } from "./FitCard";
import { speak, VoiceButton } from "./VoiceButton";
import { useHostStore } from "@/lib/hostStore";
import { track } from "@/lib/track";
import type { Assessment, FitResult } from "@/lib/types";
import type { Reviewer } from "@/lib/listing";

const WHO = ["Just me", "Couple", "Family with kids", "Group of friends"];
const PURPOSE = ["Remote work", "Holiday", "Visiting family", "Business trip"];
const NEEDS = [
  "Reliable Wi-Fi for video calls",
  "A proper desk to work from",
  "Quiet nights",
  "Easy access with a stroller",
  "Cooking at home",
  "Arriving late at night",
  "Free parking",
  "Bringing a pet",
  "A crib for a baby",
  "Staying cool in summer",
];

type Step = 0 | 1 | 2 | 3;
const PROMPTS = [
  "Hi! I'll check whether this home fits your trip, using only the listing and real guest reviews. Who's coming?",
  "Nice. What's the trip mainly for?",
  "What matters most to you? Pick a few, or tell me in your own words.",
];

function Bubble({ who, children }: { who: "agent" | "guest"; children: React.ReactNode }) {
  return (
    <div className={`rise flex ${who === "guest" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-snug ${
          who === "guest" ? "rounded-br-md bg-ink text-white" : "rounded-bl-md bg-gray-100 text-ink"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function TripFitPanel({ embedded = false }: { embedded?: boolean }) {
  const [step, setStep] = useState<Step>(0);
  const [who, setWho] = useState("");
  const [purpose, setPurpose] = useState("");
  const [needs, setNeeds] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [voiceOn, setVoiceOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fallbackSent, setFallbackSent] = useState(false);
  const [result, setResult] = useState<FitResult | null>(null);
  const [checkedWithAnswers, setCheckedWithAnswers] = useState(0);
  const [askedNeeds, setAskedNeeds] = useState<Set<string>>(new Set());
  const { answers, ask, askGuest } = useHostStore();
  const [askedGuestNeeds, setAskedGuestNeeds] = useState<Set<string>>(new Set());
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => track("tripfit_opened"), []);
  useEffect(() => {
    if (voiceOn && step < 3) speak(PROMPTS[step]);
  }, [step, voiceOn]);
  useEffect(() => {
    if (step === 0 && !loading && !result) return;
    const box = endRef.current?.parentElement;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }, [step, loading, result]);

  const run = useCallback(
    async (needList: string[]) => {
      setLoading(true);
      setError("");
      setResult(null);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 30000);
      try {
        const res = await fetch("/api/fit", {
          signal: ctrl.signal,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trip: { who, purpose, needs: needList }, hostAnswers: answers }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        setResult(data);
        setCheckedWithAnswers(answers.length);
        track("tripfit_check_completed", {
          needs: needList.length,
          fits: data.assessments.filter((a: Assessment) => a.verdict === "fits").length,
          unknown: data.assessments.filter((a: Assessment) => a.verdict === "unknown").length,
          latency_ms: data.meta.latencyMs,
        });
        if (voiceOn) speak(data.overall);
      } catch (e) {
        setError(e instanceof Error ? e.message || "error" : "error");
        track("tripfit_check_failed", { reason: e instanceof Error ? e.name : "unknown" });
      } finally {
        clearTimeout(timer);
        setLoading(false);
      }
    },
    [who, purpose, answers, voiceOn],
  );

  const choose = (value: string) => {
    track("tripfit_question_answered", { step, value });
    if (step === 0) {
      setWho(value);
      setStep(1);
    } else if (step === 1) {
      setPurpose(value);
      setStep(2);
    }
  };

  const toggleNeed = (n: string) => setNeeds((cur) => (cur.includes(n) ? cur.filter((x) => x !== n) : cur.length >= 6 ? cur : [...cur, n]));

  const addCustom = (text: string) => {
    const parts = text
      .split(/,|;| and also | also /i)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);
    if (!parts.length) return;
    track("tripfit_need_added", { count: parts.length, after_result: !!result });
    if (step < 2 && parts.length) {
      choose(parts.join(", "));
      return;
    }
    const merged = [...needs, ...parts.filter((p) => !needs.includes(p))].slice(0, 6);
    setNeeds(merged);
    setDraft("");
    if (result) run(merged);
  };

  const onVoice = useCallback(
    (t: string) => {
      track("tripfit_voice_used", { step });
      if (step < 2) choose(t);
      else setDraft((d) => (d ? `${d}, ${t}` : t));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, result, needs],
  );

  const onAsk = (a: Assessment) => {
    ask(a.need, a.hostQuestion || `Could you tell me about: ${a.need}?`);
    setAskedNeeds((s) => new Set(s).add(a.need));
    track("tripfit_ask_host_clicked", { need: a.need, downgraded: !!a.downgraded });
  };

  const onAskGuest = (a: Assessment, r: Reviewer) => {
    askGuest(r.reviewId, r.name, a.need, `Hi ${r.name}, I'm thinking of booking this place. From your stay, how was it for this: ${a.need.toLowerCase()}?`);
    setAskedGuestNeeds((s) => new Set(s).add(a.need));
    track("tripfit_ask_guest_clicked", { need: a.need, reviewer: r.reviewId, verdict: a.verdict });
  };

  const newAnswers = answers.length > checkedWithAnswers && result;
  const canCheck = needs.length > 0 || draft.trim().length > 2;
  const chips = useMemo(() => (step === 0 ? WHO : step === 1 ? PURPOSE : NEEDS), [step]);

  return (
    <section id={embedded ? undefined : "trip-fit"} className={`overflow-hidden rounded-2xl border border-line bg-white ${embedded ? "" : "shadow-[0_6px_24px_rgba(0,0,0,0.08)]"}`}>
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs font-bold text-white">AI</span>
          <div>
            <div className="text-sm font-semibold leading-tight">Will this fit my trip?</div>
            <div className="text-[11px] text-muted">From this listing, its reviews, the host and past guests</div>
          </div>
        </div>
        <button
          onClick={() => setVoiceOn((v) => !v)}
          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${voiceOn ? "border-ink bg-ink text-white" : "border-line text-muted hover:border-ink"}`}
          title="Read questions aloud"
        >
          {voiceOn ? "🔊 Voice on" : "🔈 Voice off"}
        </button>
      </div>

      <div className={`space-y-3 overflow-y-auto px-4 py-4 ${embedded ? "max-h-[calc(100dvh-290px)]" : "max-h-[640px]"}`}>
        <Bubble who="agent">{PROMPTS[0]}</Bubble>
        {who && <Bubble who="guest">{who}</Bubble>}
        {step >= 1 && <Bubble who="agent">{PROMPTS[1]}</Bubble>}
        {purpose && <Bubble who="guest">{purpose}</Bubble>}
        {step >= 2 && <Bubble who="agent">{PROMPTS[2]}</Bubble>}
        {step === 3 && needs.length > 0 && <Bubble who="guest">{needs.join(" · ")}</Bubble>}

        {step < 3 && (
          <div className="rise flex flex-wrap gap-2 pt-1">
            {chips.map((c) => {
              const on = step === 2 && needs.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => (step === 2 ? toggleNeed(c) : choose(c))}
                  className={`rounded-full border px-3 py-1.5 text-[13px] transition ${on ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`}
                >
                  {on ? "✓ " : ""}
                  {c}
                </button>
              );
            })}
            {step === 2 &&
              needs
                .filter((n) => !NEEDS.includes(n))
                .map((n) => (
                  <button key={n} onClick={() => toggleNeed(n)} className="rounded-full border border-ink bg-ink px-3 py-1.5 text-[13px] text-white">
                    ✓ {n}
                  </button>
                ))}
          </div>
        )}

        {loading && (
          <div className="space-y-2 pt-1">
            <div className="text-xs text-muted">Reading the listing, house rules and 8 guest reviews…</div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        )}

        {error && (
          <div className="rise rounded-xl border border-line bg-gray-50 px-3 py-3 text-sm" role="alert">
            <div className="font-semibold">We couldn’t check this right now.</div>
            <p className="mt-0.5 text-muted">Nothing was guessed. You can try again, or send your questions straight to Inês.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={() => run(needs)} className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white">
                Try again
              </button>
              {fallbackSent ? (
                <span className="self-center text-xs font-semibold text-fit">Sent to the host ✓</span>
              ) : (
                <button
                  onClick={() => {
                    const list = needs.length ? needs : ["my trip"];
                    ask(list.join(", "), `Hi Inês, before I book, could you tell me about: ${list.join("; ").toLowerCase()}?`);
                    setFallbackSent(true);
                    track("tripfit_fallback_message_host", { needs: list.length, reason: error.slice(0, 60) });
                  }}
                  className="rounded-full border border-ink px-3 py-1.5 text-xs font-semibold"
                >
                  Message the host
                </button>
              )}
            </div>
          </div>
        )}

        {result && !loading && (
          <>
            <FitCard result={result} onAsk={onAsk} askedNeeds={askedNeeds} onAskGuest={onAskGuest} askedGuestNeeds={askedGuestNeeds} />
            {newAnswers && (
              <button
                onClick={() => {
                  track("tripfit_recheck_with_host_answers", { answers: answers.length });
                  run(needs);
                }}
                className="rise w-full rounded-xl border border-fit bg-fit-soft px-3 py-2.5 text-sm font-semibold text-fit"
              >
                New answer from the host or a past guest. Re-check my trip →
              </button>
            )}
            {result.followUp && <Bubble who="agent">{result.followUp}</Bubble>}
          </>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-line p-3">
        {step === 2 && !result ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && draft.trim() && addCustom(draft)}
                placeholder="e.g. I take calls at 9pm, I need a bathtub"
                className="h-11 min-w-0 flex-1 rounded-full border border-line px-4 text-sm outline-none focus:border-ink"
              />
              <VoiceButton onText={onVoice} />
            </div>
            <button
              disabled={!canCheck}
              onClick={() => {
                const extra = draft.trim()
                  ? draft.split(/,|;/).map((s) => s.trim()).filter((s) => s.length > 2)
                  : [];
                const all = [...needs, ...extra.filter((x) => !needs.includes(x))].slice(0, 6);
                setNeeds(all);
                setDraft("");
                setStep(3);
                run(all);
              }}
              className="h-11 w-full rounded-full bg-brand text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-40"
            >
              Check my trip fit
            </button>
          </div>
        ) : step < 2 ? (
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && draft.trim()) {
                  choose(draft.trim());
                  setDraft("");
                }
              }}
              placeholder="Or type your answer…"
              className="h-11 min-w-0 flex-1 rounded-full border border-line px-4 text-sm outline-none focus:border-ink"
            />
            <VoiceButton onText={onVoice} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && draft.trim() && !loading && addCustom(draft)}
              placeholder={needs.length >= 6 ? "Up to 6 needs per check" : "Anything else that matters?"}
              disabled={needs.length >= 6 || loading}
              className="h-11 min-w-0 flex-1 rounded-full border border-line px-4 text-sm outline-none focus:border-ink disabled:bg-gray-50"
            />
            <VoiceButton onText={onVoice} />
            <button
              onClick={() => draft.trim() && addCustom(draft)}
              disabled={!draft.trim() || loading}
              className="h-11 shrink-0 rounded-full bg-ink px-4 text-sm font-semibold text-white disabled:opacity-40"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
