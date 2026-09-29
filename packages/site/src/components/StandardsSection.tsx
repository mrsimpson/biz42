/** Landing page: the standards biz42 builds on. */
export function StandardsSection() {
  return (
    <section className="section" aria-labelledby="standards-heading" id="standards">
      <div className="container">
        <h2 className="live__title" id="standards-heading">
          Built on what you already know
        </h2>
        <p className="live__sub">
          No new vocabulary for the business, no new format for the tools.
        </p>
        <div className="why__grid">
          <div className="why__card">
            <h3>ISO 9001 vocabulary</h3>
            <p>
              Context, interested parties, risks and opportunities, objectives, improvement — the
              concepts come from the most widely adopted management system standard. Business
              readers recognise them immediately.
            </p>
          </div>
          <div className="why__card" id="arc42">
            <h3>Connected to arc42</h3>
            <p>
              When a product is software, its{" "}
              <a href="https://arc42.org/" target="_blank" rel="noopener noreferrer">
                arc42
              </a>{" "}
              document is the next level of detail: expectations become quality goals, risks feed
              the architecture&apos;s risks. One chain from business context to building block —{" "}
              <a href="./docs/" target="_blank" rel="noopener noreferrer">
                see biz42&apos;s own architecture
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
