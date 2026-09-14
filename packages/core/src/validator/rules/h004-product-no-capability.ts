import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const h004ProductNoCapability: Rule = {
  meta: {
    code: "H004",
    severity: "hint",
    type: "suggestion",
    docs: {
      description: "Product without a capability — product.enables is empty",
      rationale:
        "A product that enables no capabilities has no modelled link to the organisation's ability chain. Add enables entries to make the relationship explicit.",
      biz42Chapter: 10,
      recommended: true,
    },
  },
  check(workspace: Workspace, _index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "product") continue;
      if (el.enables.length === 0) {
        diagnostics.push({
          code: "H004",
          severity: "hint",
          message: `Product '${el.id}' has no enables entries`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
