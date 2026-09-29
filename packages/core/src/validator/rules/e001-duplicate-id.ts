import { duplicateIdRule } from "@cli42/lib/rules";
import type { Rule, RuleDocs } from "../types.ts";

export const e001DuplicateId: Rule = duplicateIdRule<RuleDocs>({
  code: "E001",
  severity: "error",
  type: "problem",
  docs: {
    description: "Duplicate element id — each id must be unique across the workspace",
    rationale:
      "All cross-references in the biz42 DSL are resolved by id. A duplicate id makes references ambiguous and produces unpredictable validation results.",
    biz42Chapter: 0,
    recommended: true,
  },
});
