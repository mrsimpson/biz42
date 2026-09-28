import { Nav } from "./Nav";
import { Footer } from "./Footer";
import summaryShot from "../assets/evolution/01-plan-summary.png";
import existingObjectiveShot from "../assets/evolution/02-existing-objective.png";
import newObjectiveShot from "../assets/evolution/03-new-objective.png";
import newRoleShot from "../assets/evolution/04-new-role.png";
import reasoningShot from "../assets/evolution/05-missing-reasoning.png";
import historyShot from "../assets/evolution/06-history.png";

const REPO = "https://github.com/mrsimpson/biz42";

/**
 * The questions of the ACME business development plan and the commits that
 * answer them (scripts/acme-evolution.ts).
 */
const PLAN = [
  {
    question: "Does the opportunity actually exist?",
    answer:
      "Record the evidence before deciding anything: what was observed (a signal) and what the people asking need (an expectation).",
    commit: "evidence: peer operators ask for our alerting",
  },
  {
    question: "Should we reach for it — and what does it put at risk?",
    answer:
      "The evidence surfaces an opportunity — and a risk: outside customers compete with the internal rollout.",
    commit: "opportunity: offer ACME to peer operators",
  },
  {
    question: "Does it fit an objective we have, or do we need a new one?",
    answer:
      "No existing objective covers outside customers, so a new one gets its own measure. An existing objective is extended to guard against the new risk.",
    commit: "objective: win three operator pilots",
  },
  {
    question: "Who is accountable?",
    answer:
      "A new owner: a Head of Business Development. The organisation's structure changes — and the change is in the diff.",
    commit: "objective: win three operator pilots",
  },
  {
    question: "What do we need to be able to do?",
    answer: "A capability the organisation does not have yet, and the new service it enables.",
    commit: "capability: multi-tenant operations",
  },
  {
    question: "Did we explain every decision?",
    answer:
      "A risk is raised with its reason only in a commit message. The lint flags it: a change to the model comes with its reasoning in the prose.",
    commit: "chore: raise the incumbent response risk",
  },
];

interface Highlight {
  title: string;
  text: React.ReactNode;
  image: string;
  alt: string;
}

const HIGHLIGHTS: Highlight[] = [
  {
    title: "The whole plan at a glance",
    text: (
      <>
        Against the model as it is today, the plan adds nine elements and changes three. The summary
        lists what needs attention first, then every changed chapter with its elements — each one a
        link into the chapter, where the change is shown in place.
      </>
    ),
    image: summaryShot,
    alt: "The Changes summary of the plan: one warning, then nine chapters with added and changed elements",
  },
  {
    title: "An existing commitment, extended",
    text: (
      <>
        The plan does not only add. The rollout objective now also addresses the new focus risk, and
        its prose says why: the internal rollout takes precedence over any outside customer. Only
        the changed values and words are marked.
      </>
    ),
    image: existingObjectiveShot,
    alt: "The Time to Deployment objective: risk-focus-dilution added to what it addresses, and a new clause in its prose",
  },
  {
    title: "A new commitment, with its reason",
    text: (
      <>
        A new objective arrives as a new section of its chapter — the prose explaining what counts
        as success and why the pilots need something the organisation cannot do yet.
      </>
    ),
    image: newObjectiveShot,
    alt: "The new Operator Pilots objective as an added section",
  },
  {
    title: "The organisation changes",
    text: (
      <>
        Accountability is part of the model. A plan that needs a new role shows it — a new owner,
        what it is accountable for, and why it is kept apart from the existing leads.
      </>
    ),
    image: newRoleShot,
    alt: "The new owner Head of Business Development as an added section of the Owners chapter",
  },
  {
    title: "No decision without its reasoning",
    text: (
      <>
        A block that changes while the prose of its section does not is a decision nobody explained.{" "}
        <code>biz42 diff</code> flags it, and so does every review — run it before each commit with{" "}
        <code>biz42 diff --staged</code>.
      </>
    ),
    image: reasoningShot,
    alt: "The Incumbent Response risk: severity changed from medium to high, its prose unchanged",
  },
  {
    title: "The plan as a history",
    text: (
      <>
        Every commit that touched the model is a pearl: each decision with its message and its
        change. Formatting-only commits stay neutral — nothing to review there. Any earlier version
        can be opened as a whole.
      </>
    ),
    image: historyShot,
    alt: "The history: the commit 'objective: win three operator pilots' with its message and its change",
  },
];

export function EvolutionPage() {
  return (
    <>
      <Nav home="../" />
      <main>
        <section className="hero evo-hero" aria-label="Introduction">
          <div className="container hero__inner">
            <p className="hero__eyebrow">Business development · Decisions · Review</p>
            <h1 className="hero__headline">
              A business development plan
              <br />
              <em>becomes a pull request.</em>
            </h1>
            <p className="hero__sub evo-hero__sub">
              Organisations evolve by decisions: pursue an opportunity, commit to an objective,
              build a capability, create a role. biz42 records each decision in the model — with its
              reasoning in the prose — and <code>biz42 diff</code> shows what a plan changes before
              anyone approves it.
            </p>
            <div className="hero__ctas">
              <a href="../acme-evolution/" className="btn btn--primary">
                Open the live plan →
              </a>
              <a href="#review" className="btn btn--outline">
                How the review works →
              </a>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="evo-not-drift-heading">
          <div className="container evo-lead">
            <h2 className="gs__title" id="evo-not-drift-heading">
              Not drift. Deliberate evolution.
            </h2>
            <p className="evo-row__desc">
              For software architecture, a diff catches documentation falling behind the code. A
              business model has no code to fall behind: the model <em>is</em> the plan. Its diff
              shows how the organisation intends to change — which opportunity it reaches for, what
              it commits to, what it has to learn, and who will be accountable. Every question of
              business development becomes a change that can be discussed, reviewed and merged.
            </p>
          </div>
        </section>

        <section className="section" aria-labelledby="evo-plan-heading">
          <div className="container">
            <header className="gs__header">
              <h2 className="gs__title" id="evo-plan-heading">
                ACME grows beyond its own organisation
              </h2>
              <p className="gs__sub">
                The ACME Emergency example built its alerting for its own staff. Then peer operators
                ask to use it. The plan to serve them, one decision per commit — shown by{" "}
                <code>biz42 serve --diff v1.0</code>.
              </p>
            </header>
            <ol className="evo-plan">
              {PLAN.map((step) => (
                <li key={step.question}>
                  <h3>{step.question}</h3>
                  <p>{step.answer}</p>
                  <code>{step.commit}</code>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {HIGHLIGHTS.map((highlight, index) => (
          <section className="section" key={highlight.title} aria-label={highlight.title}>
            <div className={["container", "evo-row", index % 2 ? "evo-row--flip" : ""].join(" ")}>
              <div className="evo-row__text">
                <h2 className="gs__title">{highlight.title}</h2>
                <p className="evo-row__desc">{highlight.text}</p>
              </div>
              <a href={highlight.image} className="evo-row__zoom" title="Open full size">
                <img
                  className="evo-row__image"
                  src={highlight.image}
                  alt={highlight.alt}
                  loading="lazy"
                />
              </a>
            </div>
          </section>
        ))}

        <section className="section" aria-labelledby="evo-review-heading" id="review">
          <div className="container evo-lead">
            <h2 className="gs__title" id="evo-review-heading">
              Reviewed like code
            </h2>
            <p className="evo-row__desc">
              Put the plan on a branch and open a pull request. A GitHub Actions workflow compares
              every workspace with the merge base, attaches the review as a single HTML page that
              opens in any browser, and keeps one comment up to date: what the plan adds and
              changes, and which decisions still lack their reasoning. Management, owners and the
              people affected review the same page — and the merge is the decision.
            </p>
            <p className="evo-row__desc">
              <a href={`${REPO}/blob/main/.github/workflows/business-review.yml`}>The workflow →</a>
            </p>
          </div>
        </section>

        <section className="section" aria-labelledby="evo-try-heading">
          <div className="container">
            <header className="gs__header">
              <h2 className="gs__title" id="evo-try-heading">
                Try it on your model
              </h2>
            </header>
            <div className="gs__grid gs__grid--3">
              <div className="gs__card">
                <div className="gs__card-label">Before you commit</div>
                <h3 className="gs__card-title">Every change explained</h3>
                <div className="gs__snippet">
                  <code>biz42 diff --staged</code>
                </div>
              </div>
              <div className="gs__card">
                <div className="gs__card-label">While you plan</div>
                <h3 className="gs__card-title">See your branch, live</h3>
                <div className="gs__snippet">
                  <code>biz42 serve --diff origin/main</code>
                </div>
              </div>
              <div className="gs__card">
                <div className="gs__card-label">For the decision</div>
                <h3 className="gs__card-title">One page to share</h3>
                <div className="gs__snippet">
                  <code>biz42 build --out plan --diff origin/main...HEAD --single-file</code>
                </div>
              </div>
            </div>
            <p className="evo-footnote">
              <code>biz42 build --with-history</code> adds the history to any static site — every
              version browsable, parsed right in the browser.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
