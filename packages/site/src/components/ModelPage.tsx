import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { MetamodelDiagram } from "./MetamodelDiagram";
import { ELEMENTS, ELEMENT_COLOR } from "../metamodel";

const BLOCK_EXAMPLE = `## Feature misalignment

Agents implement features faster than we decide which ones matter.
Features that serve no objective make the next useful one harder to build.

:::risk
id: risk-feature-misalignment
title: Features built without business justification
severity: high
:::`;

const RULES = [
  "A signal or expectation that surfaces no risk or opportunity has not been analysed.",
  "A risk or opportunity that no objective addresses is a planning gap.",
  "An objective without a measure cannot be evaluated (ISO 9001 §6.2).",
  "An objective without an owner has no accountability (ISO 9001 §5.3).",
  "A product that fulfills no expectation has no modelled reason to exist.",
  "An improvement that addresses nothing has no modelled goal.",
];

/** The meta-model in detail: the diagram, every element type, notation and rules. */
export function ModelPage() {
  return (
    <>
      <Nav home="../" />
      <main>
        <section className="hero evo-hero" aria-label="Introduction">
          <div className="container hero__inner">
            <p className="hero__eyebrow">The model · ISO 9001:2015</p>
            <h1 className="hero__headline">
              Twelve elements.
              <br />
              <em>One traceable chain.</em>
            </h1>
            <p className="hero__sub evo-hero__sub">
              The biz42 model runs outside-in: from the world a business operates in, through the
              commitments it makes, to what it can do and offers. Every element answers to the one
              before it — so every product, and every feature, can say why it exists.
            </p>
          </div>
        </section>

        <section className="section" aria-labelledby="diagram-heading" id="diagram">
          <div className="container container--wide">
            <h2 className="live__title" id="diagram-heading">
              The meta-model
            </h2>
            <p className="how__lead">
              Read it from left to right. <strong>Context</strong>: signals and expectations
              describe the world. <strong>Interpretation</strong>: they surface risks and
              opportunities. <strong>Commitment</strong>: objectives address those, each with a
              measure and an owner. <strong>Delivery</strong>: capabilities enable the products that
              fulfill the expectations. <strong>Learning</strong>: evaluation reviews the measures,
              and improvements change the model.
            </p>
            <MetamodelDiagram />
          </div>
        </section>

        <section className="section" aria-labelledby="elements-heading" id="elements">
          <div className="container">
            <h2 className="live__title" id="elements-heading">
              The elements
            </h2>
            <p className="live__sub">
              One chapter each, in this order. <code>biz42 explain &lt;type&gt;</code> lists all
              fields of a block type.
            </p>
            <ol className="model-els">
              {ELEMENTS.map((el) => (
                <li
                  key={el.kind}
                  id={el.kind}
                  className="model-el"
                  style={{ borderLeftColor: ELEMENT_COLOR[el.kind] }}
                >
                  <div className="model-el__head">
                    <span className="model-card__num">{String(el.chapter).padStart(2, "0")}</span>
                    <h3 className="model-card__title">{el.name}</h3>
                    <span className="model-el__iso">ISO 9001 {el.iso}</span>
                  </div>
                  <p className="model-el__summary">{el.summary}</p>
                  <p className="model-card__desc">{el.detail}</p>
                  <p className="model-el__block">
                    <code>:::{el.kind}</code>
                    {el.relations.map((rel) => (
                      <span key={rel.field} className="model-el__rel">
                        <code>{rel.field}</code> → {rel.target}
                      </span>
                    ))}
                  </p>
                </li>
              ))}
            </ol>
            <p className="evo-footnote">
              Optional chapter 13, <strong>Cashflow</strong>, links revenue to products and cost to
              capabilities (<code>linked-to</code>) and draws the Business Model Canvas.
            </p>
          </div>
        </section>

        <section className="section" aria-labelledby="notation-heading" id="notation">
          <div className="container">
            <h2 className="live__title" id="notation-heading">
              Prose first, a block as its summary
            </h2>
            <p className="how__lead">
              Each element is a section of a Markdown file: prose that explains it to people, then a{" "}
              <code>:::block</code> fence that summarises it for machines. Blocks reference each
              other by id — the arrows of the meta-model are these fields. A risk has no outgoing
              reference; the objectives that address it point to it.
            </p>
            <pre className="gs__snippet how__example">
              <code>{BLOCK_EXAMPLE}</code>
            </pre>
          </div>
        </section>

        <section className="section" aria-labelledby="rules-heading" id="rules">
          <div className="container">
            <h2 className="live__title" id="rules-heading">
              Linting for your business
            </h2>
            <p className="how__lead">
              <code>biz42 validate</code> checks the chain. A model may be inconsistent for a while,
              but every gap is flagged — and an agent can close it. <code>biz42 rules</code> lists
              them all; some examples:
            </p>
            <ul className="model-rules">
              {RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section" aria-labelledby="more-heading">
          <div className="container">
            <div className="gs__grid gs__grid--2">
              <div className="gs__card">
                <div className="gs__card-label">Recursive</div>
                <h3 className="gs__card-title">Every unit, the same model</h3>
                <p className="gs__card-desc">
                  A department, a product line or a team fills in the same chapters with its own
                  scope (<code>parent</code> links it to the larger one). One unit&apos;s product
                  becomes another unit&apos;s expectation; shared capabilities surface shared
                  dependencies.
                </p>
              </div>
              <div className="gs__card">
                <div className="gs__card-label">Evolving</div>
                <h3 className="gs__card-title">Every change a pull request</h3>
                <p className="gs__card-desc">
                  A new product needs an expectation it fulfills and a capability that enables it.
                  The validator names what is missing, the diff shows what a plan changes.
                </p>
                <a href="../evolution/" className="gs__link">
                  See how a plan is reviewed →
                </a>
              </div>
            </div>
            <div className="hero__ctas how__more">
              <a href="../#getting-started" className="btn btn--primary">
                Get started →
              </a>
              <a href="../acme-emergency/" className="btn btn--outline">
                See a complete model →
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
