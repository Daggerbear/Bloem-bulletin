import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Item = {
  key: string;
  href: string;
  tag: string;
  live?: boolean;
  title: string;
  meta?: string;
};

export default async function RightNow() {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Africa/Johannesburg",
  });

  const [{ data: events }, { data: updates }, { data: jobs }] =
    await Promise.all([
      supabase
        .from("events")
        .select("id, title, venue, area")
        .eq("status", "approved")
        .eq("event_date", today)
        .limit(4),
      supabase
        .from("updates")
        .select("id, category, title")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("jobs")
        .select("id, title, job_type, area")
        .eq("status", "approved")
        .gte("expires_at", today)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  const items: Item[] = [
    ...(events ?? []).map((e) => ({
      key: `e-${e.id}`,
      href: `/whats-on/${e.id}`,
      tag: "On today",
      live: true,
      title: e.title,
      meta: [e.venue, e.area].filter(Boolean).join(" · "),
    })),
    ...(updates ?? []).map((u) => ({
      key: `u-${u.id}`,
      href: "/updates",
      tag: u.category,
      title: u.title,
    })),
    ...(jobs ?? []).map((j) => ({
      key: `j-${j.id}`,
      href: `/jobs/${j.id}`,
      tag: j.job_type,
      title: j.title,
      meta: j.area,
    })),
  ];

  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="right-now-heading"
      className="max-w-5xl mx-auto px-4 py-6"
    >
      <h2
        id="right-now-heading"
        className="font-serif text-xl font-bold mb-4 flex items-center gap-2"
      >
        <span className="live-dot" aria-hidden="true" />
        Right now in Bloem
      </h2>
      <div className="flex gap-3 overflow-x-auto snap-x pb-2">
        {items.map((i) => (
          <Link
            key={i.key}
            href={i.href}
            className="card snap-start min-w-[240px] max-w-[260px] p-4 flex-shrink-0 hover:border-lime/40 transition-colors"
          >
            <div className="text-xs text-lime mb-1 flex items-center gap-1.5">
              {i.live && <span className="live-dot" aria-hidden="true" />}
              {i.tag}
            </div>
            <div className="font-semibold line-clamp-2">{i.title}</div>
            {i.meta && (
              <div className="text-cream/60 text-sm mt-1 truncate">{i.meta}</div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}