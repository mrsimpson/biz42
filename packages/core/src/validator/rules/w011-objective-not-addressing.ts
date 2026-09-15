import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const w011ObjectiveNotAddressing: Rule = {
  meta: {
    code: "W011",
    severity: "warning",
    type: "problem",
    docs: {
      description:
        "Objective without addresses entries — objective does not respond to any risk or opportunity",
      rationale:
        "An objective that addresses no risk or opportunity is a commitment made without business context. ISO 9001 §6.2 requires objectives to be traceable to the risks and opportunities identified in §6.1.",
      biz42Chapter: 6,
      recommended: true,
    },
  },
  check(workspace: Workspace, _index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "objective") continue;
      if (el.addresses.length === 0) {
        diagnostics.push({
          code: "W011",
          severity: "warning",
          message: `Objective '${el.id}' does not address any risk or opportunity`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
