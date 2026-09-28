import { MetamodelDiagram } from "./MetamodelDiagram";

const BLOCK_EXAMPLE = `Win three regional transport operators as paying pilot customers of a
hosted ACME service, without taking people off the internal rollout.

:::objective
id: obj-operator-pilots
title: Three Paying Operator Pilots Live
addresses: opp-operator-offering
measured-by: measure-operator-pilots
owner: owner-business-development
requires: capability-multi-tenant-operations
:::`;

/** Landing page: how the model works, with the meta-model at a glance. */
export function ModelSection() {
  return (
    <section className="section" aria-labelledby="model-heading" id="model">
      <div className="container container--wide">
        <h2 className="live__title" id="model-heading">
          How it works
        </h2>
        <p className="live__sub">Twelve element types. One traceable chain. ISO 9001 vocabulary.</p>
        <p className="how__lead">
          You describe the business outside-in: first the world it operates in, then what it commits
          to, then what it does. Each element is a <code>:::block</code> in a Markdown file — prose
          for people first, a few fields for machines. The fields reference other elements by id,
          and <code>biz42 validate</code> checks the chain like a linter: a risk no objective
          addresses, an objective without a measure or an owner.
        </p>
        <MetamodelDiagram hrefBase="./model/" />
        <div className="how__more">
          <pre className="gs__snippet how__example">
            <code>{BLOCK_EXAMPLE}</code>
          </pre>
          <div className="hero__ctas">
            <a href="./model/" className="btn btn--primary">
              The model in detail →
            </a>
            <a href="./acme-emergency/" className="btn btn--outline">
              See a complete model →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
