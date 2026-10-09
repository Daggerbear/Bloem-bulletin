export type Intent = "emergency" | "events" | "jobs" | "businesses";

export const AREAS = [
  "Universitas",
  "Langenhoven Park",
  "Westdene",
  "Heuwelsig",
  "Bayswater",
  "Fleurdal",
  "Pellissier",
  "Dan Pienaar",
  "Hospital Park",
  "Arboretum",
  "Willows",
  "Woodlands Hills",
  "CBD",
];

const STOP = new Set(
  (
    "the and for with who where how are there some good best please have get can you " +
    "find looking need want any near around bloem bloemfontein show give tell about " +
    "what whats this that from into have has not but all" +
    " job jobs hiring vacancy vacancies part time parttime work" +
    " event events weekend today tonight happening" +
    " emergency urgent"
  ).split(" "),
);

// Everyday words -> a fragment of a directory category name.
const SYNONYMS: Record<string, string> = {
  plumber: "repairs",
  plumbing: "repairs",
  electrician: "repairs",
  handyman: "repairs",
  builder: "repairs",
  repair: "repairs",
  mechanic: "automotive",
  tyre: "automotive",
  car: "automotive",
  hair: "beauty",
  salon: "beauty",
  nail: "beauty",
  barber: "beauty",
  restaurant: "food",
  coffee: "food",
  takeaway: "food",
  tutor: "education",
  lesson: "education",
  school: "education",
  gym: "fitness",
  sport: "fitness",
  lawyer: "professional",
  accountant: "professional",
  vet: "pets",
  dog: "pets",
  hotel: "accommodation",
  guesthouse: "accommodation",
  student: "student",
};

export function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/\b(emergency|police|ambulance|urgent|robbery|hijack|accident|fire)\b/.test(t))
    return "emergency";
  if (/\b(jobs?|hiring|vacanc(y|ies)|part[- ]?time|internships?|learnerships?|looking for work)\b/.test(t))
    return "jobs";
  if (/\b(events?|what'?s on|weekend|tonight|today|markets?|concerts?|festivals?|happening)\b/.test(t))
    return "events";
  return "businesses";
}

export function detectArea(text: string): string | null {
  const t = text.toLowerCase();
  return AREAS.find((a) => new RegExp(`\\b${a.toLowerCase()}\\b`).test(t)) ?? null;
}

// Safe, short search terms (letters/digits only, so they are safe inside a PostgREST filter).
export function keywords(text: string): string[] {
  const area = detectArea(text);
  let t = text.toLowerCase();
  if (area) t = t.replace(area.toLowerCase(), " ");
  const words = t
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map((w) => (w.length > 4 ? w.replace(/s$/, "") : w))
    .slice(0, 4);
  const extra = words.map((w) => SYNONYMS[w]).filter(Boolean) as string[];
  return Array.from(new Set([...words, ...extra]));
}

// Today in Bloemfontein as YYYY-MM-DD.
export function saToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Johannesburg" });
}

// Upcoming weekend (Sat–Sun) as [from, to]. On Sat/Sun it covers what's left of this weekend.
export function weekendRange(todayStr: string): [string, string] {
  const d = new Date(todayStr + "T12:00:00Z");
  const dow = d.getUTCDay(); // 0 = Sunday
  const toSat = dow === 0 ? -1 : 6 - dow;
  const sat = new Date(d.getTime() + toSat * 86400000);
  const sun = new Date(sat.getTime() + 86400000);
  const from = toSat < 0 ? todayStr : sat.toISOString().slice(0, 10);
  return [from, sun.toISOString().slice(0, 10)];
}