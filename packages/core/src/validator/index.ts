import type { Workspace } from "../model/types.ts";
import type { ReferenceIndex } from "../resolver/types.ts";
import type { Diagnostic, ValidationContext } from "./types.ts";
import { builtinRules } from "./rules/index.ts";

const STALE_IGNORE_CODE = "W019";

function applyIgnoreDirectives(workspace: Workspace, diagnostics: Diagnostic[]): Diagnostic[] {
  const directives = workspace.ignoreDirectives ?? [];
  for (const directive of directives) directive.used = false;
  const suppressed = new Set<Diagnostic>();

  for (const directive of [...directives].sort((a, b) => a.line - b.line)) {
    const diagnostic = diagnostics
      .filter(
        (candidate) =>
          !suppressed.has(candidate) &&
          candidate.file === directive.file &&
          candidate.code.toUpperCase() === directive.ruleCode.toUpperCase() &&
          candidate.line >= directive.line,
      )
      .sort((a, b) => a.line - b.line)[0];
    if (diagnostic) {
      directive.used = true;
      suppressed.add(diagnostic);
    }
  }

  const kept = diagnostics.filter((d) => !suppressed.has(d));

  const stale = directives
    .filter((d) => !d.used)
    .map(
      (d): Diagnostic => ({
        code: STALE_IGNORE_CODE,
        severity: "warning",
        message: `Ignore directive for '${d.ruleCode}' did not suppress any diagnostic`,
        file: d.file,
        line: d.line,
      }),
    );
  return [...kept, ...stale];
}

export function validate(
  workspace: Workspace,
  index: ReferenceIndex,
  context?: ValidationContext,
): Diagnostic[] {
  const diagnostics = builtinRules.flatMap((rule) => rule.check(workspace, index, context));
  return applyIgnoreDirectives(workspace, diagnostics);
}
