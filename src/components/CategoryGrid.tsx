import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/constants";

export default async function CategoryGrid() {
  const { data } = await supabase
    .from("businesses")
    .select("category")
    .eq("status", "approved");

  const counts: Record<string, number> = {};
  (data ?? []).forEach((row) => {
    counts[row.category] = (counts[row.category] ?? 0) + 1;
  });

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="font-serif text-xl font-bold mb-4">Browse by category</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/directory?category=${encodeURIComponent(c)}`}
            className="card px-3 py-4 text-center text-sm hover:border-lime/40 transition-colors"
          >
            <div>{c}</div>
            {counts[c] > 0 && (
              <div className="text-cream/40 text-xs mt-1">{counts[c]}</div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}