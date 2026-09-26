import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function JustLaunched() {
  const [{ count: bCount }, { count: eCount }, { count: jCount }, { count: uCount }] =
    await Promise.all([
      supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("updates").select("*", { count: "exact", head: true }).eq("status", "approved"),
    ]);

  const totalListings = (bCount ?? 0) + (eCount ?? 0) + (jCount ?? 0) + (uCount ?? 0);

  if (totalListings > 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <div className="card p-8 text-center flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-lime/10 flex items-center justify-center text-lime text-xl">
          ✦
        </div>
        <h2 className="font-serif text-xl font-bold">Bloem Bulletin just launched</h2>
        <p className="text-cream/60 text-sm max-w-sm">
          This is the very start — businesses, events, jobs and community
          updates will start showing up here as Bloemfontein locals list
          them. Free to list, reviewed before going live.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <Link href="/list-business" className="btn-primary">List your business</Link>
          <Link href="/list-event" className="btn-secondary">Submit an event</Link>
        </div>
      </div>
    </section>
  );
}