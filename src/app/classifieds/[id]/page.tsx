import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ReportButton from "@/components/ReportButton";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/classifieds";

export const dynamic = "force-dynamic";

export default async function ClassifiedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Johannesburg" });

  const { data: item, error } = await supabase
    .from("classifieds")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .gte("expires_at", today)
    .single();

  if (error || !item) {
    notFound();
  }

  const images: string[] = item.image_urls ?? [];
  const waText = encodeURIComponent(
    `Hi, I saw your listing "${item.title}" on Bloem Bulletin.`,
  );
  const meta = [item.category, item.condition, item.area].filter(Boolean).join(" · ");
  const listed = new Date(item.created_at).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  });

  return (
    <>
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-xs text-lime mb-2">{item.listing_type}</div>
        <h1 className="font-serif text-2xl font-bold mb-1">{item.title}</h1>
        <p className="text-xl mb-1">{formatPrice(item.price, item.listing_type)}</p>
        <p className="text-cream/60 text-sm mb-4">
          {meta} · Listed {listed}
        </p>

        {images.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            {images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={`${item.title}, photo ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="w-full rounded-xl border border-white/10 object-cover max-h-[28rem]"
              />
            ))}
          </div>
        )}

        {item.description && (
          <p className="text-cream/80 mb-6 whitespace-pre-line">{item.description}</p>
        )}

        <div className="card p-4 mb-4">
          <div className="text-xs text-cream/50 mb-1">
            {item.listing_type === "Wanted" ? "Posted by" : "Seller"}
          </div>
          <div className="font-semibold mb-3">{item.contact_name || "Bloem Bulletin member"}</div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://wa.me/${item.whatsapp}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm"
            >
              WhatsApp
            </a>
            <a href={`tel:+${item.whatsapp}`} className="btn-secondary text-sm">
              Call
            </a>
          </div>
        </div>

        <div className="card p-4 text-sm text-cream/70 mb-4">
          <div className="font-semibold text-cream mb-1">Stay safe</div>
          Meet in a public place, check the item before you pay, and never pay in advance.
          Bloem Bulletin doesn&apos;t handle payments, deliveries or disputes.
        </div>

        <ReportButton id={item.id} />
      </main>
      <Footer />
    </>
  );
}