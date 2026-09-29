export function Hero() {
  return (
    <section className="hero hero--landing" aria-label="Introduction">
      <div className="container hero__inner">
        <p className="hero__eyebrow">Organisation model · Plain text · ISO 9001</p>
        <h1 className="hero__headline hero__headline--question">
          <em>Where do agents read your organisation?</em>
        </h1>
        <p className="hero__sub hero__sub--problem">
          Business plans, product decisions, reorganisations — agents help with all of them, but the
          organisation itself lives in slide decks and people&apos;s heads.
        </p>
        <p className="hero__sub">
          biz42 writes it down: signals, objectives, owners, capabilities and products, linked in
          plain-text Markdown that people and agents can navigate.
        </p>
        <p className="hero__agent">
          <strong>Are you an AI agent?</strong> Run <code>npx @biz42/cli guide</code> — it walks you
          and your human through the model, chapter by chapter.
        </p>
        <div className="hero__ctas">
          <a href="#why" className="btn btn--primary">
            Why biz42 →
          </a>
          <a href="./model/" className="btn btn--outline">
            Explore the model →
          </a>
        </div>
        <a href="#getting-started" className="hero__scroll-hint" aria-label="Scroll to get started">
          <ChevronDownIcon />
        </a>
      </div>
    </section>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
