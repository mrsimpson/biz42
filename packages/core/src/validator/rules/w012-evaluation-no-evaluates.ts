import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const w012EvaluationNoEvaluates: Rule = {
  meta: {
    code: "W012",
    severity: "warning",
    type: "problem",
    docs: {
      description:
        "Evaluation with no evaluates entries — evaluation does not reference any measures",
      rationale:
        "An evaluation practice that reviews no measures has nothing concrete to assess. Add evaluates entries to link this practice to the measures it reviews.",
      biz42Chapter: 11,
      recommended: true,
    },
  },
  check(workspace: Workspace, _index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "evaluation") continue;
      if (el.evaluates.length === 0) {
        diagnostics.push({
          code: "W012",
          severity: "warning",
          message: `Evaluation '${el.id}' has no evaluates entries — add the measures this evaluation reviews`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
