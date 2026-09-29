// The Mermaid syntax boundary of @cli42/lib, with the notations biz42 checks:
// Mermaid's own grammars plus the business diagrams drawn as flowcharts.
import { createMermaidParser } from "@cli42/lib/mermaid";
import type { MermaidGrammar } from "@cli42/lib/mermaid";

const GRAMMARS = {
  architecture: "architecture",
  sequence: "sequence",
  flowchart: "flowchart",
  class: "class",
  auto: "auto",
  sipoc: "flowchart",
  turtle: "flowchart",
  "strategy-map": "flowchart",
} as const satisfies Record<string, MermaidGrammar>;

/** Mermaid notation understood by the biz42 syntax boundary. */
export type MermaidNotation = keyof typeof GRAMMARS;

export const mermaidSyntaxParser = createMermaidParser<MermaidNotation>(GRAMMARS);
