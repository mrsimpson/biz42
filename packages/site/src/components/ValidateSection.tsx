const VALIDATE_EXAMPLE = `$ biz42 validate

warning W001  docs/biz42/04-risks.biz42.md:11
  Risk 'risk-works-council' is not addressed by any objective
warning W003  docs/biz42/06-objectives.biz42.md:70
  Objective 'obj-privacy-architecture' has no owner assigned
warning W011  docs/biz42/06-objectives.biz42.md:70
  Objective 'obj-privacy-architecture' does not address any risk or opportunity

0 errors, 3 warnings, 0 hints`;

/** Landing page, property 2: the model is checked like code. */
export function ValidateSection() {
  return (
    <section className="section" aria-labelledby="validate-heading" id="validate">
      <div className="container">
        <p className="section__eyebrow">2 · Checked</p>
        <h2 className="live__title" id="validate-heading">
          Linting for your organisation
        </h2>
        <p className="live__sub">Incomplete is allowed. Unnoticed is not.</p>
        <p className="how__lead">
          <code>biz42 validate</code> checks the chain the way a linter checks code: every reference
          resolves, every risk is addressed by an objective, every objective has a measure and an
          owner, every capability serves a product. A model may be incomplete for a while — the
          findings say where, and an agent can close the gaps together with you. Run it with{" "}
          <code>--strict</code> in CI, and the model stays as consistent as the code next to it.
        </p>
        <pre className="gs__snippet how__example">
          <code>{VALIDATE_EXAMPLE}</code>
        </pre>
      </div>
    </section>
  );
}
