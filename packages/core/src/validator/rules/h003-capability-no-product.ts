import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const h003CapabilityNoProduct: Rule = {
  meta: {
    code: "H003",
    severity: "hint",
    type: "suggestion",
    docs: {
      description: "Capability without a product — capability is not enabled by any product",
      rationale:
        "A capability not linked to any product has no delivery vehicle. Consider whether a product should be added or whether the capability is purely internal.",
      biz42Chapter: 9,
      recommended: true,
    },
  },
  check(workspace: Workspace, index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "capability") continue;
      const referencedBy = index.refsTo.get(el.id) ?? [];
      const enabledByProduct = referencedBy.some((refId) => {
        const refEl = index.byId.get(refId);
        return refEl?.kind === "product";
      });
      if (!enabledByProduct) {
        diagnostics.push({
          code: "H003",
          severity: "hint",
          message: `Capability '${el.id}' is not enabled by any product`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
