const NUMBERS = [
  { label: "Police", number: "10111" },
  { label: "Ambulance", number: "10177" },
  { label: "Any cellphone", number: "112" },
];

export default function EmergencyStrip() {
  return (
    <section
      aria-labelledby="emergency-heading"
      className="max-w-5xl mx-auto px-4 py-6"
    >
      <div className="card p-4">
        <h2 id="emergency-heading" className="font-semibold">
          Emergency numbers
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {NUMBERS.map((n) => (
            <a key={n.number} href={`tel:${n.number}`} className="chip">
              {n.label} · <span className="font-semibold ml-1">{n.number}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}