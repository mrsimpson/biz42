import { mermaidSyntaxCheck } from "@cli42/lib/mermaid";
import { mermaidSyntaxParser } from "../mermaid.ts";
import type { MermaidNotation } from "../mermaid.ts";
import type { Diagram, Workspace } from "../model/types.ts";

/**
 * Mermaid's production syntax parser for all typed diagrams (empty sources
 * are caught by other rules; bmc diagrams use a custom renderer, Mermaid never
 * processes them) and non-empty bare fences. An invalid diagram suppresses
 * every other finding within its lines.
 */
export const mermaidSyntax = mermaidSyntaxCheck<MermaidNotation, Diagram, Workspace>({
  parser: mermaidSyntaxParser,
  diagram: (diagram) =>
    diagram.notation === "bmc"
      ? undefined
      : { notation: diagram.notation, code: "E010", suppresses: () => true },
  bare: (source) => (source.trim() ? { notation: "auto", code: "E010" } : undefined),
});
