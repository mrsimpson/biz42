import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const e002UnresolvedReference: Rule = {
  meta: {
    code: "E002",
    severity: "error",
    type: "problem",
    docs: {
      description: "Unresolved reference — all referenced ids must exist in the workspace",
      rationale:
        "A reference to a non-existent id is a broken link. It means the business model is internally inconsistent — an objective addresses a risk that was never defined, or requires a capability that does not exist.",
      biz42Chapter: 0,
      recommended: true,
    },
  },
  check(workspace: Workspace, index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      const refs = index.refsFrom.get(el.id) ?? [];
      for (const ref of refs) {
        const target = index.byId.get(ref);
        if (!target) {
          diagnostics.push({
            code: "E002",
            severity: "error",
            message: `Unresolved reference '${ref}' in element '${el.id}'`,
            file: el.loc.file,
            line: el.loc.line,
          });
          continue;
        }
        // surfaces field must point to risk or opportunity
        if (
          (el.kind === "signal" || el.kind === "expectation") &&
          el.surfaces.includes(ref) &&
          target.kind !== "risk" &&
          target.kind !== "opportunity"
        ) {
          diagnostics.push({
            code: "E002",
            severity: "error",
            message: `Invalid surfaces reference '${ref}' in ${el.kind} '${el.id}' — target must be a risk or opportunity, got '${target.kind}'`,
            file: el.loc.file,
            line: el.loc.line,
          });
        }
      }
    }
    return diagnostics;
  },
};
