import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const h006ImprovementNoTriggeredBy: Rule = {
  meta: {
    code: "H006",
    severity: "hint",
    type: "suggestion",
    docs: {
      description:
        "Improvement with no triggered-by — improvement does not reference an evaluation",
      rationale:
        "An improvement without a triggering evaluation has no documented finding that motivated it. While proactive improvements are valid, making the trigger explicit closes the evaluation → improvement loop.",
      biz42Chapter: 12,
      recommended: true,
    },
  },
  check(workspace: Workspace, _index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "improvement") continue;
      if (!el["triggered-by"]) {
        diagnostics.push({
          code: "H006",
          severity: "hint",
          message: `Improvement '${el.id}' has no triggered-by — add the evaluation that identified the need for this improvement`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
