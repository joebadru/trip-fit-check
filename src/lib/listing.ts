import type { HostAnswer, Source } from "./types";

export const LISTING = {
  id: "lis-prr-0417",
  title: "Sunlit loft with a work desk in Príncipe Real",
  city: "Lisbon, Portugal",
  host: "Inês",
  hostSince: "2019",
  superhost: true,
  rating: 4.86,
  reviewCount: 214,
  pricePerNight: 128,
  guests: 3,
  bedrooms: 1,
  beds: 2,
  baths: 1,
  photos: [
    { label: "Living room", src: "/photos/living.jpg", tone: "from-amber-200 via-orange-100 to-rose-100" },
    { label: "Work desk by the window", src: "/photos/desk.jpg", tone: "from-sky-200 via-cyan-100 to-emerald-100" },
    { label: "Bedroom", src: "/photos/bedroom.jpg", tone: "from-rose-200 via-pink-100 to-amber-50" },
    { label: "Kitchen", src: "/photos/kitchen.jpg", tone: "from-lime-200 via-emerald-100 to-teal-50" },
    { label: "Street view", src: "/photos/street.jpg", tone: "from-indigo-200 via-violet-100 to-sky-50" },
  ],
  highlights: [
    "Dedicated workspace",
    "200 Mbps fibre Wi-Fi",
    "Self check-in",
    "8 min walk to Rato metro",
  ],
};

export const SOURCES: Source[] = [
  {
    id: "L-desc",
    kind: "listing",
    label: "Listing description",
    text:
      "A bright one-bedroom loft on the third floor of a classic Lisbon building in Príncipe Real. The building has no elevator, so there are three flights of stairs. Large windows give beautiful natural light all day. The bedroom has a queen bed and the living room has a sofa bed. Sleeps up to 3 guests.",
  },
  {
    id: "L-amen",
    kind: "listing",
    label: "Amenities",
    text:
      "Wi-Fi: 200 Mbps fibre. Dedicated workspace with a full-size desk and an ergonomic chair. Fully equipped kitchen with oven, hob, dishwasher and coffee machine. Washing machine. No dryer; a drying rack is provided. Air conditioning in the bedroom only. Heating in all rooms. Hair dryer, iron, bed linen and towels.",
  },
  {
    id: "L-rules",
    kind: "rules",
    label: "House rules",
    text:
      "Check-in from 15:00 with self check-in via lockbox. Checkout by 11:00. No pets allowed. No parties or events. Quiet hours from 22:00 to 08:00. No smoking inside the apartment.",
  },
  {
    id: "L-loc",
    kind: "location",
    label: "Location and transport",
    text:
      "Rato metro station is an 8 minute walk. Several bus and tram stops are within 5 minutes. The apartment has no private parking; paid street parking is available nearby. Príncipe Real garden and many cafés and bars are on the same street.",
  },
  {
    id: "R1",
    kind: "review",
    label: "Review by Maya, remote worker · Mar 2026",
    text:
      "Wi-Fi was solid for my daily Zoom calls and never dropped once in two weeks. The desk by the window is a proper desk, not a dining table.",
  },
  {
    id: "R2",
    kind: "review",
    label: "Review by Tom, family with two kids · Aug 2025",
    text:
      "Lovely flat and the kids loved the light. Be aware it is on the third floor with no elevator; carrying the stroller up every day was hard work.",
  },
  {
    id: "R3",
    kind: "review",
    label: "Review by Ana · Jun 2026",
    text:
      "The street gets lively on Friday and Saturday nights until about 1am, so bring earplugs if you are a light sleeper. Weeknights were quiet.",
  },
  {
    id: "R4",
    kind: "review",
    label: "Review by Kenji · Apr 2026",
    text:
      "The kitchen is fully equipped and we cooked dinner every night. There is a supermarket two minutes away.",
  },
  {
    id: "R5",
    kind: "review",
    label: "Review by Sofia · Jan 2026",
    text:
      "Internet slowed down in the evenings when we were streaming films, but it was fine during the day.",
  },
  {
    id: "R6",
    kind: "review",
    label: "Review by Luca · Aug 2025",
    text:
      "The air conditioning is only in the bedroom, so the living room got very warm on August afternoons.",
  },
  {
    id: "R7",
    kind: "review",
    label: "Review by Priya · Feb 2026",
    text:
      "Self check-in with the lockbox was easy even though we arrived at midnight. Inês sent clear instructions the day before.",
  },
  {
    id: "R8",
    kind: "review",
    label: "Review by Daniel · May 2026",
    text:
      "Beautiful light and great location. The sofa bed is fine for one adult but a bit small for two.",
  },
];

export type Reviewer = { reviewId: string; name: string; stayed: string; trip: string; optIn: boolean; tags: string[] };

/** Past guests and whether they opted in to answer questions from future guests. */
export const REVIEWERS: Reviewer[] = [
  { reviewId: "R1", name: "Maya", stayed: "Mar 2026", trip: "Remote work, 2 weeks", optIn: true, tags: ["wi-fi", "wifi", "internet", "call", "zoom", "desk", "work", "chair", "monitor", "office"] },
  { reviewId: "R2", name: "Tom", stayed: "Aug 2025", trip: "Family with two kids", optIn: true, tags: ["kid", "child", "family", "stroller", "pram", "stairs", "crib", "cot", "baby", "toddler", "high chair", "bath"] },
  { reviewId: "R3", name: "Ana", stayed: "Jun 2026", trip: "Weekend city break", optIn: true, tags: ["quiet", "noise", "sleep", "night", "bars", "weekend", "neighbourhood", "neighborhood"] },
  { reviewId: "R4", name: "Kenji", stayed: "Apr 2026", trip: "Couple, foodie trip", optIn: false, tags: ["kitchen", "cook"] },
  { reviewId: "R5", name: "Sofia", stayed: "Jan 2026", trip: "Couple, winter stay", optIn: true, tags: ["stream", "evening", "tv", "heating", "winter", "cold"] },
  { reviewId: "R6", name: "Luca", stayed: "Aug 2025", trip: "Summer holiday", optIn: false, tags: ["air", "ac", "hot", "summer", "cool"] },
  { reviewId: "R7", name: "Priya", stayed: "Feb 2026", trip: "Late arrival, business trip", optIn: true, tags: ["check-in", "check in", "arrival", "late", "lockbox", "midnight", "luggage"] },
  { reviewId: "R8", name: "Daniel", stayed: "May 2026", trip: "Friends trip", optIn: false, tags: ["sofa", "bed", "sleep"] },
];

/** Pick the most relevant past guest who opted in: one already cited, else the best tag match. */
export function suggestReviewer(need: string, citedIds: string[]): Reviewer | undefined {
  const opted = REVIEWERS.filter((r) => r.optIn);
  const cited = opted.find((r) => citedIds.includes(r.reviewId));
  if (cited) return cited;
  const n = need.toLowerCase();
  let best: Reviewer | undefined;
  let score = 0;
  for (const r of opted) {
    const s = r.tags.filter((t) => n.includes(t)).length;
    if (s > score) {
      score = s;
      best = r;
    }
  }
  return best;
}

export function hostAnswersToSources(answers: HostAnswer[]): Source[] {
  return answers.map((a) =>
    a.kind === "guest"
      ? {
          id: a.id,
          kind: "guest_answer" as const,
          label: `Past guest answer · ${a.author || "a past guest"} · "${a.question}"`,
          text: a.answer,
        }
      : {
          id: a.id,
          kind: "host_answer" as const,
          label: `Host answer · "${a.question}"`,
          text: a.answer,
        },
  );
}

export function allSources(answers: HostAnswer[] = []): Source[] {
  return [...SOURCES, ...hostAnswersToSources(answers)];
}
