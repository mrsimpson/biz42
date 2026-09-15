const MODEL_ELEMENTS = [
  {
    n: "01",
    name: "Scope",
    desc: "Bounds everything. Markets, products, geographies in — and deliberately out.",
  },
  {
    n: "02",
    name: "Signals",
    desc: "Observable external/internal conditions: market shifts, tech trends, regulatory changes.",
  },
  {
    n: "03",
    name: "Expectations",
    desc: "Needs from identifiable stakeholders: customers, regulators, employees, partners.",
  },
  {
    n: "04",
    name: "Risks",
    desc: "Interpretations of signals or expectations that could prevent achieving objectives.",
  },
  {
    n: "05",
    name: "Opportunities",
    desc: "What the business could capitalize on to improve outcomes or gain advantage.",
  },
  {
    n: "06",
    name: "Objectives",
    desc: "Measurable, time-bound commitments in response to risks and opportunities.",
  },
  {
    n: "07",
    name: "Measures",
    desc: "How the business knows whether an objective is being achieved.",
  },
  {
    n: "08",
    name: "Owners",
    desc: "Persons or roles accountable for objectives, capabilities, or products.",
  },
  {
    n: "09",
    name: "Capabilities",
    desc: "Something the business can do. Abstract, shared across products and objectives.",
  },
  {
    n: "10",
    name: "Products & Services",
    desc: "What the business offers. The tangible output that meets expectations.",
  },
  {
    n: "11",
    name: "Evaluation",
    desc: "Reviewing measures to determine whether objectives are met and risks are controlled.",
  },
  {
    n: "12",
    name: "Improvements",
    desc: "What changes when evaluation reveals a gap. Closes the loop back to the top.",
  },
];

export function ModelSection() {
  return (
    <section className="section" aria-labelledby="model-heading" id="model">
      <div className="container">
        <h2 className="live__title" id="model-heading">
          The Model
        </h2>
        <p className="live__sub">12 sections. Outside-in sequence. Grounded in ISO 9001:2015.</p>
        <div className="model__grid" role="list">
          {MODEL_ELEMENTS.map((el) => (
            <div key={el.n} className="model-card" role="listitem">
              <span className="model-card__num">{el.n}</span>
              <h3 className="model-card__title">{el.name}</h3>
              <p className="model-card__desc">{el.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
