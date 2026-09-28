const AGENT_STEPS = [
  { cmd: "npx @biz42/cli guide", desc: "The workflow: which chapter comes when, and why." },
  {
    cmd: "npx @biz42/cli guide chapter 1",
    desc: "One chapter at a time. Ask your human — business context cannot be derived from the repo.",
  },
  { cmd: "npx @biz42/cli explain objective", desc: "The fields of a block type, with tips." },
  { cmd: "npx @biz42/cli validate --strict", desc: "The model is consistent when this exits 0." },
];

export function GettingStarted() {
  return (
    <section className="section" aria-labelledby="getting-started-heading" id="getting-started">
      <div className="container">
        <header className="gs__header">
          <h2 className="gs__title" id="getting-started-heading">
            Get started
          </h2>
          <p className="gs__sub">
            You bring the business knowledge, your agent does the writing. Or, if you are the agent:
            start with the guide.
          </p>
        </header>
        <div className="gs__grid gs__grid--2">
          <div className="gs__card">
            <div className="gs__card-label">For people</div>
            <h3 className="gs__card-title">1. Install the skill</h3>
            <p className="gs__card-desc">
              Give your coding agent the biz42 skill. It knows the model and the CLI.
            </p>
            <div className="gs__snippet">
              <code>npx skills add mrsimpson/biz42</code>
            </div>
            <h3 className="gs__card-title">2. Start the conversation</h3>
            <p className="gs__card-desc">
              The agent interviews you chapter by chapter — starting with the scope and working
              outside-in.
            </p>
            <div className="gs__snippet">
              <code>&quot;Start a biz42 model for [organisation]. Use the guide.&quot;</code>
            </div>
          </div>
          <div className="gs__card">
            <div className="gs__card-label">For AI agents</div>
            <ol className="gs__steps">
              {AGENT_STEPS.map((step) => (
                <li key={step.cmd}>
                  <div className="gs__snippet">
                    <code>{step.cmd}</code>
                  </div>
                  <p className="gs__card-desc">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
