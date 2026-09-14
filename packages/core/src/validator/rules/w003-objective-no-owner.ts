import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const w003ObjectiveNoOwner: Rule = {
  meta: {
    code: "W003",
    severity: "warning",
    type: "problem",
    docs: {
      description: "Objective without owner — objective has no assigned owner",
      rationale:
        "An objective without an owner has no accountability. ISO 9001 §5.3 requires responsibilities to be assigned for quality objectives.",
      biz42Chapter: 6,
      recommended: true,
    },
  },
  check(workspace: Workspace, _index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "objective") continue;
      if (!el.owner) {
        diagnostics.push({
          code: "W003",
          severity: "warning",
          message: `Objective '${el.id}' has no owner assigned`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
