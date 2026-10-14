"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { AREAS } from "@/lib/constants";
import {
  CLASSIFIED_CATEGORIES,
  CLASSIFIED_TYPES,
  CONDITIONS,
  IMAGE_BUCKET,
  MAX_PHOTOS,
  normalizeZaPhone,
  parsePrice,
} from "@/lib/classifieds";
import { resizeToWebp } from "@/lib/image";

const input =
  "w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime";

function expiryDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export default function ListClassifiedPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState<string>("For sale");
  const [files, setFiles] = useState<File[]>([]);

  function addPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []).filter((f: File) => f.type.startsWith("image/"));
    e.target.value = "";
    setFiles((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);

    // Honeypot: real people never fill this in.
    if ((form.get("website") as string)?.trim()) {
      router.push("/list-classified/thanks");
      return;
    }

    const whatsapp = normalizeZaPhone((form.get("whatsapp") as string) ?? "");
    if (!whatsapp) {
      setError("Enter a valid South African WhatsApp number, e.g. 082 123 4567.");
      return;
    }

    const priceRaw = ((form.get("price") as string) ?? "").trim();
    const price = type === "Free" || !priceRaw ? null : parsePrice(priceRaw);
    if (priceRaw && type !== "Free" && price === null) {
      setError("That price doesn't look right. Use numbers only, e.g. 1500.");
      return;
    }

    setSubmitting(true);
    try {
      const image_urls: string[] = [];
      for (const file of files) {
        const blob = await resizeToWebp(file, 1200, 0.8);
        const path = `classifieds/${crypto.randomUUID()}.webp`;
        const { error: upErr } = await supabase.storage.from(IMAGE_BUCKET).upload(path, blob, {
          cacheControl: "2592000",
          contentType: "image/webp",
          upsert: false,
        });
        if (upErr) throw new Error(`Photo upload failed: ${upErr.message}`);
        image_urls.push(supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl);
      }

      const { error: insertError } = await supabase.from("classifieds").insert({
        listing_type: type,
        category: form.get("category"),
        title: (form.get("title") as string).trim(),
        description: ((form.get("description") as string) ?? "").trim() || null,
        price,
        condition: (form.get("condition") as string) || null,
        area: form.get("area"),
        contact_name: ((form.get("contact_name") as string) ?? "").trim() || null,
        whatsapp,
        image_urls,
        expires_at: expiryDate(),
        status: "pending",
      });
      if (insertError) throw insertError;

      router.push("/list-classified/thanks");
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
        <h1 className="font-serif text-2xl font-bold mb-2">Post a classified</h1>
        <p className="text-cream/60 text-sm mb-6">
          Free. Listings are reviewed before going live and expire after 30 days.
          Bloem Bulletin doesn&apos;t handle payments or deliveries.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Honeypot */}
          <div className="hidden" aria-hidden="true">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div>
            <label htmlFor="c-type" className="text-sm text-cream/70 block mb-1">I want to *</label>
            <select
              id="c-type"
              name="listing_type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={input}
            >
              {CLASSIFIED_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="c-title" className="text-sm text-cream/70 block mb-1">Title *</label>
            <input id="c-title" name="title" required minLength={3} maxLength={100} className={input} />
          </div>

          <div>
            <label htmlFor="c-cat" className="text-sm text-cream/70 block mb-1">Category *</label>
            <select id="c-cat" name="category" required className={input}>
              <option value="">Select a category</option>
              {CLASSIFIED_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {type !== "Free" && (
            <div>
              <label htmlFor="c-price" className="text-sm text-cream/70 block mb-1">
                {type === "Wanted" ? "Budget (R, optional)" : "Price (R, optional)"}
              </label>
              <input
                id="c-price"
                name="price"
                inputMode="decimal"
                placeholder="e.g. 1500"
                className={input}
              />
            </div>
          )}

          <div>
            <label htmlFor="c-cond" className="text-sm text-cream/70 block mb-1">Condition</label>
            <select id="c-cond" name="condition" className={input}>
              <option value="">Not specified</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="c-area" className="text-sm text-cream/70 block mb-1">Area *</label>
            <select id="c-area" name="area" required className={input}>
              <option value="">Select an area</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="c-desc" className="text-sm text-cream/70 block mb-1">Description</label>
            <textarea id="c-desc" name="description" rows={4} maxLength={2000} className={input} />
          </div>

          <div>
            <span className="text-sm text-cream/70 block mb-1">
              Photos (up to {MAX_PHOTOS})
            </span>
            {files.length > 0 && (
              <div className="flex gap-2 mb-2">
                {files.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(f)}
                      alt={`Photo ${i + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                      aria-label={`Remove photo ${i + 1}`}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-charcoal border border-white/20 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {files.length < MAX_PHOTOS && (
              <label className="btn-secondary text-sm inline-block cursor-pointer">
                Add photo
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={addPhotos}
                  className="sr-only"
                />
              </label>
            )}
            <p className="text-xs text-cream/50 mt-1">
              Only upload photos you took or have permission to use.
            </p>
          </div>

          <div>
            <label htmlFor="c-name" className="text-sm text-cream/70 block mb-1">Your first name</label>
            <input id="c-name" name="contact_name" maxLength={40} className={input} />
          </div>

          <div>
            <label htmlFor="c-wa" className="text-sm text-cream/70 block mb-1">WhatsApp number *</label>
            <input
              id="c-wa"
              name="whatsapp"
              required
              inputMode="tel"
              placeholder="082 123 4567"
              className={input}
            />
          </div>

          <label className="flex items-start gap-3 text-sm text-cream/80">
            <input type="checkbox" required className="mt-1 w-5 h-5 accent-[#B4E61D]" />
            <span>
              I agree my WhatsApp number will be shown publicly on this listing. *
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-cream/80">
            <input type="checkbox" required className="mt-1 w-5 h-5 accent-[#B4E61D]" />
            <span>
              This listing is not for live animals, weapons, drugs, or stolen or counterfeit goods. *
            </span>
          </label>

          {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary mt-2 disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit for review"}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}