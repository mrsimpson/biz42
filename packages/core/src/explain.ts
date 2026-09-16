// explain.ts — provides per-element and per-diagram-notation guidance for the
// `biz42 explain` CLI command.
// Element guidance is derived from Zod schemas in schemas.ts.
// Diagram notation guidance is kept as a static data table here.

import { z } from "zod";
import type { BlockType } from "./ast.ts";
import type { DiagramNotation } from "./model/types.ts";
import { ELEMENT_SCHEMAS, deriveFields, type CrossRefMeta } from "./model/schemas.ts";
import { ELEMENT_KIND_ORDER, ELEMENT_CHAPTER, CHAPTER_TITLE } from "./model/types.ts";

// ---------------------------------------------------------------------------
// Public result types
// ---------------------------------------------------------------------------

export interface ExplainFieldResult {
  name: string;
  description: string;
  required: boolean;
  enumValues: string[] | null;
}

export interface ExplainCrossRefResult {
  field: string;
  targetKind: string;
  cardinality: "one" | "many";
}

/** Full guidance for a single block type. */
export interface ExplainResult {
  blockType: BlockType;
  biz42Chapter: number;
  biz42ChapterTitle: string;
  description: string;
  requiredFields: ExplainFieldResult[];
  optionalFields: ExplainFieldResult[];
  crossRefs: ExplainCrossRefResult[];
  authoringTips: string[];
}

/** One-line summary entry for the list view. */
export interface ExplainSummary {
  blockType: BlockType;
  biz42Chapter: number;
  description: string;
}

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

interface SchemaMeta {
  description?: string;
  biz42Chapter?: number;
  crossRefs?: CrossRefMeta[];
  authoringTips?: string[];
}

function buildResult(blockType: BlockType): ExplainResult {
  const schema = ELEMENT_SCHEMAS[blockType];
  const meta = (z.globalRegistry.get(schema) ?? {}) as SchemaMeta;

  const chapter = meta.biz42Chapter ?? ELEMENT_CHAPTER[blockType];
  const description = meta.description ?? blockType;
  const crossRefs = meta.crossRefs ?? [];
  const authoringTips = meta.authoringTips ?? [];

  // deriveFields works on ZodObject
  const objectSchema = schema instanceof z.ZodObject ? schema : null;
  const allFields = objectSchema ? deriveFields(objectSchema) : [];

  return {
    blockType,
    biz42Chapter: chapter,
    biz42ChapterTitle: CHAPTER_TITLE[chapter] ?? `Chapter ${chapter}`,
    description,
    requiredFields: allFields.filter((f) => f.required),
    optionalFields: allFields.filter((f) => !f.required),
    crossRefs: crossRefs.map((cr) => ({
      field: cr.field,
      targetKind: cr.targetKind,
      cardinality: cr.cardinality,
    })),
    authoringTips,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Get full guidance for a single block type. */
export function explainElement(blockType: BlockType): ExplainResult {
  return buildResult(blockType);
}

/** Get one-line summaries for all block types, in chapter order. */
export function formatExplainListText(): string {
  const lines: string[] = ["biz42 block types:\n"];
  for (const kind of ELEMENT_KIND_ORDER) {
    const schema = ELEMENT_SCHEMAS[kind];
    const meta = (z.globalRegistry.get(schema) ?? {}) as SchemaMeta;
    const chapter = meta.biz42Chapter ?? ELEMENT_CHAPTER[kind];
    const desc = meta.description ?? kind;
    lines.push(`  ch.${String(chapter).padStart(2, "0")}  ${kind.padEnd(14)}  ${desc}`);
  }
  return lines.join("\n");
}

/** Format full explain output as human-readable text. */
export function formatExplainText(result: ExplainResult): string {
  const lines: string[] = [];
  lines.push(`Block type: ${result.blockType}`);
  lines.push(`Chapter:    ${result.biz42Chapter} — ${result.biz42ChapterTitle}`);
  lines.push(`\n${result.description}\n`);

  if (result.requiredFields.length > 0) {
    lines.push("Required fields:");
    for (const f of result.requiredFields) {
      const enums = f.enumValues ? ` (${f.enumValues.join(" | ")})` : "";
      lines.push(`  ${f.name}${enums}  — ${f.description}`);
    }
  }

  if (result.optionalFields.length > 0) {
    lines.push("\nOptional fields:");
    for (const f of result.optionalFields) {
      const enums = f.enumValues ? ` (${f.enumValues.join(" | ")})` : "";
      lines.push(`  ${f.name}${enums}  — ${f.description}`);
    }
  }

  if (result.crossRefs.length > 0) {
    lines.push("\nCross-references:");
    for (const cr of result.crossRefs) {
      lines.push(`  ${cr.field} → ${cr.targetKind} (${cr.cardinality})`);
    }
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Diagram notation types
// ---------------------------------------------------------------------------

export interface ExplainDiagramSlot {
  label: string;
  meaning: string;
}

/** Full guidance for a single diagram notation. */
export interface ExplainDiagramResult {
  notation: DiagramNotation;
  name: string;
  description: string;
  slots?: ExplainDiagramSlot[];
  authoringTips: string[];
}

// ---------------------------------------------------------------------------
// Diagram notation data
// ---------------------------------------------------------------------------

const DIAGRAM_DATA: Record<DiagramNotation, ExplainDiagramResult> = {
  bmc: {
    notation: "bmc",
    name: "Business Model Canvas",
    description:
      "The Business Model Canvas (Osterwalder & Pigneur) is a strategic management tool that " +
      "describes a business model on a single page using nine building blocks: Key Partners, " +
      "Key Activities, Key Resources, Value Propositions, Customer Relationships, Channels, " +
      "Customer Segments, Cost Structure, and Revenue Streams. In biz42, element ids in the " +
      "canvas link back to the corresponding model elements.",
    authoringTips: [
      "Use element ids as node labels so the canvas links to the model.",
      "Value Propositions sit at the centre — fill those first, then radiate outward.",
      "Keep each cell to 3–5 items; add detail in the element blocks, not here.",
    ],
  },
  sipoc: {
    notation: "sipoc",
    name: "SIPOC",
    description:
      "A SIPOC diagram (Six Sigma / ISO 9001 §4.4) maps a process from end to end by identifying " +
      "who supplies the inputs, what those inputs are, what the process does, what it produces, " +
      "and who receives the outputs. It is used to agree on scope and handoffs before diving into " +
      "process detail.",
    slots: [
      { label: "Supplier", meaning: "Who provides the inputs (stakeholders, systems)" },
      { label: "Input", meaning: "What enters the process (signals, expectations)" },
      { label: "Process", meaning: "What the organisation does (objectives)" },
      { label: "Output", meaning: "What is produced (products, services)" },
      { label: "Customer", meaning: "Who receives the outputs (stakeholders)" },
    ],
    authoringTips: [
      "Start with the Process column — one to five high-level steps.",
      "Work outward: Inputs & Outputs before Suppliers & Customers.",
      "Use element ids wherever possible so the diagram links to the model.",
      "Keep it at the macro level; SIPOC is a scoping tool, not a detailed flowchart.",
    ],
  },
  turtle: {
    notation: "turtle",
    name: "Turtle Diagram",
    description:
      "A Turtle Diagram is an ISO 9001 process audit tool. It describes a single process by " +
      "asking six questions: what resources are needed, who is responsible, how the process is " +
      "carried out, for whom it is done, and how success is measured. It is named after its " +
      "shape: a central process body with four 'legs' of context.",
    slots: [
      { label: "With what?", meaning: "Resources and capabilities required" },
      { label: "With whom?", meaning: "People and roles accountable" },
      { label: "How?", meaning: "Objectives and methods that define the process" },
      { label: "For whom?", meaning: "Customers and stakeholders served" },
      { label: "Results", meaning: "Measures that define success" },
    ],
    authoringTips: [
      "Place the process name and owner in the central body.",
      "Link 'With what?' to capability element ids.",
      "Link 'Results' to measure element ids so performance is traceable.",
    ],
  },
  "strategy-map": {
    notation: "strategy-map",
    name: "Strategy Map",
    description:
      "A Strategy Map (adapted from Kaplan & Norton's Balanced Scorecard) shows the cause-and-" +
      "effect logic behind strategic choices: which risks and opportunities drive which objectives, " +
      "and how each objective is measured. It makes the strategic reasoning visible and auditable.",
    slots: [
      { label: "Risks & Opportunities", meaning: "What triggered this objective" },
      { label: "Objectives", meaning: "What the organisation commits to achieving" },
      { label: "Measures", meaning: "How success is defined and tracked" },
    ],
    authoringTips: [
      "Use element ids for nodes so the map links directly into the model.",
      "Draw arrows from risks/opportunities to the objectives they triggered.",
      "Keep causal chains short — if a chain has more than four hops, split the map.",
    ],
  },
  architecture: {
    notation: "architecture",
    name: "Architecture Diagram (Mermaid)",
    description:
      "A Mermaid architecture diagram shows system components and their relationships using " +
      "Mermaid's `architecture-beta` syntax. Use it to visualise the technical building blocks " +
      "that support the business capabilities and products in the model.",
    authoringTips: [
      "Use `architecture-beta` as the diagram opening keyword.",
      "Group related services inside `group` blocks to reduce visual noise.",
      "Label edges with the protocol or data type to make integration explicit.",
    ],
  },
  sequence: {
    notation: "sequence",
    name: "Sequence Diagram (Mermaid)",
    description:
      "A Mermaid sequence diagram shows time-ordered interactions between participants. Use it " +
      "to document runtime behaviour, API flows, or process handoffs that span multiple owners " +
      "or capabilities.",
    authoringTips: [
      "Name participants after element ids or system names used in the model.",
      "Use `activate` / `deactivate` to show where a participant holds responsibility.",
      "Keep a single sequence to one scenario — create separate diagrams for variants.",
    ],
  },
  flowchart: {
    notation: "flowchart",
    name: "Flowchart (Mermaid)",
    description:
      "A Mermaid flowchart diagram shows steps, decisions, and flows using directed graph " +
      "syntax. Use it for process flows, decision trees, or any linear or branching logic " +
      "that does not fit a more specialised notation.",
    authoringTips: [
      "Use `flowchart LR` for process flows (left-to-right) and `flowchart TD` for hierarchies.",
      "Prefer diamond `{decision}` shapes for forks and rectangles for steps.",
      "Reference element ids in node labels to tie the flow to the biz42 model.",
    ],
  },
  class: {
    notation: "class",
    name: "Class Diagram (Mermaid)",
    description:
      "A Mermaid class diagram shows entities, their attributes, and their relationships using " +
      "UML class notation. Use it to document data models, domain objects, or the structure of " +
      "a product's core entities.",
    authoringTips: [
      "Map domain entities to biz42 capabilities or products where applicable.",
      "Use `+` for public, `-` for private, and `#` for protected members.",
      "Prefer composition `*--` over inheritance `<|--` for business-domain models.",
    ],
  },
  auto: {
    notation: "auto",
    name: "Auto (Mermaid)",
    description:
      "The `auto` notation lets Mermaid detect the diagram type from the source. Use it when " +
      "pasting Mermaid source that already begins with a type keyword (e.g. `graph`, `pie`, " +
      "`gantt`). For new diagrams, prefer an explicit notation.",
    authoringTips: [
      "Always start the source with a Mermaid type keyword (graph, pie, gantt, etc.).",
      "Switch to a named notation once you know the type — explicit is clearer.",
    ],
  },
};

// Order for the list view — business notations first, then Mermaid specifics
const DIAGRAM_KIND_ORDER: DiagramNotation[] = [
  "bmc",
  "sipoc",
  "turtle",
  "strategy-map",
  "architecture",
  "sequence",
  "flowchart",
  "class",
  "auto",
];

// ---------------------------------------------------------------------------
// Diagram public API
// ---------------------------------------------------------------------------

/** Get full guidance for a single diagram notation, or undefined if unknown. */
export function explainDiagram(notation: string): ExplainDiagramResult | undefined {
  return DIAGRAM_DATA[notation as DiagramNotation];
}

/** Format full diagram explain output as human-readable text. */
export function formatExplainDiagramText(result: ExplainDiagramResult): string {
  const lines: string[] = [];
  lines.push(`Notation: ${result.notation}`);
  lines.push(`Name:     ${result.name}`);
  lines.push(`\n${result.description}`);

  if (result.slots && result.slots.length > 0) {
    lines.push("\nSlots:");
    for (const slot of result.slots) {
      lines.push(`  ${slot.label.padEnd(22)}  ${slot.meaning}`);
    }
  }

  if (result.authoringTips.length > 0) {
    lines.push("\nAuthoring tips:");
    for (const tip of result.authoringTips) {
      lines.push(`  • ${tip}`);
    }
  }

  return lines.join("\n");
}

/** List all diagram notations as human-readable text. */
export function formatExplainDiagramListText(): string {
  const lines: string[] = ["biz42 diagram notations:\n"];
  for (const notation of DIAGRAM_KIND_ORDER) {
    const entry = DIAGRAM_DATA[notation];
    lines.push(`  ${notation.padEnd(16)}  ${entry.name}`);
  }
  return lines.join("\n");
}
