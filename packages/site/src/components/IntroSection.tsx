export function IntroSection() {
  return (
    <section className="section" aria-labelledby="intro-heading" id="introduction">
      <div className="container">
        <h2 className="live__title" id="intro-heading">
          Why biz42
        </h2>
        <p className="live__sub">The bottleneck has shifted from building to aligning.</p>
        <div className="intro__body prose">
          <h3>The problem</h3>
          <p>
            Coding agents can implement features faster than organizations can decide which features
            matter. Without explicit alignment, agents produce features that compile and pass tests
            but serve no business purpose — and every useless feature makes the next useful one
            harder to build.
          </p>
          <p>
            Business goals today live in strategy decks, OKR spreadsheets, risk registers, and
            product roadmaps — separate documents with no shared structure and no cross-references.
            None of them are machine-readable. None of them connect to the codebase.
          </p>

          <h3>The model</h3>
          <p>
            biz42 is a 12-section plain-text model grounded in ISO 9001:2015. It follows an
            outside-in sequence: you start with the world the business operates in and work inward
            to what it does. Each model element is a <code>:::block</code> fence in a Markdown file
            — human-readable prose first, structured metadata as its machine-readable summary. The
            blocks reference each other by id.
          </p>
          <pre>{`Scope
  ├─ Signals ──────┐
  ├─ Expectations ─┴──→ Risks / Opportunities ──→ Objectives ──→ Measures
                                                       │
                                                  Owners · Capabilities
                                                       │
                                                  Products & Services
                                                       │
                                              Evaluation → Improvements`}</pre>

          <h3>Consistency rules — linting for your business</h3>
          <p>
            The CLI enforces a set of rules that keep the model internally consistent. It is
            possible to be in an inconsistent state, but it is probably not desired — and an agent
            can detect and correct it.
          </p>
          <ul>
            <li>
              A signal or expectation that surfaces no risk or opportunity has not been analysed
            </li>
            <li>A risk or opportunity not addressed by any objective is a planning gap</li>
            <li>An objective without a measure cannot be evaluated (ISO 9001 §6.2)</li>
            <li>An objective without an owner has no accountability (ISO 9001 §5.3)</li>
            <li>A product that fulfills no expectation has no modelled rationale</li>
          </ul>

          <h3>Changes as merge requests</h3>
          <p>
            Because the business model lives in plain text and git, every change to the business
            structure becomes a pull request. The diff is the decision record: understandable to
            humans and agents alike. Want to introduce a new product? You need an expectation it
            fulfills, a capability it requires, an objective it contributes to. The validator tells
            you what is missing.
          </p>

          <h3>Connection to arc42</h3>
          <p>
            When a product in the biz42 model is a software product, its{" "}
            <a href="https://arc42.org/" target="_blank" rel="noopener noreferrer">
              arc42
            </a>{" "}
            document is the next level of detail. biz42 Scope constrains arc42 Section 1; biz42
            Expectations map to quality goals and scenarios; biz42 Risks feed arc42 Section 11. The
            traceability chain runs from Expectation → Product → arc42 quality goal → quality
            scenario → architecture decision → building block.
          </p>
        </div>
      </div>
    </section>
  );
}
