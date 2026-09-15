interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: <AlignIcon />,
    title: "Outside-in alignment",
    desc: "Start with signals and expectations, work inward to products. Every feature traces back to a business objective.",
  },
  {
    icon: <BotIcon />,
    title: "Agent-readable",
    desc: "Plain Markdown with a defined structure. Coding agents can determine whether a feature is justified before building it.",
  },
  {
    icon: <Iso9001Icon />,
    title: "ISO 9001 grounded",
    desc: "Vocabulary from the most widely adopted management system standard. Business readers recognize the concepts immediately.",
  },
  {
    icon: <LinkIcon />,
    title: "arc42 connected",
    desc: "biz42 products map directly to arc42 architecture docs — an unbroken chain from business context to code.",
  },
];

export function FeatureStrip() {
  return (
    <section className="section" aria-label="Features" id="features">
      <div className="container">
        <div className="features" role="list">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature" role="listitem">
              <div className="feature__icon" aria-hidden="true">
                {f.icon}
              </div>
              <h3 className="feature__title">{f.title}</h3>
              <p className="feature__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AlignIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="9" y2="18" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M12 2a3 3 0 010 6" />
      <path d="M12 2a3 3 0 000 6" />
      <line x1="12" y1="8" x2="12" y2="11" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  );
}

function Iso9001Icon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}
