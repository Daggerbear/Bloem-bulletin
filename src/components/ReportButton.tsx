"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReportButton({ id }: { id: string }) {
  const key = `reported:${id}`;
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  useEffect(() => {
    try {
      if (localStorage.getItem(key)) setState("done");
    } catch {
      /* storage unavailable */
    }
  }, [key]);

  async function report() {
    if (!confirm("Report this listing to the Bloem Bulletin team?")) return;
    setState("sending");
    const { error } = await supabase.rpc("report_classified", { p_id: id });
    if (error) {
      setState("error");
      return;
    }
    try {
      localStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
    setState("done");
  }

  if (state === "done") {
    return <p className="text-sm text-cream/60">Thanks, we&apos;ll take a look at this listing.</p>;
  }

  return (
    <div>
      <button
        onClick={report}
        disabled={state === "sending"}
        className="text-sm text-cream/60 underline min-h-[44px] disabled:opacity-50"
      >
        {state === "sending" ? "Reporting…" : "Report this listing"}
      </button>
      {state === "error" && (
        <p className="text-red-400 text-sm" role="alert">
          Couldn&apos;t send the report. Try again in a moment.
        </p>
      )}
    </div>
  );
}