import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .gte("expires_at", todayStr)
    .single();

  if (error || !job) {
    notFound();
  }

  return (
    <>
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-xs text-lime mb-2">{job.job_type}</div>
        <h1 className="font-serif text-2xl font-bold mb-1">{job.title}</h1>
        <p className="text-cream/60 text-sm mb-6">
          {job.company ? `${job.company} · ` : ""}{job.area}
        </p>

        {job.description && (
          <p className="text-cream/80 mb-6 whitespace-pre-line">{job.description}</p>
        )}

        <div className="card p-4">
          <div className="text-xs text-cream/50 mb-1">How to apply / contact</div>
          <div className="text-sm">{job.contact}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}