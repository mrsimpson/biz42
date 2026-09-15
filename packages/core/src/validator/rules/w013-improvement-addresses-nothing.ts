import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const w013ImprovementAddressesNothing: Rule = {
  meta: {
    code: "W013",
    severity: "warning",
    type: "problem",
    docs: {
      description: "Improvement addresses nothing — improvement.addresses is empty",
      rationale:
        "An improvement with no addresses entries has no modelled target. It is unclear what in the business model is being changed. Add addresses entries pointing to the objective, capability, or product being improved.",
      biz42Chapter: 12,
      recommended: true,
    },
  },
  check(workspace: Workspace, _index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "improvement") continue;
      if (el.addresses.length === 0) {
        diagnostics.push({
          code: "W013",
          severity: "warning",
          message: `Improvement '${el.id}' has no addresses entries — add the objective, capability, or product this improvement targets`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
