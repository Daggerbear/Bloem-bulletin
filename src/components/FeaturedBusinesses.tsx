import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BusinessCard from "@/components/BusinessCard";

export default async function FeaturedBusinesses() {
  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name, category, area, logo_url, featured")
    .eq("status", "approved")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (!businesses || businesses.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold">Featured businesses</h2>
        <Link href="/directory" className="text-sm text-lime">See all</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {businesses.map((b) => (
          <div key={b.id} className="min-w-[200px] flex-shrink-0">
            <BusinessCard business={b} />
          </div>
        ))}
      </div>
    </section>
  );
}