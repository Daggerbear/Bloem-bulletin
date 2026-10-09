import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BusinessCard from "@/components/BusinessCard";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/constants";
import { AREAS, detectArea, keywords } from "@/lib/leratoHelpers";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Params = {
  category?: string | string[];
  q?: string | string[];
  area?: string | string[];
};

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? "";

function dirHref(p: { category?: string; q?: string; area?: string }) {
  const s = new URLSearchParams();
  if (p.category) s.set("category", p.category);
  if (p.q) s.set("q", p.q);
  if (p.area) s.set("area", p.area);
  const str = s.toString();
  return str ? `/directory?${str}` : "/directory";
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const sp = await searchParams;
  const category = first(sp.category);
  const q = first(sp.q).trim().slice(0, 80);
  const areaParam =
    AREAS.find((a) => a.toLowerCase() === first(sp.area).toLowerCase()) ?? "";
  const area = areaParam || detectArea(q);

  let terms = q ? keywords(q) : [];
  if (q && terms.length === 0 && !area) {
    terms = q
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1)
      .slice(0, 4);
  }

  let query = supabase
    .from("businesses")
    .select("id, name, category, area, logo_url, featured")
    .eq("status", "approved")
    .order("featured", { ascending: false })
    .order("name", { ascending: true });

  if (category) query = query.eq("category", category);
  if (area) query = query.ilike("area", area);
  if (terms.length) {
    query = query.or(
      terms
        .flatMap((t) => [
          `name.ilike.%${t}%`,
          `category.ilike.%${t}%`,
          `description.ilike.%${t}%`,
        ])
        .join(","),
    );
  }

  const { data: businesses, error } = await query;
  const filtering = Boolean(q || area || category);

  const chip =
    "text-sm px-3 rounded-full flex-shrink-0 whitespace-nowrap inline-flex items-center min-h-[44px]";

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="font-serif text-2xl font-bold mb-4">Directory</h1>

        <form action="/directory" method="get" role="search" className="flex gap-2 mb-4">
          {category && <input type="hidden" name="category" value={category} />}
          {areaParam && <input type="hidden" name="area" value={areaParam} />}
          <label htmlFor="dir-search" className="sr-only">
            Search the directory
          </label>
          <input
            id="dir-search"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search businesses and services"
            className="flex-1 min-w-0 bg-charcoal-card border border-white/10 rounded-full px-5 py-3 text-cream placeholder:text-cream/40 focus:outline-none focus:border-lime"
          />
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-2">
          <Link
            href={dirHref({ q, area: areaParam })}
            className={`${chip} ${!category ? "bg-lime text-charcoal" : "card"}`}
          >
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={dirHref({ category: c, q, area: areaParam })}
              className={`${chip} ${category === c ? "bg-lime text-charcoal" : "card"}`}
            >
              {c}
            </Link>
          ))}
        </div>

        {(q || area) && (
          <p className="text-sm text-cream/60 mb-4">
            Showing results{q ? ` for “${q}”` : ""}
            {area ? ` in ${area}` : ""}.{" "}
            <Link href="/directory" className="text-lime">
              Clear
            </Link>
          </p>
        )}

        {error && (
          <p className="text-cream/50">Couldn&apos;t load listings right now.</p>
        )}

        {!error && businesses && businesses.length === 0 && (
          <div className="card p-8 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-lime/10 flex items-center justify-center text-lime text-xl">
              +
            </div>
            <h2 className="font-serif text-lg font-bold">
              {filtering && (q || area)
                ? "Nothing matches that yet"
                : category
                  ? `Be the first ${category} listing`
                  : "Be the first business listed"}
            </h2>
            <p className="text-cream/60 text-sm max-w-xs">
              {filtering && (q || area)
                ? "Try a different word, or ask Lerato. If you know a business that should be here, listing is free."
                : "Bloem Bulletin just launched — free listings are open now, and early businesses get the most visibility."}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Link href="/list-business" className="btn-primary">
                List your business — it&apos;s free
              </Link>
              {(q || area) && (
                <Link
                  href={`/lerato?q=${encodeURIComponent(q || area || "")}`}
                  className="btn-secondary"
                >
                  Ask Lerato
                </Link>
              )}
            </div>
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