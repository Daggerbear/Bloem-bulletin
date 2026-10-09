import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AREAS } from "@/lib/leratoHelpers";

export default async function Hero() {
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "hero_image_url")
    .maybeSingle();
  const heroUrl: string | null = data?.value ?? null;

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {heroUrl ? (
          <Image
            src={heroUrl}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(180_230_29/0.18),transparent_60%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/75 to-charcoal/30" />
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-16 pb-6 sm:pt-28">
        <p className="flex items-center gap-2 text-sm text-cream/80">
          <span className="live-dot" aria-hidden="true" />
          What&apos;s happening in Bloem
        </p>

        <h1 className="font-serif text-5xl sm:text-7xl font-bold leading-[1.05] mt-3">
          Your city.
          <br />
          <span className="text-lime">In the loop.</span>
        </h1>

        <p className="text-cream/80 mt-4 text-base sm:text-lg max-w-md">
          Businesses, events, jobs and community updates across Bloemfontein.
        </p>

        <form action="/directory" method="get" role="search" className="mt-6 flex gap-2">
          <label htmlFor="home-search" className="sr-only">
            Search Bloemfontein
          </label>
          <input
            id="home-search"
            name="q"
            type="search"
            placeholder="Try “plumber in Westdene”"
            className="flex-1 min-w-0 bg-charcoal-card/90 border border-white/15 rounded-full px-5 py-4 text-base text-cream placeholder:text-cream/50 focus:outline-none focus:border-lime"
          />
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/list-business" className="btn-primary text-sm">
            List your business
          </Link>
          <Link href="/submit-update" className="btn-secondary text-sm bg-charcoal/60">
            Submit an update
          </Link>
        </div>

        <p className="mt-6 mb-2 text-xs uppercase tracking-wider text-cream/60">
          Browse by area
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {AREAS.map((a) => (
            <Link
              key={a}
              href={`/directory?area=${encodeURIComponent(a)}`}
              className="chip flex-shrink-0 bg-charcoal/60"
            >
              {a}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}