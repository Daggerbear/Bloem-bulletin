"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, AREAS } from "@/lib/constants";
import { compressImage } from "@/lib/imageCompression";

export default function ListBusinessPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const category = form.get("category") as string;
    const area = form.get("area") as string;
    const description = form.get("description") as string;
    const phone = form.get("phone") as string;
    const whatsapp = form.get("whatsapp") as string;
    const website = form.get("website") as string;
    const address = form.get("address") as string;
    const hours = form.get("hours") as string;

    let logo_url: string | null = null;

    try {
      if (logoFile) {
        const compressed = await compressImage(logoFile, 400, 0.8);
        const path = `${crypto.randomUUID()}.webp`;
        const { error: uploadError } = await supabase.storage
          .from("business-images")
          .upload(path, compressed, { cacheControl: "31536000", contentType: "image/webp" });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("business-images").getPublicUrl(path);
        logo_url = data.publicUrl;
      }

      const { error: insertError } = await supabase.from("businesses").insert({
        name,
        category,
        area,
        description,
        phone,
        whatsapp,
        website,
        address,
        hours,
        logo_url,
        status: "pending",
      });

      if (insertError) throw insertError;

      router.push("/list-business/thanks");
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
        <h1 className="font-serif text-2xl font-bold mb-2">List your business</h1>
        <p className="text-cream/60 text-sm mb-6">
          Free standard listings are reviewed before going live. Featured
          placement is available separately — R150/month or R1500/year.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-cream/70 block mb-1">Business name *</label>
            <input name="name" required className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Category *</label>
            <select name="category" required className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime">
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Area *</label>
            <select name="area" required className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime">
              <option value="">Select an area</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Description</label>
            <textarea name="description" rows={3} className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Phone</label>
            <input name="phone" type="tel" className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">WhatsApp number</label>
            <input name="whatsapp" type="tel" placeholder="27..." className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Website</label>
            <input name="website" type="url" className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Address</label>
            <input name="address" className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Opening hours</label>
            <input name="hours" placeholder="Mon-Fri 8am-5pm" className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
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