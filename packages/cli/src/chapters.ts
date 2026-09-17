// biz42 chapter template definitions.
// Each entry provides: chapter number, title, filename, starter template,
// and authoring guide (shown by `biz42 guide chapter <n>`).

export interface Chapter {
  number: number;
  title: string;
  template: string;
  guide: string;
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
    guide: `# Chapter 1: Scope

Scope bounds everything that follows. Without it, every other element floats
without context.

## Questions to ask

  - What does this organisation do? What is its primary purpose?
  - Which markets, customer segments, and geographies are in?
  - What is explicitly out of scope — and why?
  - What adjacent organisations, platforms, or systems does this business
    interact with but not own?

## What to write

Write one prose paragraph that answers the first two questions. Then fill in
the scope block. Be explicit about what is in and what is out —
vague scope leads to vague everything else.

## CLI

  biz42 explain scope          # field reference and authoring tips
  biz42 validate               # check after filling in

## Done when

  - One scope block exists with non-empty included and excluded
  - biz42 validate shows no E errors for chapter 1
`,
    template: `# Scope

Write one paragraph here describing the organisation's primary purpose and what this business model covers. This becomes the prose introduction for the scope block below.

\`\`\`biz42
:::scope
id: scope-main
title: <Organisation Name>
included: <What is in scope — markets, regions, customer segments>
excluded: <What is explicitly out of scope>
:::
\`\`\`

## 1.1 Included

Describe what is explicitly within scope: customer segments, markets, geographies, and starting position.

## 1.2 Excluded

List what is out of scope, with a brief explanation for each exclusion to prevent future confusion.

## 1.3 Boundaries

Describe the interfaces with adjacent systems, platforms, or organisations. What does this business model consume or integrate with, but not own or operate?

## 1.4 Process Overview

Add a SIPOC diagram to make the scope machine-readable and auditable. The SIPOC maps who supplies what, what the process does, what it produces, and who receives the value.

:::diagram
id: diagram-sipoc-main
title: <Process Name> — SIPOC Overview
notation: sipoc
:::

\`\`\`mermaid
flowchart TD
    subgraph sipoc-supplier["Supplier"]
        direction LR
        s1["<Supplier A>"] ~~~ s2["<Supplier B>"]
    end
    subgraph sipoc-input["Input"]
        direction LR
        exp-xxx["<Expectation>"] ~~~ signal-xxx["<Signal>"]
    end
    subgraph sipoc-process["Process"]
        direction LR
        obj-xxx["<Objective>"]
    end
    subgraph sipoc-output["Output"]
        direction LR
        product-xxx["<Product>"]
    end
    subgraph sipoc-customer["Customer"]
        direction LR
        c1["<Customer A>"]
    end

    sipoc-supplier --> sipoc-input
    sipoc-input --> sipoc-process
    sipoc-process --> sipoc-output
    sipoc-output --> sipoc-customer
\`\`\`

Corresponds to ISO 9001 §4.3 (scope of the QMS). Run \`biz42 explain scope\` for all fields and authoring tips.
`,
  },
  {
    number: 2,
    title: "Signals",
    guide: `# Chapter 2: Signals

Signals are observable external or internal conditions that may affect the
business. They exist whether or not anyone is watching. They are not problems
or opportunities yet — that interpretation comes in chapters 4 and 5.

## Questions to ask

  - What is changing in the market, technology, or regulation?
  - What competitive moves are visible?
  - What macro-economic or social trends apply?
  - What is happening inside the organisation (culture, capability, capacity)?

## What to write

For each signal: one prose sentence explaining what is observable and why it
matters. Then a signal block. Link it forward to the risks and opportunities
it gives rise to — you can fill these in after chapters 4 and 5.

## CLI

  biz42 explain signal         # field reference and authoring tips
  biz42 validate               # check after filling in

## Done when

  - At least 2–3 signals exist covering market, technology, and regulation
  - Each signal is linked to the risks/opps it gives rise to
  - biz42 validate shows no E errors for chapter 2
`,
    template: `# Signals

This chapter documents external and internal factors that could affect the organisation's ability to achieve its intended outcomes, corresponding to ISO 9001 §4.1. Each signal should be an observable fact or trend, not a strategic response. Link each signal to the risks or opportunities it gives rise to. Run \`biz42 explain signal\` to see all fields and authoring tips.

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
    guide: `# Chapter 3: Expectations

Expectations come from identifiable stakeholders — people or organisations
that can respond if their needs are not met. Unlike signals, expectations are
personal: there is always a source actor.

## Questions to ask

  - Who are the organisation's customers? What do they need?
  - What do regulators require?
  - What do employees expect from the organisation?
  - What do partners, investors, or suppliers require?

## What to write

For each expectation: one prose sentence naming the stakeholder and their
need. Then an expectation block. Link it to the risks or opportunities
this expectation creates.

## CLI

  biz42 explain expectation    # field reference and authoring tips
  biz42 validate               # check after filling in

## Done when

  - Key stakeholder groups are represented (customers, regulators, at minimum)
  - Each expectation is linked to the risks or opportunities it creates
  - biz42 validate shows no E errors for chapter 3
`,
    template: `# Expectations

This chapter documents the requirements and needs of interested parties such as customers, regulators, employees, and investors, corresponding to ISO 9001 §4.2. Map each expectation to a specific stakeholder. Link each expectation to the risks or opportunities it creates. Run \`biz42 explain expectation\` to see all fields and authoring tips.

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
    guide: `# Chapter 4: Risks

Risks are potential negative effects on the organisation's ability to achieve
its objectives. Focus on organisational risks — reputation, compliance,
capability, market position — not on product flaws in isolation.

## Questions to ask

  - Which signals or expectations, if not addressed, could harm this organisation?
  - What is the potential impact on objectives, reputation, or compliance?
  - Is this risk accepted, monitored, or actively mitigated?

## What to write

For each risk: one prose paragraph explaining the threat and why it matters
to the organisation. Then a risk block. Go back to chapters 2 and 3 and link
the signals and expectations that surface this risk.

## CLI

  biz42 explain risk           # field reference and authoring tips
  biz42 validate               # check after filling in

## Done when

  - Every significant signal and expectation surfaces at least one risk
  - biz42 validate shows no E errors for chapter 4
`,
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
    guide: `# Chapter 5: Opportunities

Opportunities are potential positive outcomes the organisation could pursue.
They are possibilities surfaced by signals and expectations — not commitments.

## Questions to ask

  - Which signals suggest a market shift this organisation could lead?
  - Which unmet expectations represent a gap a competitor has not filled?
  - What could the organisation do better, faster, or at lower cost?

## What to write

For each opportunity: one prose sentence describing the upside. Then an
opportunity block. Go back to chapters 2 and 3 and link the signals and
expectations that surface it.

## CLI

  biz42 explain opportunity    # field reference and authoring tips
  biz42 validate               # check after filling in

## Done when

  - Key opportunities are captured from signals and expectations
  - biz42 validate shows no E errors for chapter 5
`,
    template: `# Opportunities

This chapter documents potential positive outcomes the organisation could pursue, corresponding to ISO 9001 §6.1. An opportunity is a possibility, not a commitment — commitments belong in chapter 6 (Objectives). Link back to the signals or expectations that surfaced each opportunity. Run \`biz42 explain opportunity\` to see all fields and authoring tips.

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
    guide: `# Chapter 6: Objectives

Objectives are the hub of the traceability chain. Every objective must connect
backward to a risk or opportunity and forward to a measure, an owner, and
capabilities.

## Questions to ask

  - For each risk: what is the organisation committing to do about it?
  - For each opportunity: what is the organisation committing to pursue?
  - What is the time horizon and target outcome?
  - Who is accountable?
  - What does success look like in measurable terms?

## What to write

For each objective: one prose paragraph explaining the commitment and the
business rationale. Then an objective block. Connect it back to the risks or
opportunities from chapters 4 and 5, and forward to a measure, owner, and
the capabilities it requires.

## CLI

  biz42 explain objective      # field reference and authoring tips
  biz42 validate               # check after each change

## Done when

  - Every risk and opportunity from chapters 4–5 is addressed by at least one objective
  - biz42 validate shows no E errors for chapter 6
`,
    template: `# Objectives

This chapter documents specific, time-bound outcomes the organisation commits to achieving, corresponding to ISO 9001 §6.2. Each objective is the hub of the traceability chain: it addresses risks or opportunities, is evaluated by measures, is owned by a person or role, and requires capabilities. An objective without a measure is unverifiable; one without an owner is unaccountable. Run \`biz42 explain objective\` to see all fields and authoring tips.
`,
  },
  {
    number: 7,
    title: "Measures",
    guide: `# Chapter 7: Measures

Measures define what "done" looks like for an objective. Every measure needs
a quantifiable target.

## Questions to ask

  - How will the organisation know whether each objective has been achieved?
  - How often is it reviewed?
  - What is the target value and the current baseline?

## What to write

For each measure: one prose sentence naming what is being monitored and
what counts as success. Then a measure block. Go back to chapter 6 and
link each objective to the measure that verifies it.

## CLI

  biz42 explain measure        # field reference and authoring tips
  biz42 validate               # check after filling in

## Done when

  - Every objective has at least one measure
  - biz42 validate shows no E errors for chapter 7
`,
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
    guide: `# Chapter 8: Owners

Owners are the people or roles accountable for achieving objectives. Ownership
means authority to act, accountability for outcomes, and responsibility to
report. A committee is not an owner.

## Questions to ask

  - Who is personally accountable for each objective?
  - Is that person named or is it a role?
  - Do they have the authority to act?

## What to write

For each owner: one prose sentence identifying who they are and what they
are responsible for. Then an owner block. Go back to chapter 6 and assign
each objective to its accountable owner.

## CLI

  biz42 explain owner          # field reference and authoring tips
  biz42 validate               # check after each change

## Done when

  - Every objective has an owner
  - biz42 validate shows no E errors for chapter 8
`,
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
    guide: `# Chapter 9: Capabilities

Capabilities are abstract organisational abilities — not tools, teams, or
processes. Multiple objectives may require the same capability, and a single
capability may serve multiple products.

## Questions to ask

  - What does the organisation need to be able to do to deliver on its
    objectives?
  - Does that ability already exist, is it planned, or is it a gap?
  - Which capabilities are shared across multiple objectives or products?

## What to write

For each capability: one prose sentence describing the ability and its
current state. Then a capability block. Go back to chapter 6 and link each
objective to the capabilities it requires. Also link each capability to the
products that draw on it.

## CLI

  biz42 explain capability     # field reference and authoring tips
  biz42 validate               # check after filling in

## Done when

  - Every objective is linked to at least one capability
  - Gap capabilities are documented and acknowledged
  - biz42 validate shows no E errors for chapter 9
`,
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
    guide: `# Chapter 10: Products and Services

Products and services are what the organisation delivers to its customers —
the tangible output that meets expectations and draws on capabilities.

## Questions to ask

  - What does the organisation offer to customers?
  - Which stakeholder expectations does each product or service fulfil?
  - Which capabilities does each product draw on?

## What to write

For each product or service: one prose sentence describing what is delivered
and to whom. Then a product block. Link each product to the stakeholder
expectations it meets and to the capabilities it draws on.

## CLI

  biz42 explain product        # field reference and authoring tips
  biz42 validate               # check after filling in

## Done when

  - Every product is linked to at least one expectation
  - Every product's capabilities are linked from chapter 9
  - biz42 validate shows no E errors for chapter 10
`,
    template: `# Products and Services

This chapter documents the products and services the organisation delivers, corresponding to ISO 9001 §8.1. A product is the delivery vehicle, not the underlying capability. Use \`fulfills\` to link to the stakeholder expectations each product meets. The capability link runs the other direction: add this product's id to \`enables\` on the relevant capability blocks in chapter 9. Run \`biz42 explain product\` to see all fields and authoring tips.

\`\`\`biz42
:::product
id: product-xxx
title: <Product or service name>
fulfills: exp-xxx
:::
\`\`\`
`,
  },
  {
    number: 11,
    title: "Evaluation",
    guide: `# Chapter 11: Evaluation

Evaluation is the practice of reviewing measures to determine whether
objectives are being met.

## Questions to ask

  - How does the organisation review its own performance?
  - Which measures are reviewed in each practice?
  - Who participates and how often?

## What to write

For each evaluation practice: one prose sentence describing what is reviewed,
how, and when. Then an evaluation block. Link each practice to the measures
it reviews.

## CLI

  biz42 explain evaluation     # field reference and authoring tips
  biz42 validate               # check after filling in

## Done when

  - Key measures are covered by at least one evaluation practice
  - biz42 validate shows no E errors for chapter 11
`,
    template: `# Evaluation

This chapter documents practices for evaluating performance and customer satisfaction, corresponding to ISO 9001 §9. Describe recurring practices with a defined cadence, not one-off events. Evaluation findings should feed into chapter 12 (Improvements). Run \`biz42 explain evaluation\` to see all fields and authoring tips.

\`\`\`biz42
:::evaluation
id: eval-xxx
title: <Evaluation practice title>
method: <e.g. "quarterly review" or "monthly NPS survey">
evaluates: measure-xxx
:::
\`\`\`
`,
  },
  {
    number: 12,
    title: "Improvements",
    guide: `# Chapter 12: Improvements

Improvements close the feedback loop. An improvement with no trigger and no
target is not an improvement, it is a wish.

## Questions to ask

  - What did evaluation reveal that needs to change?
  - Which objective, capability, risk, or measure is being addressed?
  - Which evaluation finding triggered this improvement?

## What to write

For each improvement: one prose sentence explaining what is changing and why.
Then an improvement block. Link it to the model element being improved and
to the evaluation finding that triggered it.

## CLI

  biz42 explain improvement    # field reference and authoring tips
  biz42 validate               # check after filling in

## Done when

  - Every significant evaluation finding has a corresponding improvement
  - biz42 validate shows 0 errors and minimal warnings across all chapters
  - Run \`biz42 validate --strict\` for a clean bill of health
`,
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
  {
    number: 13,
    title: "Cashflow",
    guide: `# Chapter 13: Cashflow

Cashflow maps the financial model: what the organisation charges for and what
it pays for. This chapter is optional — it has no ISO 9001 §-anchor and the
model validates without it. Include it when the business model discussion
needs to cover revenue streams and cost structure explicitly.

## Questions to ask

  - What does the organisation charge customers for? Is it recurring or one-off?
  - What are the main cost items — infrastructure, people, third-party services?
  - Which product generates which revenue stream?
  - Which capability drives which cost item?

## What to write

For each revenue stream or cost item: one prose sentence describing the
cashflow and its driver. Then a cashflow block. Link each item to the
product or capability it is tied to.

## Business Model Canvas

Add a single BMC diagram at the end of chapter 13 to visualise the full business model on one
canvas. Run \`biz42 explain diagram bmc\` for the full syntax, slot reference, and authoring tips.

## CLI

  biz42 explain cashflow       # field reference and authoring tips
  biz42 explain diagram bmc    # BMC notation, slot reference, and authoring tips
  biz42 validate               # checks linked-to references and BMC slot ids

## Done when

  - Revenue streams and cost items are documented
  - Each cashflow is linked to the product or capability it is tied to
  - A BMC diagram is present with the relevant slots filled
  - biz42 validate shows no E errors for chapter 13
`,
    template: `# Cashflow

This chapter documents the financial model: revenue streams and cost items. It is optional and
has no ISO 9001 §-anchor. Use \`linked-to\` to connect revenue streams to the products that generate
them and cost items to the capabilities that drive them. Run \`biz42 explain cashflow\` to see all
fields and authoring tips.

\`\`\`biz42
:::cashflow
id: cashflow-xxx
title: <Revenue stream or cost item>
type: revenue
category: <subscription | services | licensing | infrastructure | personnel | ...>
linked-to: product-xxx
recurrence: recurring
:::
\`\`\`
`,
  },
];
