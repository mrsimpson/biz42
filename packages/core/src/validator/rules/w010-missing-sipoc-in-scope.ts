import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";
import * as path from "node:path";

/**
 * W010 — The scope chapter (01-*.biz42.md) has no SIPOC diagram.
 *
 * A SIPOC diagram in the scope chapter makes the scope concrete: it shows
 * who supplies inputs (Supplier), what those inputs are (Input), what the
 * organisation does (Process), what it produces (Output), and who receives
 * the value (Customer). Without it, the scope is defined only in prose and
 * structured fields — harder to grasp and audit.
 *
 * Aligns with ISO 9001 §4.3 (scope) and §4.4 (processes).
 */
export const w010MissingSipocInScope: Rule = {
  meta: {
    code: "W010",
    severity: "warning",
    type: "suggestion",
    docs: {
      description:
        "Scope chapter has no SIPOC diagram — add a :::diagram notation: sipoc block to make the process scope concrete",
      rationale:
        "A SIPOC diagram in the scope chapter makes boundaries explicit and auditable: it shows who supplies inputs, what the organisation does, what it produces, and who receives the value. ISO 9001 §4.3 and §4.4 require scope determination and process understanding — a SIPOC addresses both in one artefact.",
      biz42Chapter: 1,
      recommended: true,
    },
  },
  check(workspace: Workspace, _index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    for (const doc of workspace.documents) {
      const basename = path.basename(doc.filePath);
      if (!/^01-.*\.biz42\.md$/.test(basename)) continue;

      const hasScopeBlock = doc.nodes.some(
        (node) => node.kind === "block" && node.blockType === "scope",
      );
      if (!hasScopeBlock) continue;

      // Check for a sipoc diagram in this file
      const hasSipoc = workspace.diagrams.some(
        (d) => d.notation === "sipoc" && d.loc.file === doc.filePath,
      );
      if (hasSipoc) continue;

      const scopeBlock = doc.nodes.find(
        (node) => node.kind === "block" && node.blockType === "scope",
      );
      const line = scopeBlock && "startLine" in scopeBlock ? scopeBlock.startLine : 1;

      diagnostics.push({
        code: "W010",
        severity: "warning",
        message:
          "Scope chapter has no SIPOC diagram — add a :::diagram notation: sipoc block to make the process scope visible",
        file: doc.filePath,
        line,
      });
    }

    return diagnostics;
  },
};
