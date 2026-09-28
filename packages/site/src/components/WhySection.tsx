/** Landing page: the motivation, right after the hero. */
export function WhySection() {
  return (
    <section className="section" aria-labelledby="why-heading" id="why">
      <div className="container">
        <h2 className="live__title" id="why-heading">
          Why biz42
        </h2>
        <p className="live__sub">The bottleneck has shifted from building to aligning.</p>
        <div className="why__grid">
          <div className="why__card">
            <h3>The problem</h3>
            <p>
              Coding agents implement features faster than organisations decide which features
              matter. Without explicit alignment, they ship features that compile and pass tests but
              serve no business purpose — and every useless feature makes the next useful one harder
              to build.
            </p>
            <p>
              The reasons behind the work live in strategy decks, OKR sheets, risk registers and
              roadmaps: separate documents, no shared structure, no links between them. None of it
              is machine-readable. None of it connects to the codebase.
            </p>
          </div>
          <div className="why__card why__card--answer">
            <h3>The answer</h3>
            <p>
              biz42 puts the business model next to the code, as one outside-in chain: from the
              signals and expectations a business faces, through the objectives it commits to, to
              the capabilities and products that deliver them.
            </p>
            <p>
              Every feature traces back to an objective. An agent can check that justification
              before it builds — and flag when it is missing. And because the model is plain text in
              Git, every change to the business is a reviewable pull request.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
