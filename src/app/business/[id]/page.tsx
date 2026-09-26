import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (error || !business) {
    notFound();
  }

  const whatsappLink = business.whatsapp
    ? `https://wa.me/${business.whatsapp.replace(/\D/g, "")}`
    : null;

  const directionsLink = business.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`
    : null;

  return (
    <>
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-xl bg-charcoal-light flex-shrink-0 overflow-hidden relative">
            {business.logo_url ? (
              <Image
                src={business.logo_url}
                alt={business.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cream/30 text-xs">
                No logo
              </div>
            )}
          </div>
          <div>
            {business.featured && (
              <div className="text-xs text-lime mb-1">Featured</div>
            )}
            <h1 className="font-serif text-2xl font-bold">{business.name}</h1>
            <p className="text-cream/60 text-sm">
              {business.category} · {business.area}
            </p>
          </div>
        </div>

        {business.description && (
          <p className="text-cream/80 mb-6">{business.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          {business.phone && (
            <a href={`tel:${business.phone}`} className="btn-secondary text-center">
              Call
            </a>
          )}
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-center"
            >
              WhatsApp
            </a>
          )}
          {business.website && (
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-center"
            >
              Website
            </a>
          )}
          {directionsLink && (
            <a
              href={directionsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-center"
            >
              Directions
            </a>
          )}
        </div>

        <div className="card p-4 flex flex-col gap-3">
          {business.address && (
            <div>
              <div className="text-xs text-cream/50 mb-1">Address</div>
              <div className="text-sm">{business.address}</div>
            </div>
          )}
          {business.hours && (
            <div>
              <div className="text-xs text-cream/50 mb-1">Opening hours</div>
              <div className="text-sm">{business.hours}</div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}