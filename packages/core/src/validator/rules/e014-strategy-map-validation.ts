import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";
import { sourceContainsId } from "../mermaid-utils.ts";

/**
 * E014 — Strategy map diagram structural validation.
 *
 * A strategy map shows objectives linked by cause-and-effect, with references
 * to the risks/opportunities they address and the measures that define success.
 *
 * biz42 strategy-map convention:
 * - Must reference at least one objective id
 * - Every objective id present in the diagram should exist in the workspace
 *   (E011 handles the general case; this rule checks the strategy-map-specific
 *   requirement that objectives are the primary nodes)
 * - Should reference at least one measure id (results / success criteria)
 *
 * Note: financial perspectives are deliberately excluded. The strategy map
 * in biz42 shows the causal chain: risk/opp → objective → measure.
 */
export const e014StrategyMapValidation: Rule = {
  meta: {
    code: "E014",
    severity: "error",
    type: "problem",
    docs: {
      description: "Strategy map diagram must reference at least one objective and one measure",
      rationale:
        "A strategy map without objective ids has no connection to the business model's commitment layer. Without measure ids, success criteria are absent and the map cannot support performance review. Both are required for the diagram to be a useful strategic artefact.",
      biz42Chapter: 0,
      recommended: true,
    },
  },
  check(workspace: Workspace, _index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    for (const diagram of workspace.diagrams) {
      if (diagram.notation !== "strategy-map") continue;
      if (!diagram.source.trim()) continue;

      const objectives = workspace.elements.filter((e) => e.kind === "objective");
      const measures = workspace.elements.filter((e) => e.kind === "measure");

      const hasObjective = objectives.some((e) => sourceContainsId(diagram.source, e.id));
      if (!hasObjective) {
        diagnostics.push({
          code: "E014",
          severity: "error",
          message: `Strategy map '${diagram.id}': no objective ids found — add objective ids from the workspace as diagram nodes`,
          file: diagram.loc.file,
          line: diagram.loc.line,
        });
      }

      const hasMeasure = measures.some((e) => sourceContainsId(diagram.source, e.id));
      if (!hasMeasure) {
        diagnostics.push({
          code: "E014",
          severity: "error",
          message: `Strategy map '${diagram.id}': no measure ids found — add measure ids to show success criteria`,
          file: diagram.loc.file,
          line: diagram.loc.line,
        });
      }
    }

    return diagnostics;
  },
};
