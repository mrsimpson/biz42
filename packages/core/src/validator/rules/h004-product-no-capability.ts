import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const h004ProductNoExpectation: Rule = {
  meta: {
    code: "H004",
    severity: "hint",
    type: "suggestion",
    docs: {
      description: "Product without an expectation — product.fulfills is empty",
      rationale:
        "A product that fulfills no stakeholder expectations has no modelled rationale for its existence. Add fulfills entries to make the stakeholder value explicit.",
      biz42Chapter: 10,
      recommended: true,
    },
  },
  check(workspace: Workspace, _index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const el of workspace.elements) {
      if (el.kind !== "product") continue;
      if (el.fulfills.length === 0) {
        diagnostics.push({
          code: "H004",
          severity: "hint",
          message: `Product '${el.id}' fulfills no expectations`,
          file: el.loc.file,
          line: el.loc.line,
        });
      }
    }
    return diagnostics;
  },
};
