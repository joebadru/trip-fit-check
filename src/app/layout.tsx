import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trip Fit Check · concept prototype",
  description: "A grounded AI agent that checks whether a home fits your trip, with verified evidence and a host-answer loop.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Nav />
        {children}
        <footer className="mt-20 border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted sm:px-6">
            Concept prototype by Joseph Badru for a product test. Not affiliated with or endorsed by Airbnb. Listing, host and reviews are fictional.
          </div>
        </footer>
      </body>
    </html>
  );
}
