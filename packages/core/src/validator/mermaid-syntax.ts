import { mermaidSyntaxCheck } from "@cli42/lib/mermaid";
import type { MermaidSyntaxTarget } from "@cli42/lib/mermaid";
import { mermaidSyntaxParser } from "../mermaid.ts";
import type { MermaidNotation } from "../mermaid.ts";
import type { Diagram, Workspace } from "../model/types.ts";

/** Code of the rule that validates each kind of business diagram. */
const DIAGRAM_RULE: Partial<Record<MermaidNotation, string>> = {
  sipoc: "E012",
  turtle: "E013",
  "strategy-map": "E014",
};

/** Code of a syntax error in a plain Mermaid diagram or a bare fence. */
const MERMAID_SYNTAX = "E010";

/** E011 checks the element ids of every diagram kind. */
const UNKNOWN_DIAGRAM_ELEMENT = "E011";

function targetFor(diagram: Diagram): MermaidSyntaxTarget<MermaidNotation> | undefined {
  // bmc diagrams use a custom renderer — Mermaid never processes them
  if (diagram.notation === "bmc") return undefined;
  const code = DIAGRAM_RULE[diagram.notation] ?? MERMAID_SYNTAX;
  return {
    notation: diagram.notation,
    code,
    suppresses: (finding) => finding === code || finding === UNKNOWN_DIAGRAM_ELEMENT,
  };
}

/**
 * Mermaid's production syntax parser for all typed diagrams (empty sources
 * are caught by other rules) and non-empty bare fences. A syntax error is
 * reported under the rule of its diagram kind, and suppresses that rule's
 * findings — and unknown elements (E011) — within the diagram's lines.
 */
export const mermaidSyntax = mermaidSyntaxCheck<MermaidNotation, Diagram, Workspace>({
  parser: mermaidSyntaxParser,
  diagram: targetFor,
  bare: (source) => (source.trim() ? { notation: "auto", code: MERMAID_SYNTAX } : undefined),
});
