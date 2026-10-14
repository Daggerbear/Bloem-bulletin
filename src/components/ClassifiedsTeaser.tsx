import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/classifieds";

export default async function ClassifiedsTeaser() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Johannesburg" });

  const { data: items } = await supabase
    .from("classifieds")
    .select("id, title, listing_type, price, area, image_urls")
    .eq("status", "approved")
    .gte("expires_at", today)
    .order("created_at", { ascending: false })
    .limit(6);

  if (!items || items.length === 0) return null;

  return (
    <section aria-labelledby="classifieds-heading" className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 id="classifieds-heading" className="font-serif text-xl font-bold">
          Classifieds
        </h2>
        <Link href="/classifieds" className="text-sm text-lime">
          See all
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto snap-x pb-2">
        {items.map((c) => (
          <Link
            key={c.id}
            href={`/classifieds/${c.id}`}
            className="card snap-start w-40 flex-shrink-0 overflow-hidden hover:border-lime/40 transition-colors"
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
              ) : null}
            </div>
            <div className="p-3">
              <div className="text-xs text-lime">{c.listing_type}</div>
              <div className="font-semibold text-sm line-clamp-2 mt-0.5">{c.title}</div>
              <div className="text-sm mt-1">{formatPrice(c.price, c.listing_type)}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}