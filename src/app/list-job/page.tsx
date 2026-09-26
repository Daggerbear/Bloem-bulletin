"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { AREAS, JOB_TYPES } from "@/lib/constants";

function defaultExpiry() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export default function ListJobPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const job_type = form.get("job_type") as string;
    const company = form.get("company") as string;
    const area = form.get("area") as string;
    const description = form.get("description") as string;
    const contact = form.get("contact") as string;
    const expires_at = form.get("expires_at") as string;

    try {
      const { error: insertError } = await supabase.from("jobs").insert({
        title,
        job_type,
        company,
        area,
        description,
        contact,
        expires_at,
        status: "pending",
      });

      if (insertError) throw insertError;

      router.push("/list-job/thanks");
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
        <h1 className="font-serif text-2xl font-bold mb-2">Post a job or opportunity</h1>
        <p className="text-cream/60 text-sm mb-6">
          Listings are reviewed before going live and expire automatically.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-cream/70 block mb-1">Title *</label>
            <input name="title" required className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Type *</label>
            <select name="job_type" required className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime">
              <option value="">Select a type</option>
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Company / individual</label>
            <input name="company" className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
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
            <textarea name="description" rows={4} className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">How should people apply / contact you? *</label>
            <input name="contact" required placeholder="Phone, email, or WhatsApp" className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime" />
          </div>

          <div>
            <label className="text-sm text-cream/70 block mb-1">Listing expires on</label>
            <input
              name="expires_at"
              type="date"
              defaultValue={defaultExpiry()}
              required
              className="w-full bg-charcoal-card border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lime"
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