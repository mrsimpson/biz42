interface Property {
  name: string;
  software: string;
  organisation: string;
  href: string;
}

const PROPERTIES: Property[] = [
  {
    name: "Written down, with structure",
    software:
      "Code lives in a repository. Types and references tell an agent what connects to what.",
    organisation:
      "Strategy decks, OKR sheets, risk registers and people's heads. Nothing links them.",
    href: "#model",
  },
  {
    name: "Checked",
    software: "Compilers, tests and linters say when something is wrong — before it ships.",
    organisation: "A risk nobody owns or an objective nobody measures shows up when it hurts.",
    href: "#validate",
  },
  {
    name: "Changed by review",
    software: "Every change is a diff, reviewed in a pull request and kept in history.",
    organisation: "Decisions happen in meetings. The reasoning stays there.",
    href: "#evolution",
  },
];

/** Landing page: why agents work well with software — and what an organisation lacks. */
export function WhySection() {
  return (
    <section className="section" aria-labelledby="why-heading" id="why">
      <div className="container">
        <h2 className="live__title" id="why-heading">
          What makes agents good at software?
        </h2>
        <p className="live__sub">Not that code is easy. That code is legible.</p>
        <p className="how__lead">
          We all know agents are great with software. A large part of the reason is the material
          they work on: software is written down in a structure an agent can follow, it can be
          checked, and every change to it is reviewed. An organisation, today, has none of that.
        </p>
        <div className="why__table" role="table" aria-label="Software compared to an organisation">
          <div className="why__row why__row--head" role="row">
            <span role="columnheader" />
            <span role="columnheader">Software</span>
            <span role="columnheader">Your organisation today</span>
          </div>
          {PROPERTIES.map((p, i) => (
            <div key={p.name} className="why__row" role="row">
              <a href={p.href} className="why__property" role="rowheader">
                <span className="why__num">{i + 1}</span>
                {p.name}
              </a>
              <p role="cell" data-label="Software">
                {p.software}
              </p>
              <p role="cell" data-label="Your organisation today" className="why__gap">
                {p.organisation}
              </p>
            </div>
          ))}
        </div>
        <p className="why__answer">biz42 gives an organisation the same three properties.</p>
      </div>
    </section>
  );
}
