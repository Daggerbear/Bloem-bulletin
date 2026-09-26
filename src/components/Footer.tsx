export default function Footer() {
  return (
    <footer className="max-w-5xl mx-auto px-4 py-10 mt-6 border-t border-white/5">
      <p className="text-cream/50 text-sm">
        Bloem Bulletin is an independent community and business discovery
        platform for Bloemfontein. It is not affiliated with any municipality,
        government body or news organisation.
      </p>
      <p className="text-cream/30 text-xs mt-4">
        © {new Date().getFullYear()} Bloem Bulletin
      </p>
    </footer>
  );
}