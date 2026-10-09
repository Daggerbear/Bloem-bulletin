import Link from "next/link";

const PROMPTS = [
  "Find a plumber",
  "What's on this weekend?",
  "Part-time jobs",
  "Emergency numbers",
];

export default function LeratoCard() {
  return (
    <section
      aria-labelledby="lerato-heading"
      className="max-w-5xl mx-auto px-4 py-4"
    >
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="w-11 h-11 shrink-0 rounded-full bg-lime text-charcoal flex items-center justify-center font-serif text-lg font-bold"
          >
            L
          </div>
          <div>
            <h2 id="lerato-heading" className="font-semibold">
              Ask Lerato
            </h2>
            <p className="text-sm text-cream/60">
              Not sure where to look? She knows Bloem.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PROMPTS.map((p) => (
            <Link
              key={p}
              href={`/lerato?q=${encodeURIComponent(p)}`}
              className="chip"
            >
              {p}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}