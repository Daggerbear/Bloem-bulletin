"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import HeroImageManager from "@/components/HeroImageManager";
import { CATEGORIES, AREAS } from "@/lib/constants";
import type { Session } from "@supabase/supabase-js";

type TableName = "businesses" | "events" | "jobs" | "updates" | "classifieds";
type Tab = TableName | "site";

const TABS: { key: Tab; label: string }[] = [
  { key: "businesses", label: "Businesses" },
  { key: "events", label: "Events" },
  { key: "jobs", label: "Jobs" },
  { key: "updates", label: "Updates" },
  { key: "classifieds", label: "Classifieds" },
  { key: "site", label: "Site" },
];

const BUCKET = "business-images";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

const inputCls =
  "w-full rounded-xl bg-charcoal border border-cream/20 px-3 py-2 text-base text-cream focus:outline-none focus:border-lime";
const labelCls = "block text-xs text-cream/60 mb-1";

// Resize + convert to webp before upload (keeps Supabase egress low)
async function resizeImage(file: File, maxSize: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Image conversion failed"))),
      "image/webp",
      0.8
    )
  );
}

async function uploadImage(
  file: File,
  kind: "logo" | "cover",
  businessId: string
): Promise<string> {
  const blob = await resizeImage(file, kind === "logo" ? 400 : 1200);
  // Unique filename every time: the bucket has no update/delete policy
  const path = `${kind}/${businessId}-${Date.now()}.webp`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "image/webp",
    cacheControl: "2592000", // 30 days
  });
  if (error) throw new Error(`Image upload failed: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function BusinessEditor({
  row,
  onClose,
  onSaved,
}: {
  row: Row;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: row.name ?? "",
    category: row.category ?? "",
    area: row.area ?? "",
    description: row.description ?? "",
    phone: row.phone ?? "",
    whatsapp: row.whatsapp ?? "",
    website: row.website ?? "",
    address: row.address ?? "",
    hours: row.hours ?? "",
    status: row.status ?? "pending",
    featured: !!row.featured,
    featured_until: row.featured_until ?? "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const categoryOptions =
    CATEGORIES.includes(form.category) || !form.category
      ? CATEGORIES
      : [form.category, ...CATEGORIES];

  const areaOptions =
    AREAS.includes(form.area) || !form.area
      ? AREAS
      : [form.area, ...AREAS];

  async function handleSave() {
    setError("");
    if (!form.name.trim() || !form.category.trim() || !form.area.trim()) {
      setError("Name, category and area are required.");
      return;
    }
    setSaving(true);
    try {
      const nullable = (v: string) => (v.trim() === "" ? null : v.trim());
      const payload: Row = {
        name: form.name.trim(),
        category: form.category.trim(),
        area: form.area.trim(),
        description: nullable(form.description),
        phone: nullable(form.phone),
        whatsapp: nullable(form.whatsapp),
        website: nullable(form.website),
        address: nullable(form.address),
        hours: nullable(form.hours),
        status: form.status,
        featured: form.featured,
        featured_until: form.featured_until || null,
      };

      if (logoFile) payload.logo_url = await uploadImage(logoFile, "logo", row.id);
      if (coverFile) payload.cover_url = await uploadImage(coverFile, "cover", row.id);

      const { data, error: dbError } = await supabase
        .from("businesses")
        .update(payload)
        .eq("id", row.id)
        .select();

      if (dbError) throw new Error(dbError.message);
      if (!data || data.length === 0) {
        throw new Error(
          "Nothing was updated. Your login may have expired: sign out and back in."
        );
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 overflow-y-auto">
      <div className="min-h-full flex items-start sm:items-center justify-center p-3">
        <div className="w-full max-w-lg bg-charcoal border border-cream/20 rounded-2xl p-4 my-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-bold">Edit business</h2>
            <button
              onClick={onClose}
              className="text-sm text-cream/60 px-2 py-1"
              aria-label="Close"
            >
              Close
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className={labelCls} htmlFor="b-name">Name *</label>
              <input id="b-name" className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>

            <div>
              <label className={labelCls} htmlFor="b-cat">Category *</label>
              <select id="b-cat" className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">Select category</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls} htmlFor="b-area">Area *</label>
              <select id="b-area" className={inputCls} value={form.area} onChange={(e) => set("area", e.target.value)}>
                <option value="">Select area</option>
                {areaOptions.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls} htmlFor="b-desc">Description</label>
              <textarea id="b-desc" rows={4} className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="b-phone">Phone</label>
                <input id="b-phone" type="tel" className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div>
                <label className={labelCls} htmlFor="b-wa">WhatsApp</label>
                <input id="b-wa" type="tel" className={inputCls} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
              </div>
            </div>

            <div>
              <label className={labelCls} htmlFor="b-web">Website</label>
              <input id="b-web" type="url" className={inputCls} value={form.website} onChange={(e) => set("website", e.target.value)} />
            </div>

            <div>
              <label className={labelCls} htmlFor="b-addr">Address</label>
              <input id="b-addr" className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>

            <div>
              <label className={labelCls} htmlFor="b-hours">Opening hours</label>
              <textarea id="b-hours" rows={2} className={inputCls} value={form.hours} onChange={(e) => set("hours", e.target.value)} />
            </div>

            <div>
              <label className={labelCls}>Logo</label>
              {row.logo_url && !logoFile && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.logo_url} alt="Current logo" loading="lazy" className="h-16 w-16 rounded-xl object-cover mb-2" />
              )}
              <input type="file" accept="image/*" className="text-sm text-cream/70" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
            </div>

            <div>
              <label className={labelCls}>Cover image</label>
              {row.cover_url && !coverFile && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.cover_url} alt="Current cover" loading="lazy" className="h-24 w-full rounded-xl object-cover mb-2" />
              )}
              <input type="file" accept="image/*" className="text-sm text-cream/70" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="b-status">Status</label>
                <select id="b-status" className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="b-until">Featured until</label>
                <input id="b-until" type="date" className={inputCls} value={form.featured_until} onChange={(e) => set("featured_until", e.target.value)} />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-5 w-5" />
              Featured listing
            </label>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm !px-4 !py-2 disabled:opacity-60">
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button onClick={onClose} disabled={saving} className="btn-secondary text-sm !px-4 !py-2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("businesses");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckedAuth(true);
      if (!data.session) router.push("/admin/login");
    });
  }, [router]);

  const loadRows = useCallback(async () => {
    if (activeTab === "site") {
      setRows([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from(activeTab)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setActionError(error.message);
    setRows(data ?? []);
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    if (session) loadRows();
  }, [session, loadRows]);

  async function updateStatus(id: string, status: string) {
    if (activeTab === "site") return;
    setActionError("");
    const { error } = await supabase.from(activeTab).update({ status }).eq("id", id);
    if (error) setActionError(error.message);
    loadRows();
  }

  async function toggleFeatured(id: string, current: boolean) {
    setActionError("");
    const { error } = await supabase.from("businesses").update({ featured: !current }).eq("id", id);
    if (error) setActionError(error.message);
    loadRows();
  }

  async function handleDelete(id: string, name: string) {
    if (activeTab === "site") return;
    if (!confirm(`Delete "${name}" permanently? This can't be undone.`)) return;
    setActionError("");
    const { error } = await supabase.from(activeTab).delete().eq("id", id);
    if (error) setActionError(error.message);
    loadRows();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  if (!checkedAuth) return null;
  if (!session) return null;

  return (
    <main className="min-h-screen bg-charcoal text-cream px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-xl font-bold">Admin</h1>
        <button onClick={handleSignOut} className="btn-secondary text-sm !px-4 !py-2">
          Sign out
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setActionError("");
              setActiveTab(t.key);
            }}
            className={`text-sm px-3 py-2 rounded-full flex-shrink-0 ${
              activeTab === t.key ? "bg-lime text-charcoal" : "card"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {actionError && <p className="text-sm text-red-400 mb-3">{actionError}</p>}

      {activeTab === "site" && <HeroImageManager />}

      {activeTab !== "site" && loading && <p className="text-cream/50">Loading...</p>}

      {activeTab !== "site" && !loading && rows.length === 0 && (
        <p className="text-cream/50">No {activeTab} yet.</p>
      )}

      {activeTab !== "site" && (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.id} className="card p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-semibold">{row.name || row.title}</div>
                  {row.report_count > 0 && <div className="text-xs text-red-400">Reported {row.report_count}x</div>}
                  <div className="text-cream/50 text-xs">
                    Status: <span className={row.status === "approved" ? "text-lime" : row.status === "rejected" ? "text-red-400" : "text-cream/70"}>{row.status}</span>
                  </div>
                </div>
                {activeTab === "businesses" && row.featured && (
                  <span className="text-xs text-lime">Featured</span>
                )}
              </div>

              {row.description && (
                <p className="text-cream/70 text-sm mb-3 line-clamp-2">{row.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {activeTab === "businesses" && (
                  <button
                    onClick={() => setEditing(row)}
                    className="btn-primary text-sm !px-3 !py-2"
                  >
                    Edit
                  </button>
                )}
                {row.status !== "approved" && (
                  <button
                    onClick={() => updateStatus(row.id, "approved")}
                    className="btn-primary text-sm !px-3 !py-2"
                  >
                    Approve
                  </button>
                )}
                {row.status !== "rejected" && (
                  <button
                    onClick={() => updateStatus(row.id, "rejected")}
                    className="btn-secondary text-sm !px-3 !py-2"
                  >
                    Reject
                  </button>
                )}
                {row.status !== "pending" && (
                  <button
                    onClick={() => updateStatus(row.id, "pending")}
                    className="btn-secondary text-sm !px-3 !py-2"
                  >
                    Back to pending
                  </button>
                )}
                {activeTab === "businesses" && (
                  <button
                    onClick={() => toggleFeatured(row.id, row.featured)}
                    className="btn-secondary text-sm !px-3 !py-2"
                  >
                    {row.featured ? "Unfeature" : "Make Featured"}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(row.id, row.name || row.title)}
                  className="text-sm !px-3 !py-2 rounded-full border border-red-400/40 text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <BusinessEditor
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={loadRows}
        />
      )}
    </main>
  );
}