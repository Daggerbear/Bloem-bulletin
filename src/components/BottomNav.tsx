"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", d: "M3 12l9-9 9 9M5 10v10h14V10" },
  { href: "/directory", label: "Directory", d: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3" },
  { href: "/whats-on", label: "What's On", d: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" },
  { href: "/jobs", label: "Jobs", d: "M4 7h16v13H4zM9 7V4h6v3" },
  { href: "/updates", label: "Updates", d: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-charcoal/95 backdrop-blur border-t border-white/10 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const active =
            t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 min-h-[56px] text-[11px] ${
                  active ? "text-lime" : "text-cream/60"
                }`}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={t.d} />
                </svg>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}