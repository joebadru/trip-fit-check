import { LISTING, SOURCES } from "@/lib/listing";
import { TripFitPanel } from "@/components/TripFitPanel";
import { BookButton } from "@/components/BookButton";

function Stars() {
  return <span aria-hidden className="text-ink">★</span>;
}

export default function ListingPage() {
  const reviews = SOURCES.filter((s) => s.kind === "review");
  const desc = SOURCES.find((s) => s.id === "L-desc")!;
  const amen = SOURCES.find((s) => s.id === "L-amen")!;
  const rules = SOURCES.find((s) => s.id === "L-rules")!;
  const loc = SOURCES.find((s) => s.id === "L-loc")!;

  return (
    <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
      <div className="mb-4 rounded-xl border border-dashed border-line bg-gray-50 px-4 py-2.5 text-xs text-muted">
        Prototype guest view: a fictional listing with the proposed <b className="text-ink">Trip Fit Check</b> on the right. Try it, tap “Ask the host” on anything it can’t confirm, then answer it in the Host inbox.
      </div>

      <h1 className="text-[26px] font-semibold tracking-tight">{LISTING.title}</h1>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm">
        <Stars /> <b>{LISTING.rating}</b>
        <span className="underline">{LISTING.reviewCount} reviews</span>
        <span className="text-muted">·</span>
        {LISTING.superhost && <span>Superhost</span>}
        <span className="text-muted">·</span>
        <span className="underline">{LISTING.city}</span>
      </div>

      <div className="mt-5 grid h-[320px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:h-[400px]">
        {LISTING.photos.map((p, i) => (
          <div
            key={p.label}
            className={`relative bg-gradient-to-br ${p.tone} ${i === 0 ? "col-span-4 row-span-2 sm:col-span-2" : "hidden sm:block"}`}
          >
            <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#000_1px,transparent_1px)] [background-size:14px_14px]" />
            <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium">{p.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0">
          <div className="flex items-center justify-between border-b border-line pb-6">
            <div>
              <h2 className="text-xl font-semibold">Entire loft hosted by {LISTING.host}</h2>
              <p className="mt-1 text-muted">
                {LISTING.guests} guests · {LISTING.bedrooms} bedroom · {LISTING.beds} beds · {LISTING.baths} bath
              </p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-full bg-ink text-lg font-semibold text-white">I</div>
          </div>

          <ul className="grid gap-3 border-b border-line py-6 sm:grid-cols-2">
            {LISTING.highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-[15px]">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-sm">✓</span>
                {h}
              </li>
            ))}
          </ul>

          <section className="border-b border-line py-6">
            <h3 className="text-lg font-semibold">About this place</h3>
            <p className="mt-2 leading-relaxed">{desc.text}</p>
          </section>
          <section className="border-b border-line py-6">
            <h3 className="text-lg font-semibold">What this place offers</h3>
            <p className="mt-2 leading-relaxed">{amen.text}</p>
          </section>
          <section className="grid gap-6 border-b border-line py-6 sm:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold">House rules</h3>
              <p className="mt-2 text-[15px] leading-relaxed">{rules.text}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Where you’ll be</h3>
              <p className="mt-2 text-[15px] leading-relaxed">{loc.text}</p>
            </div>
          </section>

          <section className="py-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h3 className="text-lg font-semibold">
                <Stars /> {LISTING.rating} · {LISTING.reviewCount} reviews
              </h3>
              <a href="#trip-fit" className="text-sm font-semibold underline">
                Not sure it fits? Let the AI check for you
              </a>
            </div>
            <p className="mt-1 text-xs text-muted">Showing 8 of {LISTING.reviewCount}. The Trip Fit Check reads these for you.</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {reviews.map((r) => (
                <article key={r.id}>
                  <div className="text-sm font-semibold">{r.label.replace("Review by ", "")}</div>
                  <p className="mt-1 text-[15px] leading-relaxed">{r.text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-4 rounded-2xl border border-line p-5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xl font-semibold">€{LISTING.pricePerNight}</span> <span className="text-muted">night</span>
              </div>
              <span className="text-sm text-muted">
                <Stars /> {LISTING.rating}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border border-line text-sm">
              <div className="border-r border-line p-2.5">
                <div className="text-[10px] font-bold uppercase">Check-in</div>12/11/2026
              </div>
              <div className="p-2.5">
                <div className="text-[10px] font-bold uppercase">Checkout</div>19/11/2026
              </div>
            </div>
            <BookButton />
            <p className="mt-2 text-center text-xs text-muted">You won’t be charged yet</p>
          </div>
          <TripFitPanel />
        </aside>
      </div>
    </main>
  );
}
