"use client";
import { useEffect, useState } from "react";
import { TripFitPanel } from "./TripFitPanel";
import { LISTING } from "@/lib/listing";
import { track } from "@/lib/track";

/** Mobile only: sticky booking bar plus Trip Fit Check as a full-screen sheet. */
export function MobileBar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) setMounted(true);
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[84px] left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-[10px]">AI</span>
        Will this fit my trip?
      </button>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-line bg-white px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div>
          <div className="text-[15px]">
            <b>€{LISTING.pricePerNight}</b> <span className="text-muted">night</span>
          </div>
          <div className="text-xs underline">12 – 19 Nov</div>
        </div>
        <button onClick={() => track("booking_cta_clicked", { surface: "mobile_bar" })} className="rounded-xl bg-brand px-7 py-3 font-semibold text-white">
          Reserve
        </button>
      </div>

      <div
        className={`fixed inset-0 z-50 flex flex-col bg-white transition-transform duration-300 ${open ? "translate-y-0" : "pointer-events-none translate-y-full"}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-gray-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <div className="text-sm font-semibold">{LISTING.title.split(" in ")[0]}</div>
          <span className="w-9" />
        </div>
        <div className="flex-1 overflow-y-auto p-3">{mounted && <TripFitPanel embedded />}</div>
      </div>
    </div>
  );
}
