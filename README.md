# Trip Fit Check

A concept feature for Airbnb, built as a working prototype for a Product Manager test.

**What it does:** a small AI agent on the listing page asks the guest 2–3 questions about their trip, then shows a need-by-need fit card. Every verdict is backed by an exact quote from the listing, a review or the host. When the answer isn't written anywhere, it says "not stated" instead of guessing, and the guest can ask the host in one tap. The host's reply is added to the listing, so the next guest gets an instant, cited answer.

> Concept prototype. Not affiliated with or endorsed by Airbnb. Listing, host and reviews are fictional.

## Pages

| Route | What it shows |
|---|---|
| `/` | Guest view: listing page with the Trip Fit Check panel (chips, free text or voice) |
| `/host` | Host inbox: questions the listing couldn't answer; replies become listing knowledge |
| `/eval` | Model validation: 20-case golden dataset, live run, release gates |
| `/about` | One-page product brief: problem, KPIs, architecture, AWS production path |

## How it works

1. **Sources.** Listing description, amenities, rules, location, 8 reviews and any published host answers are passed to the model as tagged `<source id="…">` blocks (`src/lib/listing.ts`).
2. **Structured output.** Claude returns a typed object through the AI SDK (`generateText` + `Output.object` with a Zod schema): need, verdict (`fits | partial | doesnt_fit | unknown`), reason, exact quotes with source IDs (`src/lib/fit.ts`).
3. **Citation guardrail.** The server checks every quote against the cited source text. A verdict with no verifiable quote is withheld and downgraded to "not stated" (`verifyQuote`, `applyGuardrails`).
4. **Gap loop.** "Not stated" needs become one-tap host questions; host answers become a new trusted source (`src/lib/hostStore.ts`, browser storage in the prototype).
5. **Evaluation.** `src/lib/golden.ts` holds 20 labelled cases across clear facts, mixed reviews, contradictions, must-abstain, adversarial prompts and the host loop. `src/lib/score.ts` computes verdict accuracy, abstention recall/precision, invented-answer rate, citation faithfulness, source match and latency, and checks them against release gates.

## Run locally

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

No key? `TRIPFIT_MOCK=1 npm run dev` runs a crude offline mock so you can click through the UI (its eval scores are meaningless).

## Deploy (Vercel)

1. Import this repo in Vercel (framework: Next.js, defaults are fine).
2. Add environment variable `ANTHROPIC_API_KEY`. Optional: `TRIPFIT_MODEL` (default `claude-sonnet-5-5`).
3. Deploy, open `/eval`, click **Run evaluation live**.

To pin a run as the default view, download the results JSON from `/eval` and save it as `public/eval-baseline.json` with the shape `{ "ranAt", "model", "results" }`.

## Production path on AWS

Claude on Amazon Bedrock behind API Gateway + Lambda; host answers in DynamoDB with moderation before publishing; reviews retrieved from OpenSearch for listings with hundreds of reviews; per-listing prompt caching; CloudWatch metrics; the golden-set evaluation in CI as a release gate.

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Vercel AI SDK 7, `@ai-sdk/anthropic`, Zod. Voice uses the browser's built-in Web Speech API.
