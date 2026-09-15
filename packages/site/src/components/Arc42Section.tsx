export function Arc42Section() {
  return (
    <section className="section" aria-labelledby="arc42-heading" id="arc42">
      <div className="container">
        <h2 className="live__title" id="arc42-heading">
          Connection to arc42
        </h2>
        <p className="live__sub">
          From business goal to architecture decision — in one traceable chain.
        </p>
        <div className="intro__body prose">
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
          <p>
            The{" "}
            <a
              href="https://www.npmjs.com/package/@doctc/arc42"
              target="_blank"
              rel="noopener noreferrer"
            >
              @doctc/arc42
            </a>{" "}
            CLI brings the same plain-text, git-native approach to architecture documentation.{" "}
            <a href="./docs/" target="_blank" rel="noopener noreferrer">
              See the architecture of biz42 itself
            </a>{" "}
            as a live example.
          </p>
        </div>
      </div>
    </section>
  );
}
