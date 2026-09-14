import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";
import type { AstNode } from "../../ast.ts";

/**
 * H005: Block without prose — a biz42 block has no accompanying prose text.
 * Checked structurally from the raw AST: for each block node, check that there
 * is at least one non-empty prose line before it (after the nearest heading).
 */
export const h005BlockWithoutProse: Rule = {
  meta: {
    code: "H005",
    severity: "hint",
    type: "suggestion",
    docs: {
      description: "Block without prose — a biz42 block has no prose description in its section",
      rationale:
        "A block without prose relies entirely on its structured fields. Prose adds context, rationale, and narrative that agents and humans need to understand the model.",
      biz42Chapter: 0,
      recommended: true,
    },
  },
  check(workspace: Workspace, _index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    for (const doc of workspace.documents) {
      let pendingProseLines: string[] = [];

      for (const node of doc.nodes as AstNode[]) {
        if (node.kind === "heading") {
          pendingProseLines = [];
          continue;
        }
        if (node.kind === "prose") {
          if (node.text.trim().length > 0) {
            pendingProseLines.push(node.text);
          }
          continue;
        }
        if (node.kind === "block") {
          // Skip error sentinel blocks emitted by the parser
          if (node.blockType === "__parse_error__") {
            pendingProseLines = [];
            continue;
          }
          const hasProse = pendingProseLines.length > 0;
          if (!hasProse) {
            diagnostics.push({
              code: "H005",
              severity: "hint",
              message: `Block '${node.attributes["id"] ?? node.blockType}' has no prose description`,
              file: doc.filePath,
              line: node.startLine,
            });
          }
          pendingProseLines = [];
        }
      }
    }

    return diagnostics;
  },
};
