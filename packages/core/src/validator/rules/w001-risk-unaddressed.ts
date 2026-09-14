import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const w001RiskUnaddressed: Rule = {
  meta: {
    code: "W001",
    severity: "warning",
    type: "problem",
    docs: {
      description: "Risk without addressing objective — risk is not addressed by any objective",
      rationale:
        "An unaddressed risk means the organisation has identified a threat but has no objective committing it to a response. This is a planning gap.",
      biz42Chapter: 4,
      recommended: true,
    },
  },
  check(workspace: Workspace, index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "risk") continue;
      const referencedBy = index.refsTo.get(el.id) ?? [];
      const addressedByObjective = referencedBy.some((refId) => {
        const refEl = index.byId.get(refId);
        return refEl?.kind === "objective";
      });
      if (!addressedByObjective) {
        diagnostics.push({
          code: "W001",
          severity: "warning",
          message: `Risk '${el.id}' is not addressed by any objective`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
