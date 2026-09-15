import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";
import { extractMermaidSubgraphIds } from "../mermaid-utils.ts";

/**
 * E011 — A diagram references an element id that does not exist in the workspace.
 *
 * Scans the mermaid source for node definitions that use biz42 element id
 * patterns (e.g. `obj-privacy-architecture`, `risk-adoption`). If a token
 * matches a known biz42 element kind prefix but the full id is not in the
 * workspace, it is flagged.
 *
 * Applies to: sipoc, turtle, strategy-map notations.
 *
 * Strategy: only flag tokens whose prefix matches a biz42 element kind
 * (signal-, exp-, risk-, opp-, obj-, measure-, owner-, capability-, product-,
 * eval-, improvement-). Structural subgraph IDs (sipoc-*, turtle-*, etc.)
 * are excluded. Tokens that only appear inside quoted labels are excluded.
 */

const ELEMENT_PREFIXES = [
  "signal-",
  "exp-",
  "risk-",
  "opp-",
  "obj-",
  "measure-",
  "owner-",
  "capability-",
  "product-",
  "eval-",
  "improvement-",
  "scope-",
];

function looksLikeElementId(token: string): boolean {
  return ELEMENT_PREFIXES.some((prefix) => token.startsWith(prefix));
}

function appearsOnlyInQuotes(source: string, token: string): boolean {
  const escaped = token.replace(/[-]/gu, "\\-");
  // Remove all quoted strings from source and check if token still appears
  const withoutQuotes = source.replace(/"[^"]*"/gu, '""');
  return !new RegExp(`(?<![a-zA-Z0-9_-])${escaped}(?![a-zA-Z0-9_-])`).test(withoutQuotes);
}

export const e011UnknownDiagramElement: Rule = {
  meta: {
    code: "E011",
    severity: "error",
    type: "problem",
    docs: {
      description: "Diagram references an element id that does not exist in the workspace",
      rationale:
        "A diagram node that uses a biz42 element id as its Mermaid node id creates a semantic link between the diagram and the model. If the element does not exist, the diagram is inconsistent with the model — it describes a relationship that has no backing entity.",
      biz42Chapter: 0,
      recommended: true,
    },
  },
  check(workspace: Workspace, index: ReferenceIndex): Diagnostic[] {
    const NOTATION_WITH_ELEMENT_REFS = new Set(["sipoc", "turtle", "strategy-map"]);
    const diagnostics: Diagnostic[] = [];
    const knownIds = new Set(index.byId.keys());

    for (const diagram of workspace.diagrams) {
      if (!NOTATION_WITH_ELEMENT_REFS.has(diagram.notation)) continue;
      if (!diagram.source.trim()) continue;

      // Collect subgraph ids — these are structural, not element references
      const subgraphIds = extractMermaidSubgraphIds(diagram.source);

      const tokenPattern = /\b([a-z][a-z0-9]*(?:-[a-z0-9]+)+)\b/gu;
      const seen = new Set<string>();
      let match: RegExpExecArray | null;

      while ((match = tokenPattern.exec(diagram.source)) !== null) {
        const token = match[1]!;
        if (seen.has(token)) continue;
        seen.add(token);

        // Skip structural subgraph ids
        if (subgraphIds.has(token)) continue;

        // Only flag tokens that look like biz42 element ids by prefix
        if (!looksLikeElementId(token)) continue;

        // Skip tokens that only appear inside quoted labels
        if (appearsOnlyInQuotes(diagram.source, token)) continue;

        if (!knownIds.has(token)) {
          diagnostics.push({
            code: "E011",
            severity: "error",
            message: `Diagram '${diagram.id}': node '${token}' is not a known element id`,
            file: diagram.loc.file,
            line: diagram.loc.line,
          });
        }
      }
    }

    return diagnostics;
  },
};
