import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (error || !event) {
    notFound();
  }

  const directionsLink = event.venue
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue + " " + event.area)}`
    : null;

  return (
    <>
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {event.image_url && (
          <div className="w-full aspect-video rounded-card overflow-hidden relative mb-6 bg-charcoal-light">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              sizes="(max-width: 640px) 100vw, 672px"
              className="object-cover"
            />
          </div>
        )}

        <h1 className="font-serif text-2xl font-bold mb-1">{event.title}</h1>
        <p className="text-lime text-sm mb-4">
          {formatDate(event.event_date)}
          {event.event_time ? ` · ${event.event_time}` : ""}
        </p>

        {event.description && (
          <p className="text-cream/80 mb-6">{event.description}</p>
        )}

        {directionsLink && (
          <a
            href={directionsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block mb-6"
          >
            Get directions
          </a>
        )}

        <div className="card p-4 flex flex-col gap-3">
          <div>
            <div className="text-xs text-cream/50 mb-1">Venue</div>
            <div className="text-sm">{event.venue}, {event.area}</div>
          </div>
          {event.organiser && (
            <div>
              <div className="text-xs text-cream/50 mb-1">Organiser</div>
              <div className="text-sm">{event.organiser}</div>
              {event.organiser_contact && (
                <div className="text-sm text-cream/60">{event.organiser_contact}</div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}