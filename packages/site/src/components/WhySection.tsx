import type { ReactNode } from "react";

interface Property {
  name: string;
  software: string;
  organisation: string;
  biz42: ReactNode;
  href: string;
  more: string;
}

const PROPERTIES: Property[] = [
  {
    name: "Written down, with structure",
    software:
      "Code lives in a repository. Types and references tell an agent what connects to what.",
    organisation:
      "Strategy decks, OKR sheets, risk registers and people's heads. Nothing links them.",
    biz42: (
      <>
        Markdown blocks in Git, from signals to products, linked by id. <code>biz42 get</code>{" "}
        follows the links.
      </>
    ),
    href: "#model",
    more: "The model",
  },
  {
    name: "Checked",
    software: "Compilers, tests and linters say when something is wrong — before it ships.",
    organisation: "A risk nobody owns or an objective nobody measures shows up when it hurts.",
    biz42: (
      <>
        <code>biz42 validate</code> flags the unaddressed risk and the objective without an owner.
      </>
    ),
    href: "#validate",
    more: "Validation",
  },
  {
    name: "Changed by review",
    software: "Every change is a diff, reviewed in a pull request and kept in history.",
    organisation: "Decisions happen in meetings. The reasoning stays there.",
    biz42: (
      <>
        <code>biz42 diff</code> shows each change to the organisation, by meaning, in a pull
        request.
      </>
    ),
    href: "#evolution",
    more: "Reviewable change",
  },
];

/** Landing page: why agents work well with software, why they guess in an organisation, and what biz42 changes. */
export function WhySection() {
  return (
    <section className="section" aria-labelledby="why-heading" id="why">
      <div className="container">
        <h2 className="live__title why__title" id="why-heading">
          Agents succeed with software because code is legible.{" "}
          <span className="why__turn">Your organisation isn&apos;t.</span>
        </h2>
        <p className="how__lead why__lead">
          We all know agents are great with software. That is less because code is easy than because
          of what it is: written down in a structure an agent can follow, checked, and changed only
          by review. An organisation, today, has none of that.
        </p>
        <p className="how__lead why__stakes">
          So agents working on an organisation guess. A business plan sets objectives nobody
          committed to. A reorganisation moves an owner and leaves three objectives without one. A
          new product serves no risk or opportunity anyone wrote down. Nobody notices until it gets
          expensive.
        </p>
        <ol className="why__cards">
          {PROPERTIES.map((p, i) => (
            <li key={p.name} className="why__prop">
              <h3 className="why__prop-title">
                <span className="why__num">{i + 1}</span>
                {p.name}
              </h3>
              <dl className="why__compare">
                <dt>Software</dt>
                <dd>{p.software}</dd>
                <dt>Your organisation today</dt>
                <dd className="why__gap">{p.organisation}</dd>
              </dl>
              <div className="why__fix">
                <span className="why__fix-label">With biz42</span>
                <p>{p.biz42}</p>
                <a href={p.href} className="why__more">
                  {p.more} →
                </a>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
