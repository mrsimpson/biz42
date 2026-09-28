import summaryShot from "../assets/evolution/01-plan-summary.png";

/** Landing page teaser: business development as reviewed changes to the model. */
export function EvolutionSection() {
  return (
    <section className="section" aria-labelledby="evolution-heading" id="evolution">
      <div className="container evo-teaser">
        <div>
          <h2 className="gs__title" id="evolution-heading">
            A business development plan becomes a pull request
          </h2>
          <p className="evo-row__desc">
            Organisations evolve by decisions, and each one changes the model:
          </p>
          <ul className="evo-teaser__questions">
            <li>Should we reach for this opportunity — and does it really exist?</li>
            <li>Does it fit an objective we have, or do we need a new one?</li>
            <li>Which capabilities do we have to build, and who is accountable?</li>
          </ul>
          <p className="evo-row__desc">
            <code>biz42 diff</code> makes the plan visible: what it adds and changes, chapter by
            chapter — and every decision whose reasoning is missing.
          </p>
          <div className="hero__ctas">
            <a href="./evolution/" className="btn btn--primary">
              See how it works →
            </a>
            <a href="./acme-evolution/" className="btn btn--outline">
              Open a live plan →
            </a>
          </div>
        </div>
        <a href="./evolution/" className="evo-row__zoom" aria-label="See how it works">
          <img
            className="evo-row__image"
            src={summaryShot}
            alt="The changes of a business development plan: new evidence, opportunity, objective, owner and capability"
            loading="lazy"
          />
        </a>
      </div>
    </section>
  );
}
