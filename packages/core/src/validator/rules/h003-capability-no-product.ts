import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const h003CapabilityNoProduct: Rule = {
  meta: {
    code: "H003",
    severity: "hint",
    type: "suggestion",
    docs: {
      description: "Capability without a product — capability.enables is empty",
      rationale:
        "A capability that enables no products has no delivery vehicle modelled. Add enables entries to make explicit which products this capability makes possible.",
      biz42Chapter: 9,
      recommended: true,
    },
  },
  check(workspace: Workspace, _index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "capability") continue;
      if (el.enables.length === 0) {
        diagnostics.push({
          code: "H003",
          severity: "hint",
          message: `Capability '${el.id}' enables no products`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
