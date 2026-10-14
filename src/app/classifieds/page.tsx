import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { AREAS } from "@/lib/constants";
import {
  CLASSIFIED_CATEGORIES,
  CLASSIFIED_TYPES,
  formatPrice,
} from "@/lib/classifieds";

export const dynamic = "force-dynamic";

type Params = {
  type?: string | string[];
  category?: string | string[];
  q?: string | string[];
  area?: string | string[];
};

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? "";

function href(p: { type?: string; category?: string; q?: string; area?: string }) {
  const s = new URLSearchParams();
  if (p.type) s.set("type", p.type);
  if (p.category) s.set("category", p.category);
  if (p.q) s.set("q", p.q);
  if (p.area) s.set("area", p.area);
  const str = s.toString();
  return str ? `/classifieds?${str}` : "/classifieds";
}

export default async function ClassifiedsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const sp = await searchParams;
  const type = (CLASSIFIED_TYPES as readonly string[]).find((t) => t === first(sp.type)) ?? "";
  const category =
    (CLASSIFIED_CATEGORIES as readonly string[]).find((c) => c === first(sp.category)) ?? "";
  const area =
    (AREAS as readonly string[]).find((a) => a.toLowerCase() === first(sp.area).toLowerCase()) ?? "";
  const q = first(sp.q).trim().slice(0, 80);

  const terms = q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, 4);

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Johannesburg" });

  let query = supabase
    .from("classifieds")
    .select("id, title, listing_type, category, price, area, image_urls")
    .eq("status", "approved")
    .gte("expires_at", today)
    .order("created_at", { ascending: false })
    .limit(60);

  if (type) query = query.eq("listing_type", type);
  if (category) query = query.eq("category", category);
  if (area) query = query.ilike("area", area);
  if (terms.length) {
    query = query.or(
      terms
        .flatMap((t) => [
          `title.ilike.%${t}%`,
          `description.ilike.%${t}%`,
          `category.ilike.%${t}%`,
        ])
        .join(","),
    );
  }

  const { data: items, error } = await query;
  const filtering = Boolean(type || category || q || area);

  const chip =
    "text-sm px-3 rounded-full flex-shrink-0 whitespace-nowrap inline-flex items-center min-h-[44px]";

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="font-serif text-2xl font-bold">Classifieds</h1>
          <Link href="/list-classified" className="btn-primary text-sm">
            Post a classified
          </Link>
        </div>

        <form action="/classifieds" method="get" role="search" className="flex gap-2 mb-4">
          {type && <input type="hidden" name="type" value={type} />}
          {category && <input type="hidden" name="category" value={category} />}
          {area && <input type="hidden" name="area" value={area} />}
          <label htmlFor="cls-search" className="sr-only">
            Search classifieds
          </label>
          <input
            id="cls-search"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search classifieds"
            className="flex-1 min-w-0 bg-charcoal-card border border-white/10 rounded-full px-5 py-3 text-cream placeholder:text-cream/40 focus:outline-none focus:border-lime"
          />
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <Link
            href={href({ category, q, area })}
            className={`${chip} ${!type ? "bg-lime text-charcoal" : "card"}`}
          >
            All
          </Link>
          {CLASSIFIED_TYPES.map((t) => (
            <Link
              key={t}
              href={href({ type: t, category, q, area })}
              className={`${chip} ${type === t ? "bg-lime text-charcoal" : "card"}`}
            >
              {t}
            </Link>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-2">
          <Link
            href={href({ type, q, area })}
            className={`${chip} ${!category ? "bg-lime text-charcoal" : "card"}`}
          >
            Any category
          </Link>
          {CLASSIFIED_CATEGORIES.map((c) => (
            <Link
              key={c}
              href={href({ type, category: c, q, area })}
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
            <Link href="/classifieds" className="text-lime">
              Clear
            </Link>
          </p>
        )}

        {error && <p className="text-cream/50">Couldn&apos;t load classifieds right now.</p>}

        {!error && items && items.length === 0 && (
          <div className="card p-8 text-center flex flex-col items-center gap-3">
            <h2 className="font-serif text-lg font-bold">
              {filtering ? "Nothing matches that yet" : "Be the first to post"}
            </h2>
            <p className="text-cream/60 text-sm max-w-xs">
              {filtering
                ? "Try a different word or category. Got something to sell or looking for something? Posting is free."
                : "Selling, swapping or looking for something? Classifieds are free and reviewed before they go live."}
            </p>
            <Link href="/list-classified" className="btn-primary mt-2">
              Post a classified
            </Link>
          </div>
        )}

        {!error && items && items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((c) => (
              <Link
                key={c.id}
                href={`/classifieds/${c.id}`}
                className="card overflow-hidden block hover:border-lime/40 transition-colors"
              >
                <div className="aspect-square bg-charcoal-light">
                  {c.image_urls?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.image_urls[0]}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-cream/30 text-sm">
                      No photo
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-xs text-lime">{c.listing_type}</div>
                  <div className="font-semibold line-clamp-2 mt-0.5">{c.title}</div>
                  <div className="text-sm mt-1">{formatPrice(c.price, c.listing_type)}</div>
                  <div className="text-xs text-cream/50 mt-0.5 truncate">{c.area}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <p className="text-xs text-cream/40 mt-8">
          Meet in a public place and never pay in advance. Bloem Bulletin doesn&apos;t handle
          payments, deliveries or disputes between buyers and sellers.
        </p>
      </main>
      <Footer />
    </>
  );
}