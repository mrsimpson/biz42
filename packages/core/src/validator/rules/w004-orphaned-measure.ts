import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const w004OrphanedMeasure: Rule = {
  meta: {
    code: "W004",
    severity: "warning",
    type: "problem",
    docs: {
      description: "Orphaned measure — measure is not referenced by any objective",
      rationale:
        "A measure that no objective references is disconnected from the model. It may be stale or was intended for an objective that was never written.",
      biz42Chapter: 7,
      recommended: true,
    },
  },
  check(workspace: Workspace, index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "measure") continue;
      const referencedBy = index.refsTo.get(el.id) ?? [];
      const usedByObjective = referencedBy.some((refId) => {
        const refEl = index.byId.get(refId);
        return refEl?.kind === "objective";
      });
      if (!usedByObjective) {
        diagnostics.push({
          code: "W004",
          severity: "warning",
          message: `Measure '${el.id}' is not referenced by any objective`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
