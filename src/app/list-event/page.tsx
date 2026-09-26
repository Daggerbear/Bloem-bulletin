"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { AREAS } from "@/lib/constants";
import { compressImage } from "@/lib/imageCompression";

export default function ListEventPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const description = form.get("description") as string;
    const event_date = form.get("event_date") as string;
    const event_time = form.get("event_time") as string;
    const venue = form.get("venue") as string;
    const area = form.get("area") as string;
    const organiser = form.get("organiser") as string;
    const organiser_contact = form.get("organiser_contact") as string;

    let image_url: string | null = null;

    try {
      if (imageFile) {
        const compressed = await compressImage(imageFile, 1200, 0.8);
        const path = `${crypto.randomUUID()}.webp`;
        const { error: uploadError } = await supabase.storage
          .from("business-images")
          .upload(path, compressed, { cacheControl: "31536000", contentType: "image/webp" });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("business-images").getPublicUrl(path);
        image_url = data.publicUrl;
      }

      const { error: insertError } = await supabase.from("events").insert({
        title,
        description,
        event_date,
        event_time,
        venue,
        area,
        organiser,
        organiser_contact,
        image_url,
        status: "pending",
      });

      if (insertError) throw insertError;

      router.push("/list-event/thanks");
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      setError(`Error: ${message}`);
      setSubmitting(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-serif text-2xl font-bold mb-2">Submit an event</h1>
        <p className="text-cream/60 text-sm mb-6">
          Events are reviewed before appearing on What&apos;s On.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-cream/70 block mb-1">Event title *</label>
            <input name="title" required className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Description</label>
            <textarea name="description" rows={3} className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Date *</label>
            <input name="event_date" type="date" required className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Time</label>
            <input name="event_time" placeholder="e.g. 6pm" className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Venue *</label>
            <input name="venue" required className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Area *</label>
            <select name="area" required className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime">
              <option value="">Select an area</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Organiser</label>
            <input name="organiser" className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Organiser contact</label>
            <input name="organiser_contact" className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Event image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-cream/70"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary mt-2 disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit for review"}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}