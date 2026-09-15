export function GettingStarted() {
  return (
    <section className="section" aria-labelledby="getting-started-heading" id="getting-started">
      <div className="container">
        <header className="gs__header">
          <h2 className="gs__title" id="getting-started-heading">
            Get started
          </h2>
        </header>
        <div className="gs__grid gs__grid--2">
          <div className="gs__card">
            <div className="gs__card-label">Impatient developer</div>
            <h3 className="gs__card-title">Install the skill</h3>
            <p className="gs__card-desc">Make your agent familiar with the biz42 model and CLI.</p>
            <div className="gs__snippet">
              <code>npx skills add docToolchain/biz42</code>
            </div>
            <h3 className="gs__card-title">Model your business with your agent</h3>
            <div className="gs__snippet">
              <code>
                &quot;Make the business context of this project machine readable biz42&quot;
              </code>
            </div>
          </div>
          <div className="gs__card">
            <div className="gs__card-label">AI agent</div>
            <h3 className="gs__card-title">Use the CLI</h3>
            <p className="gs__card-desc">
              Run the CLI directly. <code>--help</code> lists all commands. As agent, ask the
              developer for business context — not everything can be derived from the repo.
            </p>
            <div className="gs__snippet">
              <code>npx @doctc/biz42 --help</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
