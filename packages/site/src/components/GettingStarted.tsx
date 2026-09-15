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
            <div className="gs__card-label">Impatient strategist</div>
            <h3 className="gs__card-title">Install the skill</h3>
            <p className="gs__card-desc">
              Give your agent the biz42 skill, then let it guide you through the model chapter by
              chapter — starting with scope and working outside-in.
            </p>
            <div className="gs__snippet">
              <code>npx skills add mrsimpson/biz42</code>
            </div>
            <h3 className="gs__card-title">Start the conversation</h3>
            <div className="gs__snippet">
              <code>&quot;Start a biz42 model for [organisation]. Use the guide.&quot;</code>
            </div>
          </div>
          <div className="gs__card">
            <div className="gs__card-label">AI agent</div>
            <h3 className="gs__card-title">Use the guide command</h3>
            <p className="gs__card-desc">
              The <code>guide</code> command is your entry point. It walks each chapter with
              templates and authoring tips. Ask the human questions — business context cannot be
              derived from the repo.
            </p>
            <div className="gs__snippet">
              <code>npx @biz42/cli init template</code>
            </div>
            <div className="gs__snippet">
              <code>npx @biz42/cli guide chapter 1</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
