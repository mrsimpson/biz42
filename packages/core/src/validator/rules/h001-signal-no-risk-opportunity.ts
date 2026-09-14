import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const h001SignalNoRiskOpportunity: Rule = {
  meta: {
    code: "H001",
    severity: "hint",
    type: "suggestion",
    docs: {
      description:
        "Signal with no surfaces entries — signal does not link to any risk or opportunity",
      rationale:
        "A signal that does not surface any risk or opportunity has not been analysed. Use the 'surfaces' field to document which risks and opportunities this signal reveals.",
      biz42Chapter: 2,
      recommended: true,
    },
  },
  check(workspace: Workspace, _index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "signal") continue;
      if (el.surfaces.length === 0) {
        diagnostics.push({
          code: "H001",
          severity: "hint",
          message: `Signal '${el.id}' has no 'surfaces' entries — add the risks or opportunities this signal reveals`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
