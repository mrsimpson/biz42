import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

export const e003ParseError: Rule = {
  meta: {
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
  },
  check(workspace: Workspace, _index: ReferenceIndex): Diagnostic[] {
    return workspace.parseErrors.map((err) => ({
      code: "E003",
      severity: "error" as const,
      message: err.message,
      file: err.file,
      line: err.line,
    }));
  },
};
