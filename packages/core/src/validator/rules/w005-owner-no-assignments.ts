import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const w005OwnerNoAssignments: Rule = {
  meta: {
    code: "W005",
    severity: "warning",
    type: "problem",
    docs: {
      description: "Owner with no assignments — owner is not referenced by any objective",
      rationale:
        "An owner defined in the model but not assigned to any objective is likely a stale entry or a planning gap.",
      biz42Chapter: 8,
      recommended: true,
    },
  },
  check(workspace: Workspace, index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "owner") continue;
      const referencedBy = index.refsTo.get(el.id) ?? [];
      const assignedToObjective = referencedBy.some((refId) => {
        const refEl = index.byId.get(refId);
        return refEl?.kind === "objective";
      });
      if (!assignedToObjective) {
        diagnostics.push({
          code: "W005",
          severity: "warning",
          message: `Owner '${el.id}' is not assigned to any objective`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
