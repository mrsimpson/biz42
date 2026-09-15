import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const h007CapabilityNotRequired: Rule = {
  meta: {
    code: "H007",
    severity: "hint",
    type: "suggestion",
    docs: {
      description: "Capability not required by any objective — capability has no strategic driver",
      rationale:
        "A capability that no objective requires has no documented strategic driver. It may be maintained for good reasons, but making the link explicit ensures every capability traces to a commitment.",
      biz42Chapter: 9,
      recommended: true,
    },
  },
  check(workspace: Workspace, index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "capability") continue;
      const referencedBy = index.refsTo.get(el.id) ?? [];
      const requiredByObjective = referencedBy.some((refId) => {
        const refEl = index.byId.get(refId);
        return refEl?.kind === "objective";
      });
      if (!requiredByObjective) {
        diagnostics.push({
          code: "H007",
          severity: "hint",
          message: `Capability '${el.id}' is not required by any objective`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
