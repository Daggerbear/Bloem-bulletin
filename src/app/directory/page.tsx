import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BusinessCard from "@/components/BusinessCard";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  let query = supabase
    .from("businesses")
    .select("id, name, category, area, logo_url, featured")
    .eq("status", "approved")
    .order("featured", { ascending: false })
    .order("name", { ascending: true });

  if (category) {
    query = query.eq("category", category);
  }

  const { data: businesses, error } = await query;

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="font-serif text-2xl font-bold mb-4">Directory</h1>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          <Link
            href="/directory"
            className={`text-sm px-3 py-2 rounded-full flex-shrink-0 ${
              !category ? "bg-lime text-charcoal" : "card"
            }`}
          >
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/directory?category=${encodeURIComponent(c)}`}
              className={`text-sm px-3 py-2 rounded-full flex-shrink-0 whitespace-nowrap ${
                category === c ? "bg-lime text-charcoal" : "card"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        {error && (
          <p className="text-cream/50">Couldn&apos;t load listings right now.</p>
        )}

        {!error && businesses && businesses.length === 0 && (
          <div className="card p-8 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-lime/10 flex items-center justify-center text-lime text-xl">
              +
            </div>
            <h2 className="font-serif text-lg font-bold">
              {category ? `Be the first ${category} listing` : "Be the first business listed"}
            </h2>
            <p className="text-cream/60 text-sm max-w-xs">
              Bloem Bulletin just launched — free listings are open now, and
              early businesses get the most visibility.
            </p>
            <Link href="/list-business" className="btn-primary mt-2">
              List your business — it&apos;s free
            </Link>
          </div>
        )}

        {!error && businesses && businesses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {businesses.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}