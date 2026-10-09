"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Storage bucket the hero image is uploaded to. Set this to your real bucket name
// (Supabase dashboard > Storage). Files go into a "hero/" folder inside it.
const BUCKET = "business-images";
const MAX_WIDTH = 1600;
const CACHE_SECONDS = "2592000"; // 30 days

async function resizeToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process the image on this device.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Couldn't compress the image."))),
      "image/webp",
      0.82,
    );
  });
}

export default function HeroImageManager() {
  const [current, setCurrent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCurrent() {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "hero_image_url")
      .maybeSingle();
    setCurrent(data?.value ?? null);
  }

  useEffect(() => {
    loadCurrent();
  }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMessage("");
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("That image is over 15MB. Pick a smaller one.");
      return;
    }

    setBusy(true);
    try {
      const blob = await resizeToWebp(file);
      const path = `hero/hero-${Date.now()}.webp`;

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, {
        cacheControl: CACHE_SECONDS,
        contentType: "image/webp",
        upsert: false,
      });
      if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

      const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

      const { error: setErr } = await supabase
        .from("site_settings")
        .upsert({ key: "hero_image_url", value: url, updated_at: new Date().toISOString() });
      if (setErr) throw new Error(`Saved the file but not the setting: ${setErr.message}`);

      setCurrent(url);
      setMessage(`Hero image updated (${Math.round(blob.size / 1024)}KB). The homepage shows it now.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (!confirm("Remove the hero image? The homepage goes back to the plain background.")) return;
    setBusy(true);
    setMessage("");
    setError("");
    const { error: delErr } = await supabase
      .from("site_settings")
      .delete()
      .eq("key", "hero_image_url");
    setBusy(false);
    if (delErr) {
      setError(`Couldn't remove it: ${delErr.message}`);
      return;
    }
    setCurrent(null);
    setMessage("Hero image removed.");
  }

  return (
    <section className="card p-4 flex flex-col gap-4">
      <div>
        <h2 className="font-semibold">Homepage hero image</h2>
        <p className="text-cream/60 text-sm mt-1">
          Wide, landscape photos work best. It&apos;s resized to 1600px wide on your phone and
          saved with a 30-day cache. Only use images you own or have permission to use.
        </p>
      </div>

      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current}
          alt="Current hero"
          className="w-full aspect-video object-cover rounded-xl border border-white/10"
        />
      ) : (
        <p className="text-cream/50 text-sm">No hero image set. The homepage shows the plain lime glow.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <label
          className={`btn-primary text-sm !px-4 !py-2 cursor-pointer ${busy ? "opacity-50 pointer-events-none" : ""}`}
        >
          {busy ? "Working…" : current ? "Replace image" : "Upload image"}
          <input type="file" accept="image/*" onChange={handleFile} disabled={busy} className="sr-only" />
        </label>
        {current && (
          <button
            onClick={handleRemove}
            disabled={busy}
            className="btn-secondary text-sm !px-4 !py-2 disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>

      <div aria-live="polite">
        {message && <p className="text-lime text-sm">{message}</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </section>
  );
}