import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const h002ExpectationNoRiskOpportunity: Rule = {
  meta: {
    code: "H002",
    severity: "warning",
    type: "problem",
    docs: {
      description:
        "Expectation with no surfaces entries — expectation does not link to any risk or opportunity",
      rationale:
        "A stakeholder expectation that has not been analysed into risks or opportunities is a planning gap. An unanalysed expectation breaks the context → analysis flow. Use the 'surfaces' field to document which risks and opportunities this expectation reveals.",
      biz42Chapter: 3,
      recommended: true,
    },
  },
  check(workspace: Workspace, _index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "expectation") continue;
      if (el.surfaces.length === 0) {
        diagnostics.push({
          code: "H002",
          severity: "warning",
          message: `Expectation '${el.id}' has no 'surfaces' entries — add the risks or opportunities this expectation reveals`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
