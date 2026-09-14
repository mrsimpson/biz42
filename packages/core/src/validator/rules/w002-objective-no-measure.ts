import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const w002ObjectiveNoMeasure: Rule = {
  meta: {
    code: "W002",
    severity: "warning",
    type: "problem",
    docs: {
      description: "Objective without measure — objective has no measured-by entries",
      rationale:
        "An objective without a measure cannot be evaluated. ISO 9001 §6.2 requires quality objectives to be measurable.",
      biz42Chapter: 6,
      recommended: true,
    },
  },
  check(workspace: Workspace, _index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "objective") continue;
      if (el["measured-by"].length === 0) {
        diagnostics.push({
          code: "W002",
          severity: "warning",
          message: `Objective '${el.id}' has no measured-by entries`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
