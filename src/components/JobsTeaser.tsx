import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function JobsTeaser() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, job_type, area")
    .eq("status", "approved")
    .gte("expires_at", todayStr)
    .order("created_at", { ascending: false })
    .limit(6);

  if (!jobs || jobs.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold">Jobs &amp; opportunities</h2>
        <Link href="/jobs" className="text-sm text-lime">See all</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {jobs.map((j) => (
          <Link key={j.id} href={`/jobs/${j.id}`} className="card min-w-[200px] p-4 flex-shrink-0">
            <div className="text-xs text-lime mb-1">{j.job_type}</div>
            <div className="font-semibold">{j.title}</div>
            <div className="text-cream/60 text-sm">{j.area}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}