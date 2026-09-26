export default function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-4 pt-10 pb-8">
      <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
        Your city. <span className="text-lime">In the loop.</span>
      </h1>
      <p className="text-cream/70 mt-3 text-base sm:text-lg max-w-md">
        Find local businesses, events, jobs and community updates across Bloemfontein.
      </p>
      <form className="mt-6 flex gap-2">
        <input
          type="text"
          placeholder="Search businesses, services, events..."
          className="flex-1 bg-charcoal-card border border-white/10 rounded-full px-5 py-3 text-cream placeholder:text-cream/40 focus:outline-none focus:border-lime"
        />
        <button className="btn-primary">Search</button>
      </form>
    </section>
  );
}