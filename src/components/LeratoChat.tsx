"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Card = {
  type: "business" | "event" | "job" | "emergency" | "link";
  title: string;
  subtitle?: string;
  href: string;
};

type Msg = { id: number; role: "user" | "lerato"; text: string; cards?: Card[] };

const STARTERS = [
  "Find a plumber",
  "What's on this weekend?",
  "Part-time jobs",
  "Emergency numbers",
];

export default function LeratoChat() {
  const params = useSearchParams();
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 0,
      role: "lerato",
      text: "Hi, I'm Lerato. Ask me about businesses, events, jobs or emergency numbers in Bloem.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  async function send(raw: string) {
    const text = raw.trim().slice(0, 300);
    if (!text || loading) return;

    setMessages((m) => [...m, { id: nextId.current++, role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/lerato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json().catch(() => null);
      const reply =
        data?.reply ??
        (res.ok ? "Hmm, I got my wires crossed. Try again?" : "Something went wrong. Try again in a moment.");
      setMessages((m) => [
        ...m,
        { id: nextId.current++, role: "lerato", text: reply, cards: data?.cards ?? [] },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: nextId.current++,
          role: "lerato",
          text: "I couldn't reach the server. Check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const q = params.get("q");
    if (q && !started.current) {
      started.current = true;
      send(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (messages.length > 1 || loading) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, loading]);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-2">
      <header className="flex items-center gap-3 mb-4">
        <div
          aria-hidden="true"
          className="w-11 h-11 shrink-0 rounded-full bg-lime text-charcoal flex items-center justify-center font-serif text-lg font-bold"
        >
          L
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight">Ask Lerato</h1>
          <p className="text-sm text-cream/60">
            Your Bloem receptionist. She searches listings on Bloem Bulletin.
          </p>
        </div>
      </header>

      <div role="log" aria-live="polite" className="flex flex-col gap-3 min-h-[40vh]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col gap-2 ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-[15px] leading-snug ${
                m.role === "user"
                  ? "bg-lime text-charcoal rounded-br-md"
                  : "bg-charcoal-card border border-white/5 rounded-bl-md"
              }`}
            >
              {m.text}
            </div>
            {m.cards && m.cards.length > 0 && (
              <div className="flex flex-col gap-2 w-full max-w-[85%]">
                {m.cards.map((c, i) => (
                  <Link
                    key={`${m.id}-${i}`}
                    href={c.href}
                    className={`card block p-3 hover:border-lime/40 transition-colors ${
                      c.type === "link" ? "border-lime/30" : ""
                    }`}
                  >
                    <div className="font-semibold">{c.title}</div>
                    {c.subtitle && (
                      <div className="text-sm text-cream/60 truncate">{c.subtitle}</div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="items-start flex">
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-charcoal-card border border-white/5 text-sm text-cream/60">
              Lerato is looking…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length === 1 && !loading && (
        <div className="mt-4 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button key={s} type="button" onClick={() => send(s)} className="chip">
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-[calc(56px+env(safe-area-inset-bottom))] sm:bottom-0 bg-charcoal py-3 mt-4 flex gap-2"
      >
        <label htmlFor="lerato-input" className="sr-only">
          Message Lerato
        </label>
        <input
          id="lerato-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={300}
          placeholder="Ask about Bloem…"
          autoComplete="off"
          className="flex-1 min-w-0 bg-charcoal-card border border-white/10 rounded-full px-5 py-3 text-cream placeholder:text-cream/40 focus:outline-none focus:border-lime"
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary disabled:opacity-50">
          Send
        </button>
      </form>

      <p className="text-xs text-cream/40 pb-4">
        Lerato is an AI helper, not an official or municipal service. She only shows what is listed on
        Bloem Bulletin, so always check details with the business.
      </p>
    </div>
  );
}