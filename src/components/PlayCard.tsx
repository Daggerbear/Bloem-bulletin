export default function PlayCard() {
  return (
    <section aria-labelledby="play-heading" className="max-w-5xl mx-auto px-4 py-4">
      <a
        href="https://ons-brandfort-bulletin.vercel.app/games"
        target="_blank"
        rel="noopener noreferrer"
        className="card p-4 flex items-center justify-between gap-4 hover:border-lime/40 transition-colors"
      >
        <div>
          <h2 id="play-heading" className="font-semibold">
            Play a game
          </h2>
          <p className="text-sm text-cream/60 mt-1">
            Chess, checkers, Battleship and more at Glitch Cafe. Play friends or go solo.
          </p>
          <p className="text-xs text-cream/40 mt-1">
            Hosted by Ons Brandfort Bulletin. Opens in a new tab.
          </p>
        </div>
        <span aria-hidden="true" className="text-lime text-xl shrink-0">→</span>
      </a>
    </section>
  );
}