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

const GET_EXAMPLE = `$ biz42 get obj-operator-pilots

objective: obj-operator-pilots
title: Three Paying Operator Pilots Live
file:  docs/biz42/06-objectives.biz42.md:211

References:
  → opp-operator-offering  (opportunity: Offer ACME as a Hosted Service to Peer Operators)
  → measure-operator-pilots  (measure: Operator Pilots Live)
  → owner-business-development  (owner: Head of Business Development)
  → capability-multi-tenant-operations  (capability: Multi-Tenant Operations)`;

/** Landing page, property 1: the organisation written down, outside-in, with structure. */
export function ModelSection() {
  return (
    <section className="section" aria-labelledby="model-heading" id="model">
      <div className="container">
        <p className="section__eyebrow">1 · Written down, with structure</p>
        <h2 className="live__title" id="model-heading">
          The organisation, outside-in
        </h2>
        <p className="live__sub">Twelve element types. One traceable chain. ISO 9001 vocabulary.</p>
        <p className="how__lead">
          You describe the organisation outside-in: first the world it operates in, then what it
          commits to, then what it does and who owns it. Each element is a <code>:::block</code> in
          a Markdown file — prose for people first, a few fields for machines. The fields reference
          other elements by id, so an agent can follow the chain the way it follows a function call.
        </p>
        <MetamodelDiagram hrefBase="./model/" />
        <div className="how__more">
          <div className="how__pair">
            <figure className="how__figure">
              <figcaption>Written in Markdown</figcaption>
              <pre className="gs__snippet how__example">
                <code>{BLOCK_EXAMPLE}</code>
              </pre>
            </figure>
            <figure className="how__figure">
              <figcaption>Navigated like code</figcaption>
              <pre className="gs__snippet how__example">
                <code>{GET_EXAMPLE}</code>
              </pre>
            </figure>
          </div>
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
