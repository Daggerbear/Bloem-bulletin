import Link from "next/link";
import { supabase } from "@/lib/supabase";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" });
}

export default async function WhatsOn() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: events } = await supabase
    .from("events")
    .select("id, title, event_date, venue, area")
    .eq("status", "approved")
    .gte("event_date", todayStr)
    .order("event_date", { ascending: true })
    .limit(6);

  if (!events || events.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold">What&apos;s On</h2>
        <Link href="/whats-on" className="text-sm text-lime">See all</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {events.map((e) => (
          <Link key={e.id} href={`/whats-on/${e.id}`} className="card min-w-[200px] p-4 flex-shrink-0">
            <div className="font-semibold">{e.title}</div>
            <div className="text-cream/60 text-sm">
              {formatDate(e.event_date)} · {e.venue}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}