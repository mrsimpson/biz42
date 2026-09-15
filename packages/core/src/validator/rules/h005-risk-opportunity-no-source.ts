import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const h005RiskOpportunityNoSource: Rule = {
  meta: {
    code: "H005",
    severity: "hint",
    type: "suggestion",
    docs: {
      description:
        "Risk or opportunity with no source context — no signal or expectation surfaces it",
      rationale:
        "A risk or opportunity that no signal or expectation points to has no documented source of context. It may have arisen from internal analysis, but making the source explicit strengthens traceability.",
      biz42Chapter: 4,
      recommended: true,
    },
  },
  check(workspace: Workspace, index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "risk" && el.kind !== "opportunity") continue;
      const referencedBy = index.refsTo.get(el.id) ?? [];
      const hasSurface = referencedBy.some((refId) => {
        const refEl = index.byId.get(refId);
        return refEl?.kind === "signal" || refEl?.kind === "expectation";
      });
      if (!hasSurface) {
        diagnostics.push({
          code: "H005",
          severity: "hint",
          message: `${el.kind === "risk" ? "Risk" : "Opportunity"} '${el.id}' has no signal or expectation as source context`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
