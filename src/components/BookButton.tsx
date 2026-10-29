"use client";
import { useState } from "react";
import { track } from "@/lib/track";

export function BookButton() {
  const [clicked, setClicked] = useState(false);
  return (
    <button
      onClick={() => {
        track("booking_cta_clicked");
        setClicked(true);
      }}
      className="mt-4 h-12 w-full rounded-xl bg-brand font-semibold text-white transition hover:bg-brand-dark"
    >
      {clicked ? "Reserve (demo only, no booking made)" : "Reserve"}
    </button>
  );
}
