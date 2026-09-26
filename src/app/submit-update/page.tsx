"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { AREAS, UPDATE_CATEGORIES } from "@/lib/constants";

export default function SubmitUpdatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const category = form.get("category") as string;
    const title = form.get("title") as string;
    const description = form.get("description") as string;
    const area = form.get("area") as string;
    const contact = form.get("contact") as string;
    const name = form.get("name") as string;

    try {
      const { error: insertError } = await supabase.from("updates").insert({
        category,
        title,
        description,
        area,
        contact,
        name,
        status: "pending",
      });

      if (insertError) throw insertError;

      router.push("/submit-update/thanks");
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
        <h1 className="font-serif text-2xl font-bold mb-2">Submit a community update</h1>
        <p className="text-cream/60 text-sm mb-6">
          Notices, lost & found, community news and more. Reviewed before it
          goes live — no anonymous posting.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-cream/70 block mb-1">Category *</label>
            <select name="category" required className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime">
              <option value="">Select a category</option>
              {UPDATE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Title *</label>
            <input name="title" required className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Details *</label>
            <textarea name="description" rows={4} required className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Area</label>
            <select name="area" className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime">
              <option value="">Not area-specific</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Your name *</label>
            <input name="name" required className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Contact (optional, shown publicly if provided)</label>
            <input name="contact" className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
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