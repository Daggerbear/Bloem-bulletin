export const CLASSIFIED_TYPES = ["For sale", "Wanted", "Free"] as const;

export const CLASSIFIED_CATEGORIES = [
  "Electronics",
  "Home & Furniture",
  "Clothing & Accessories",
  "Student Items",
  "Vehicles & Parts",
  "Tools & Equipment",
  "Baby & Kids",
  "Sports & Hobbies",
  "Other",
] as const;

export const CONDITIONS = ["New", "Like new", "Used", "For parts"] as const;

export const MAX_PHOTOS = 3;
export const IMAGE_BUCKET = "business-images";

// South African number -> "27xxxxxxxxx" (digits only) or null if it doesn't look valid.
export function normalizeZaPhone(input: string): string | null {
  let d = input.replace(/[\s\-().]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("00")) d = d.slice(2);
  if (!/^\d+$/.test(d)) return null;
  if (d.startsWith("0")) d = "27" + d.slice(1);
  return /^27\d{9}$/.test(d) ? d : null;
}

// "R1 200", "1,200.50" -> number, or null if empty/invalid.
export function parsePrice(input: string): number | null {
  const cleaned = input.replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0 || n > 10_000_000) return null;
  return Math.round(n * 100) / 100;
}

export function formatPrice(price: number | null | undefined, type: string): string {
  if (type === "Free") return "Free";
  if (price === null || price === undefined) {
    return type === "Wanted" ? "Budget open" : "Ask for price";
  }
  const n = Number(price);
  const text = Number.isInteger(n)
    ? n.toLocaleString("en-ZA")
    : n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `R${text}`;
}