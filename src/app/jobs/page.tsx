import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, job_type, company, area, expires_at")
    .eq("status", "approved")
    .gte("expires_at", todayStr)
    .order("created_at", { ascending: false });

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="font-serif text-2xl font-bold mb-4">Jobs &amp; opportunities</h1>

        {error && <p className="text-cream/50">Couldn&apos;t load listings right now.</p>}

        {!error && jobs && jobs.length === 0 && (
          <div className="card p-6 text-center text-cream/60">
            No jobs listed right now.{" "}
            <Link href="/list-job" className="text-lime">Post one</Link>.
          </div>
        )}

        {!error && jobs && jobs.length > 0 && (
          <div className="flex flex-col gap-3">
            {jobs.map((j) => (
              <Link key={j.id} href={`/jobs/${j.id}`} className="card p-4">
                <div className="text-xs text-lime mb-1">{j.job_type}</div>
                <div className="font-semibold">{j.title}</div>
                <div className="text-cream/60 text-sm">
                  {j.company ? `${j.company} · ` : ""}{j.area}
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