import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" });
}

export default async function WhatsOnPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  let query = supabase
    .from("events")
    .select("id, title, event_date, event_time, venue, area, image_url")
    .eq("status", "approved")
    .gte("event_date", todayStr)
    .order("event_date", { ascending: true });

  if (filter === "today") {
    query = query.eq("event_date", todayStr);
  } else if (filter === "weekend") {
    const day = today.getDay();
    const daysToSat = (6 - day + 7) % 7;
    const sat = new Date(today);
    sat.setDate(today.getDate() + daysToSat);
    const sun = new Date(sat);
    sun.setDate(sat.getDate() + 1);
    query = query
      .gte("event_date", sat.toISOString().slice(0, 10))
      .lte("event_date", sun.toISOString().slice(0, 10));
  }

  const { data: events, error } = await query;

  const filters = [
    { key: undefined, label: "Upcoming" },
    { key: "today", label: "Today" },
    { key: "weekend", label: "This weekend" },
  ];

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="font-serif text-2xl font-bold mb-4">What&apos;s On</h1>

        <div className="flex gap-2 mb-4">
          {filters.map((f) => (
            <Link
              key={f.label}
              href={f.key ? `/whats-on?filter=${f.key}` : "/whats-on"}
              className={`text-sm px-3 py-2 rounded-full ${
                filter === f.key ? "bg-lime text-charcoal" : "card"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {error && <p className="text-cream/50">Couldn&apos;t load events right now.</p>}

        {!error && events && events.length === 0 && (
          <div className="card p-6 text-center text-cream/60">
            No events listed here yet.
          </div>
        )}

        {!error && events && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {events.map((e) => (
              <Link key={e.id} href={`/whats-on/${e.id}`} className="card p-4 flex gap-3 items-center">
                <div className="w-16 h-16 rounded-lg bg-charcoal-light flex-shrink-0 overflow-hidden relative">
                  {e.image_url ? (
                    <Image
                      src={e.image_url}
                      alt={e.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-cream/30 text-xs">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{e.title}</div>
                  <div className="text-cream/60 text-sm">
                    {formatDate(e.event_date)}
                    {e.event_time ? ` · ${e.event_time}` : ""}
                  </div>
                  <div className="text-cream/60 text-sm truncate">
                    {e.venue} · {e.area}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}