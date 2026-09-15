import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const w008OpportunityUnaddressed: Rule = {
  meta: {
    code: "W008",
    severity: "warning",
    type: "problem",
    docs: {
      description:
        "Opportunity without addressing objective — opportunity is not addressed by any objective",
      rationale:
        "An unaddressed opportunity means the organisation has identified a potential gain but has no objective committing it to pursue it. This is a planning gap symmetric to an unaddressed risk.",
      biz42Chapter: 5,
      recommended: true,
    },
  },
  check(workspace: Workspace, index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "opportunity") continue;
      const referencedBy = index.refsTo.get(el.id) ?? [];
      const addressedByObjective = referencedBy.some((refId) => {
        const refEl = index.byId.get(refId);
        return refEl?.kind === "objective";
      });
      if (!addressedByObjective) {
        diagnostics.push({
          code: "W008",
          severity: "warning",
          message: `Opportunity '${el.id}' is not addressed by any objective`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
