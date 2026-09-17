export function LiveSection() {
  return (
    <section className="section" aria-labelledby="live-heading" id="examples">
      <div className="container">
        <h2 className="live__title" id="live-heading">
          Examples
        </h2>
        <p className="live__sub">
          Real workspaces, built with <code>biz42 build</code> and deployed here.
        </p>
        <div className="live__grid">
          <a
            href="./acme-emergency/"
            className="live-card"
            aria-label="View acme-emergency example workspace"
          >
            <div className="live-card__icon" aria-hidden="true">
              <LayersIcon />
            </div>
            <h3 className="live-card__title">Acme Emergency Example</h3>
            <p className="live-card__desc">
              A complete biz42 model for a fictitious emergency services company. A realistic
              reference for new workspaces.
            </p>
            <span className="live-card__arrow" aria-hidden="true">
              Open →
            </span>
          </a>
          <a
            href="./assistify/"
            className="live-card"
            aria-label="View assistify example workspace"
          >
            <div className="live-card__icon" aria-hidden="true">
              <LayersIcon />
            </div>
            <h3 className="live-card__title">Assistify — Retrospective Analysis</h3>
            <p className="live-card__desc">
              A retrospective biz42 model of an internal startup that was wound down. Built from
              hindsight to show how the framework applies to a real, finished venture.
            </p>
            <span className="live-card__arrow" aria-hidden="true">
              Open →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

function LayersIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
