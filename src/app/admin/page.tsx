"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

type TableName = "businesses" | "events" | "jobs" | "updates";

const TABS: { key: TableName; label: string }[] = [
  { key: "businesses", label: "Businesses" },
  { key: "events", label: "Events" },
  { key: "jobs", label: "Jobs" },
  { key: "updates", label: "Updates" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<TableName>("businesses");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckedAuth(true);
      if (!data.session) router.push("/admin/login");
    });
  }, [router]);

  const loadRows = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from(activeTab)
      .select("*")
      .order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    if (session) loadRows();
  }, [session, loadRows]);

  async function updateStatus(id: string, status: string) {
    await supabase.from(activeTab).update({ status }).eq("id", id);
    loadRows();
  }

  async function toggleFeatured(id: string, current: boolean) {
    await supabase.from("businesses").update({ featured: !current }).eq("id", id);
    loadRows();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}" permanently? This can't be undone.`)) return;
    await supabase.from(activeTab).delete().eq("id", id);
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
            onClick={() => setActiveTab(t.key)}
            className={`text-sm px-3 py-2 rounded-full flex-shrink-0 ${
              activeTab === t.key ? "bg-lime text-charcoal" : "card"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-cream/50">Loading...</p>}

      {!loading && rows.length === 0 && (
        <p className="text-cream/50">No {activeTab} yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.id} className="card p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="font-semibold">{row.name || row.title}</div>
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
    </main>
  );
}