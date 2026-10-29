import Link from "next/link";

const KPIS = [
  ["North star", "Booking conversion on listing views where Trip Fit Check was used, vs a holdout", "+2–3% relative lift"],
  ["Adoption", "Share of listing views that start a check", "≥ 8% of views"],
  ["Completion", "Checks that reach a fit card", "≥ 70% of starts"],
  ["Self-serve answers", "Needs answered without the host", "≥ 75%"],
  ["Gap loop", "Unknowns sent to the host, and host reply within 24h", "≥ 30% sent · ≥ 60% answered"],
  ["Past-guest loop", "Past guests opting in; questions answered within 48h", "≥ 15% opt in · ≥ 40% answered"],
  ["Trust", "Answers marked wrong by guests; ‘not as described’ complaints on checked stays", "< 2% · −10%"],
  ["Guardrails", "Citation faithfulness and invented answers on the golden set", "≥ 95% · 0"],
];

export default function About() {
  return (
    <main className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
      <p className="text-xs uppercase tracking-widest text-muted">Product brief</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Trip Fit Check</h1>
      <p className="mt-3 text-lg leading-relaxed">
        A small AI agent on the listing page that asks the guest two or three questions about their trip, then shows a need-by-need fit card,
        each verdict backed by a quote from the listing, a review or the host. When the answer isn’t written anywhere, it says so and lets the
        guest ask the host in one tap. The host’s reply is added to the listing, so the next guest gets it instantly.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["The problem", "Guests hesitate before booking because the detail that matters to their trip (calls at night, a stroller, weekend noise) is buried in 200 reviews or not written at all."],
          ["Why now", "Airbnb already answers listing questions with AI. This adds what it’s missing: proactive trip context, evidence you can see, and a loop that fills the gaps the AI can’t answer."],
          ["Why it’s small", "One component on one page, one API, no new data stores beyond host answers. Testable with a simple A/B on listing views."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-line p-4">
            <div className="text-sm font-semibold">{t}</div>
            <p className="mt-1 text-sm text-muted">{d}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 p-5">
        <div className="text-sm font-semibold">Part of the core feature: Ask a past guest</div>
        <p className="mt-1 text-[15px] text-muted">
          Reviews answer yesterday’s questions. When a need is only partly covered or the AI can’t tell, the guest can also ask a past guest who
          stayed on a similar trip and opted in to answer. It is asynchronous Q&amp;A, not open chat: first name and stay month only,
          moderated, rate-limited, and the answer becomes a cited source for the next guest. Host answers and the listing still win if they
          conflict. Tracked with its own metrics so its impact is visible on its own.
        </p>
      </div>

      <h2 className="mt-10 text-xl font-semibold">How to measure it</h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <tbody>
            {KPIS.map(([k, d, t]) => (
              <tr key={k} className="border-t border-line first:border-t-0">
                <td className="w-36 px-4 py-3 font-semibold">{k}</td>
                <td className="px-4 py-3 text-muted">{d}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">{t}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">Targets are starting hypotheses to validate in the first A/B test, not benchmarks.</p>

      <h2 className="mt-10 text-xl font-semibold">How it works</h2>
      <ol className="mt-3 space-y-2 text-[15px]">
        <li><b>1. Context.</b> The listing description, amenities, rules, location, recent reviews and published host answers are passed to the model as tagged sources.</li>
        <li><b>2. Model routing.</b> Claude Sonnet answers first. If it errors or runs past 20 seconds, the check goes to a backup (Gemini Flash), which has passed the same golden-set gates.</li>
        <li><b>3. Structured judgement.</b> The model returns a typed object: need, verdict (fits / partly / doesn’t fit / can’t tell yet), a one-line reason and exact quotes with source IDs.</li>
        <li><b>4. Guardrail.</b> The server checks every quote against the source text. A verdict with no verifiable quote is withheld and shown as “can’t tell yet”.</li>
        <li><b>5. Gap loop.</b> “Can’t tell yet” needs become one-tap questions to the host or an opted-in past guest. Their answers become new cited sources.</li>
        <li><b>6. Validation.</b> A golden dataset with release gates runs on every change, plus online A/B metrics after launch.</li>
      </ol>

      <h2 className="mt-10 text-xl font-semibold">Production path on AWS</h2>
      <p className="mt-2 text-[15px] text-muted">
        Prototype: Next.js on Vercel with Claude via the AI SDK. In production: Claude on Amazon Bedrock behind an API Gateway and Lambda
        service, host answers in DynamoDB with moderation before publishing, reviews retrieved from OpenSearch when a listing has hundreds,
        prompt and response caching per listing, and CloudWatch plus the evaluation suite in CI as the release gate.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white">Try the guest view</Link>
        <Link href="/eval" className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold">See the evaluation</Link>
      </div>
    </main>
  );
}
