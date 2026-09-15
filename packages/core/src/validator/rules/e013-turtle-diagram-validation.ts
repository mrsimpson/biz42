import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";
import { sourceContainsId } from "../mermaid-utils.ts";

/**
 * E013 — Turtle diagram structural validation.
 *
 * A turtle diagram (ISO 9001 process audit tool) visualises a process with:
 *   - "With what?" → capability ids
 *   - "With whom?" → owner ids
 *   - "How?" → objective ids
 *   - "For whom?" → expectation ids (or free text stakeholders)
 *   - Results → measure ids
 *
 * biz42 turtle convention: the diagram must reference at least one element
 * from each of: capability, owner, objective, measure.
 * (For whom / stakeholders are free text and not validated as element ids.)
 *
 * The central process node should use the id of the relevant objective or scope.
 */

interface TurtleSlot {
  label: string;
  kinds: string[];
}

const TURTLE_SLOTS: TurtleSlot[] = [
  { label: "capability (With what?)", kinds: ["capability"] },
  { label: "owner (With whom?)", kinds: ["owner"] },
  { label: "objective (How?)", kinds: ["objective"] },
  { label: "measure (Results)", kinds: ["measure"] },
];

export const e013TurtleDiagramValidation: Rule = {
  meta: {
    code: "E013",
    severity: "error",
    type: "problem",
    docs: {
      description:
        "Turtle diagram is missing required element references (capability, owner, objective, or measure)",
      rationale:
        "A turtle diagram that omits key slots is incomplete as a process audit artifact. Each slot corresponds to a biz42 element kind: capabilities (with what), owners (with whom), objectives (how), measures (results). Missing slots mean the diagram does not trace back to the business model.",
      biz42Chapter: 0,
      recommended: true,
    },
  },
  check(workspace: Workspace, _index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    for (const diagram of workspace.diagrams) {
      if (diagram.notation !== "turtle") continue;
      if (!diagram.source.trim()) continue;

      for (const slot of TURTLE_SLOTS) {
        const matchingElements = workspace.elements.filter((e) =>
          slot.kinds.includes(e.kind),
        );
        const anyFound = matchingElements.some((e) => sourceContainsId(diagram.source, e.id));
        if (!anyFound) {
          diagnostics.push({
            code: "E013",
            severity: "error",
            message: `Turtle diagram '${diagram.id}': no ${slot.label} element ids found — add ${slot.kinds.join("/")} ids from the workspace`,
            file: diagram.loc.file,
            line: diagram.loc.line,
          });
        }
      }
    }

    return diagnostics;
  },
};
