"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHostStore } from "@/lib/hostStore";

const LINKS = [
  { href: "/", label: "Guest view" },
  { href: "/host", label: "Host inbox" },
  { href: "/eval", label: "Evaluation" },
  { href: "/about", label: "Product brief" },
];

export function Nav() {
  const path = usePathname();
  const { pending } = useHostStore();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">TF</span>
          <span className="hidden font-semibold tracking-tight sm:block">Trip Fit Check</span>
          <span className="hidden rounded-full border border-line px-2 py-0.5 text-[11px] text-muted md:block">concept prototype</span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto text-sm">
          {LINKS.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative whitespace-nowrap rounded-full px-3 py-2 transition ${active ? "bg-ink text-white" : "text-ink hover:bg-gray-100"}`}
              >
                {l.label}
                {l.href === "/host" && pending.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">{pending.length}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
