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

This chapter defines the organisation, its primary purpose, and the boundaries of this business model. A biz42 model has exactly one scope block. Use \`included\` and \`excluded\` to make the boundary machine-readable; use \`parent\` to link this scope to a broader organisational scope in a nested model. Corresponds to ISO 9001 §4.3. Run \`biz42 explain scope\` to see all fields and authoring tips.

\`\`\`biz42
:::scope
id: scope-main
title: <Organisation Name>
included: <What is in scope>
excluded: <What is explicitly out of scope>
:::
\`\`\`
`,
  },
  {
    number: 2,
    title: "Signals",
    template: `# Signals

This chapter documents external and internal factors that could affect the organisation's ability to achieve its intended outcomes, corresponding to ISO 9001 §4.1. Each signal should be an observable fact or trend, not a strategic response. Use \`surfaces\` to link each signal to the risks or opportunities it gives rise to. Run \`biz42 explain signal\` to see all fields and authoring tips.

\`\`\`biz42
:::signal
id: signal-xxx
title: <Signal title>
source: external
surfaces: risk-xxx, opp-xxx
:::
\`\`\`
`,
  },
  {
    number: 3,
    title: "Expectations",
    template: `# Expectations

This chapter documents the requirements and needs of interested parties such as customers, regulators, employees, and investors, corresponding to ISO 9001 §4.2. Map each expectation to a specific stakeholder. Use \`surfaces\` to link to the risks or opportunities it creates. Run \`biz42 explain expectation\` to see all fields and authoring tips.

\`\`\`biz42
:::expectation
id: exp-xxx
title: <Expectation title>
source: <Stakeholder or regulation>
surfaces: risk-xxx, opp-xxx
:::
\`\`\`
`,
  },
  {
    number: 4,
    title: "Risks",
    template: `# Risks

This chapter documents potential negative effects on the organisation's ability to achieve its objectives, corresponding to ISO 9001 §6.1. Assess severity as the product of likelihood and impact. High-severity risks should be addressed by at least one objective. Run \`biz42 explain risk\` to see all fields and authoring tips.

\`\`\`biz42
:::risk
id: risk-xxx
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

This chapter documents potential positive outcomes the organisation could pursue, corresponding to ISO 9001 §6.1. An opportunity is a possibility, not a commitment — commitments belong in chapter 6 (Objectives). Opportunities are referenced by objectives via the \`addresses\` field. Run \`biz42 explain opportunity\` to see all fields and authoring tips.

\`\`\`biz42
:::opportunity
id: opp-xxx
title: <Opportunity title>
:::
\`\`\`
`,
  },
  {
    number: 6,
    title: "Objectives",
    template: `# Objectives

This chapter documents specific, time-bound outcomes the organisation commits to achieving, corresponding to ISO 9001 §6.2. Each objective is the hub of the traceability chain: it addresses risks or opportunities, is evaluated by measures, is owned by a person or role, and requires capabilities. An objective without a measure is unverifiable; one without an owner is unaccountable. Run \`biz42 explain objective\` to see all fields and authoring tips.

\`\`\`biz42
:::objective
id: obj-xxx
title: <Objective title>
addresses: risk-xxx, opp-xxx
measured-by: measure-xxx
owner: owner-xxx
requires: capability-xxx
:::
\`\`\`
`,
  },
  {
    number: 7,
    title: "Measures",
    template: `# Measures

This chapter documents the measurable criteria that define whether objectives have been achieved, corresponding to ISO 9001 §9.1. Every measure needs a quantifiable target. A measure must be referenced by at least one objective's \`measured-by\` field to be effective. Run \`biz42 explain measure\` to see all fields and authoring tips.

\`\`\`biz42
:::measure
id: measure-xxx
title: <Measure title>
target: <e.g. "NPS > 50" or "≤ 5% churn">
:::
\`\`\`
`,
  },
  {
    number: 8,
    title: "Owners",
    template: `# Owners

This chapter documents the people or roles accountable for objectives, corresponding to ISO 9001 §5.1 and §5.3. Each owner should be an individual, not a team or committee. Owners are referenced by objectives via the \`owner\` field. Run \`biz42 explain owner\` to see all fields and authoring tips.

\`\`\`biz42
:::owner
id: owner-xxx
title: <Person name>
role: <Job title or role>
:::
\`\`\`
`,
  },
  {
    number: 9,
    title: "Capabilities",
    template: `# Capabilities

This chapter documents the organisational abilities required to achieve objectives, corresponding to ISO 9001 §7.1 and §7.2. A capability is an abstract ability, not a tool or team. Use \`status\` to flag whether a capability exists, is planned, or is a gap. A capability marked \`gap\` that is required by an objective is a strategic finding. Run \`biz42 explain capability\` to see all fields and authoring tips.

\`\`\`biz42
:::capability
id: capability-xxx
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

This chapter documents the products and services the organisation delivers, corresponding to ISO 9001 §8.1. A product is the delivery vehicle, not the underlying capability. Use \`enables\` to link to the capabilities each product draws on. A product that enables a capability marked \`gap\` has an unmet dependency. Run \`biz42 explain product\` to see all fields and authoring tips.

\`\`\`biz42
:::product
id: product-xxx
title: <Product or service name>
enables: capability-xxx
:::
\`\`\`
`,
  },
  {
    number: 11,
    title: "Evaluation",
    template: `# Evaluation

This chapter documents practices for evaluating performance and customer satisfaction, corresponding to ISO 9001 §9. Describe recurring practices with a defined cadence, not one-off events. Evaluation findings should feed into chapter 12 (Improvements). Run \`biz42 explain evaluation\` to see all fields and authoring tips.

\`\`\`biz42
:::evaluation
id: eval-xxx
title: <Evaluation practice title>
method: <e.g. "quarterly review" or "monthly NPS survey">
:::
\`\`\`
`,
  },
  {
    number: 12,
    title: "Improvements",
    template: `# Improvements

This chapter documents planned or ongoing actions to improve the business model, corresponding to ISO 9001 §10. Improvements close the feedback loop: they arise from evaluation findings and feed back into the model by modifying objectives, capabilities, products, or other elements. Use \`addresses\` to trace each improvement to the objectives, risks, or measures it targets. Run \`biz42 explain improvement\` to see all fields and authoring tips.

\`\`\`biz42
:::improvement
id: impr-xxx
title: <Improvement title>
addresses: obj-xxx, risk-xxx
:::
\`\`\`
`,
  },
];
