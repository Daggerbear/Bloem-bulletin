import Link from "next/link";
import Image from "next/image";

type Business = {
  id: string;
  name: string;
  category: string;
  area: string;
  logo_url: string | null;
  featured: boolean;
};

export default function BusinessCard({ business }: { business: Business }) {
  return (
    <Link href={`/business/${business.id}`} className="card p-4 flex gap-3 items-center">
      <div className="w-12 h-12 rounded-lg bg-charcoal-light flex-shrink-0 overflow-hidden relative">
        {business.logo_url ? (
          <Image
            src={business.logo_url}
            alt={business.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cream/30 text-xs">
            No logo
          </div>
        )}
      </div>
      <div className="min-w-0">
        {business.featured && (
          <div className="text-xs text-lime mb-0.5">Featured</div>
        )}
        <div className="font-semibold truncate">{business.name}</div>
        <div className="text-cream/60 text-sm truncate">
          {business.category} · {business.area}
        </div>
      </div>
    </Link>
  );
}