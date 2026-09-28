/**
 * The biz42 meta-model as the site presents it: the twelve element types and
 * the fields that link them. Mirrors the `crossRefs` of the schemas in
 * packages/core/src/model/schemas.ts — keep both in step.
 */

export type ElementKind =
  | "scope"
  | "signal"
  | "expectation"
  | "risk"
  | "opportunity"
  | "objective"
  | "measure"
  | "owner"
  | "capability"
  | "product"
  | "evaluation"
  | "improvement";

export interface Relation {
  /** The block field that holds the reference. */
  field: string;
  /** What the field points to. */
  target: string;
}

export interface MetaElement {
  kind: ElementKind;
  chapter: number;
  name: string;
  iso: string;
  /** One line: what the element is. */
  summary: string;
  /** A few sentences: what belongs here and why it matters. */
  detail: string;
  relations: Relation[];
}

export const ELEMENTS: MetaElement[] = [
  {
    kind: "scope",
    chapter: 1,
    name: "Scope",
    iso: "§4.3",
    summary: "What the business covers — and deliberately does not.",
    detail:
      "Markets, products, regions and customer segments that are in, and those that are out, with a reason for each exclusion. Scope bounds every other element: a signal outside the scope is not relevant, a product outside it means the scope must change.",
    relations: [{ field: "parent", target: "scope (of a larger unit)" }],
  },
  {
    kind: "signal",
    chapter: 2,
    name: "Signals",
    iso: "§4.1",
    summary: "Observable conditions: market shifts, technology, regulation.",
    detail:
      "Signals are impersonal — they exist whether or not anyone is watching. They are not yet problems or chances; that interpretation follows in risks and opportunities.",
    relations: [{ field: "surfaces", target: "risk · opportunity" }],
  },
  {
    kind: "expectation",
    chapter: 3,
    name: "Expectations",
    iso: "§4.2",
    summary: "Needs of identifiable parties: customers, regulators, staff.",
    detail:
      "Expectations are personal — they come from someone who reacts when they are not met. Each one names the interested party and whether the expectation is mandatory or desired.",
    relations: [{ field: "surfaces", target: "risk · opportunity" }],
  },
  {
    kind: "risk",
    chapter: 4,
    name: "Risks",
    iso: "§6.1",
    summary: "What could stop the business from reaching its objectives.",
    detail:
      "A risk is always an interpretation of signals or expectations — the same signal can be a risk for one business and irrelevant to another. Every risk should be addressed by an objective.",
    relations: [],
  },
  {
    kind: "opportunity",
    chapter: 5,
    name: "Opportunities",
    iso: "§6.1",
    summary: "What the business could capitalise on.",
    detail:
      "Like a risk, an opportunity interprets signals or expectations. One that no objective addresses is a decision not yet taken.",
    relations: [],
  },
  {
    kind: "objective",
    chapter: 6,
    name: "Objectives",
    iso: "§6.2",
    summary: "Measurable, time-bound commitments in response.",
    detail:
      "The centre of the model. An objective says which risks and opportunities it responds to, how its success is measured, who is accountable, and which capabilities it needs.",
    relations: [
      { field: "addresses", target: "risk · opportunity" },
      { field: "measured-by", target: "measure" },
      { field: "owner", target: "owner" },
      { field: "requires", target: "capability" },
    ],
  },
  {
    kind: "measure",
    chapter: 7,
    name: "Measures",
    iso: "§9.1",
    summary: "How the business knows an objective is being achieved.",
    detail:
      "What is monitored, how and when, and what counts as success. An objective without a measure cannot be evaluated; a measure without an objective is orphaned.",
    relations: [],
  },
  {
    kind: "owner",
    chapter: 8,
    name: "Owners",
    iso: "§5.1, §5.3",
    summary: "People or roles accountable for outcomes.",
    detail:
      "Ownership means accountability, authority to act and the duty to report. Every objective has an owner; capabilities and products should have one.",
    relations: [],
  },
  {
    kind: "capability",
    chapter: 9,
    name: "Capabilities",
    iso: "§7",
    summary: "What the business can do — or needs to learn.",
    detail:
      "Abstract and shared: several products draw on one capability, one capability serves several objectives. Its status (existing, planned, gap) makes missing abilities a visible strategic finding.",
    relations: [
      { field: "enables", target: "product" },
      { field: "owner", target: "owner" },
    ],
  },
  {
    kind: "product",
    chapter: 10,
    name: "Products & Services",
    iso: "§8",
    summary: "What the business offers to meet expectations.",
    detail:
      "The tangible output. A product fulfils stakeholder expectations and is enabled by capabilities. A software product links on to its arc42 architecture documentation.",
    relations: [
      { field: "fulfills", target: "expectation" },
      { field: "owner", target: "owner" },
    ],
  },
  {
    kind: "evaluation",
    chapter: 11,
    name: "Evaluation",
    iso: "§9",
    summary: "Reviewing measures: are objectives met, risks controlled?",
    detail:
      "A practice rather than a list of things: what is reviewed, how often and by whom. Its findings trigger improvements.",
    relations: [{ field: "evaluates", target: "measure" }],
  },
  {
    kind: "improvement",
    chapter: 12,
    name: "Improvements",
    iso: "§10",
    summary: "What changes when evaluation reveals a gap.",
    detail:
      "Corrective, proactive or innovative. An improvement names the evaluation that triggered it and what it changes — closing the loop back into the model.",
    relations: [
      { field: "triggered-by", target: "evaluation" },
      { field: "addresses", target: "objective · capability · product" },
    ],
  },
];

export const ELEMENT_COLOR: Record<ElementKind, string> = {
  scope: "var(--c-scope)",
  signal: "var(--c-signal)",
  expectation: "var(--c-expectation)",
  risk: "var(--c-risk)",
  opportunity: "var(--c-opportunity)",
  objective: "var(--c-objective)",
  measure: "var(--c-measure)",
  owner: "var(--c-owner)",
  capability: "var(--c-capability)",
  product: "var(--c-product)",
  evaluation: "var(--c-evaluation)",
  improvement: "var(--c-improvement)",
};
