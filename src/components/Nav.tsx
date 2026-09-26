"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Nav() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/directory", label: "Directory" },
    { href: "/whats-on", label: "What's On" },
    { href: "/jobs", label: "Jobs" },
    { href: "/updates", label: "Updates" },
    { href: "/list-business", label: "List Business" },
    { href: "/list-event", label: "List Event" },
    { href: "/list-job", label: "Post a Job" },
    { href: "/submit-update", label: "Submit Update" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-charcoal/95 backdrop-blur border-b border-white/5">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Bloem Bulletin" width={32} height={32} />
          <span className="font-serif font-bold tracking-tight text-lg">
            BLOEM <span className="text-lime">BULLETIN</span>
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/list-business" className="btn-primary text-sm !px-4 !py-2">
            List Business
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="sm:hidden text-cream p-2"
            aria-label="Menu"
          >
            {open ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav className="sm:hidden border-t border-white/5 px-4 py-3 flex flex-col gap-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-1">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}