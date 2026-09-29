import { parseErrorRule } from "@cli42/lib/rules";
import type { Rule, RuleDocs } from "../types.ts";

export const e003ParseError: Rule = parseErrorRule<RuleDocs>({
  code: "E003",
  severity: "error",
  type: "problem",
  docs: {
    description: "Parse error — unknown block type or missing required field",
    rationale:
      "A block that cannot be parsed is excluded from the workspace model entirely. Every parse error means the author's intent was not captured.",
    biz42Chapter: 0,
    recommended: true,
  },
});
