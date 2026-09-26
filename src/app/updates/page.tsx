import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  const { data: updates, error } = await supabase
    .from("updates")
    .select("id, category, title, description, area, name, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-serif text-2xl font-bold">Community updates</h1>
          <Link href="/submit-update" className="btn-primary text-sm !px-4 !py-2">
            Submit
          </Link>
        </div>

        {error && <p className="text-cream/50">Couldn&apos;t load updates right now.</p>}

        {!error && updates && updates.length === 0 && (
          <div className="card p-6 text-center text-cream/60">
            No community updates yet.{" "}
            <Link href="/submit-update" className="text-lime">Be the first</Link>.
          </div>
        )}

        {!error && updates && updates.length > 0 && (
          <div className="flex flex-col gap-3">
            {updates.map((u) => (
              <div key={u.id} className="card p-4">
                <div className="text-xs text-lime mb-1">
                  {u.category}{u.area ? ` · ${u.area}` : ""}
                </div>
                <div className="font-semibold mb-1">{u.title}</div>
                <p className="text-cream/70 text-sm whitespace-pre-line">{u.description}</p>
                <div className="text-cream/40 text-xs mt-2">— {u.name}</div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}