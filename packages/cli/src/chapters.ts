// biz42 chapter template definitions.
// Each entry provides: chapter number, title, filename, and a starter template
// that is written by `biz42 init template`.

export interface Chapter {
  number: number;
  title: string;
  template: string;
}

export function filename(chapter: Chapter): string {
  return `${String(chapter.number).padStart(2, "0")}-${chapter.title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")}.biz42.md`;
}

export const CHAPTERS: readonly Chapter[] = [
  {
    number: 1,
    title: "Scope",
    template: `# Scope

Describe the organisation, its primary purpose, and the boundaries of this business model.

\`\`\`biz42
:::scope
id: scope-main
title: <Organisation Name>
:::
\`\`\`
`,
  },
  {
    number: 2,
    title: "Signals",
    template: `# Signals

Document external and internal factors that could affect the organisation's ability to achieve its intended outcomes.

\`\`\`biz42
:::signal
id: signal-example
title: <Signal title>
source: external
:::
\`\`\`
`,
  },
  {
    number: 3,
    title: "Expectations",
    template: `# Expectations

Document the needs and expectations of interested parties (customers, regulators, employees, investors).

\`\`\`biz42
:::expectation
id: exp-example
title: <Expectation title>
source: <Stakeholder name>
:::
\`\`\`
`,
  },
  {
    number: 4,
    title: "Risks",
    template: `# Risks

Document potential negative effects on the organisation's ability to achieve its objectives.

\`\`\`biz42
:::risk
id: risk-example
title: <Risk title>
severity: medium
mitigation: <Mitigation approach>
:::
\`\`\`
`,
  },
  {
    number: 5,
    title: "Opportunities",
    template: `# Opportunities

Document potential positive outcomes the organisation could pursue.

\`\`\`biz42
:::opportunity
id: opp-example
title: <Opportunity title>
:::
\`\`\`
`,
  },
  {
    number: 6,
    title: "Objectives",
    template: `# Objectives

Document specific, time-bound outcomes the organisation is committed to achieving.

\`\`\`biz42
:::objective
id: obj-example
title: <Objective title>
addresses: risk-example
measured-by: measure-example
owner: owner-example
requires: capability-example
:::
\`\`\`
`,
  },
  {
    number: 7,
    title: "Measures",
    template: `# Measures

Document measurable criteria that define whether objectives have been achieved.

\`\`\`biz42
:::measure
id: measure-example
title: <Measure title>
target: <Measurable target value>
:::
\`\`\`
`,
  },
  {
    number: 8,
    title: "Owners",
    template: `# Owners

Document the people or roles accountable for objectives.

\`\`\`biz42
:::owner
id: owner-example
title: <Owner name>
role: <Job title or role>
:::
\`\`\`
`,
  },
  {
    number: 9,
    title: "Capabilities",
    template: `# Capabilities

Document the organisational abilities, skills, or resources required to achieve objectives.

\`\`\`biz42
:::capability
id: capability-example
title: <Capability title>
status: exists
:::
\`\`\`
`,
  },
  {
    number: 10,
    title: "Products and Services",
    template: `# Products and Services

Document the products and services delivered by the organisation.

\`\`\`biz42
:::product
id: product-example
title: <Product or service name>
enables: capability-example
:::
\`\`\`
`,
  },
  {
    number: 11,
    title: "Evaluation",
    template: `# Evaluation

Document practices for evaluating performance, customer satisfaction, and system effectiveness.

\`\`\`biz42
:::evaluation
id: eval-example
title: <Evaluation practice title>
method: quarterly review
:::
\`\`\`
`,
  },
  {
    number: 12,
    title: "Improvements",
    template: `# Improvements

Document planned or ongoing actions to improve the business model.

\`\`\`biz42
:::improvement
id: impr-example
title: <Improvement action title>
addresses: obj-example
:::
\`\`\`
`,
  },
];
