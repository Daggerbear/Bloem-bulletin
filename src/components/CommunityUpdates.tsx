import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function CommunityUpdates() {
  const { data: updates } = await supabase
    .from("updates")
    .select("id, category, title")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(4);

  if (!updates || updates.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold">Community updates</h2>
        <Link href="/updates" className="text-sm text-lime">See all</Link>
      </div>
      <div className="flex flex-col gap-3">
        {updates.map((u) => (
          <div key={u.id} className="card p-4">
            <div className="text-xs text-lime mb-1">{u.category}</div>
            <div className="font-semibold">{u.title}</div>
          </div>
        ))}
      </div>
    </section>
  );
}