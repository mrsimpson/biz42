import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";
import { extractMermaidSubgraphIds, sourceContainsId } from "../mermaid-utils.ts";

/**
 * E012 — SIPOC diagram structural validation.
 *
 * A SIPOC (Supplier → Input → Process → Output → Customer) diagram must:
 * 1. Contain all five SIPOC subgraphs (supplier, input, process, output, customer)
 * 2. Reference at least one biz42 element in each slot:
 *    - supplier/customer: expectation sources (free text — validated as non-empty prose)
 *    - input: signal or expectation ids
 *    - process: objective ids
 *    - output: product ids
 *
 * biz42 SIPOC convention: subgraph ids must be prefixed with "sipoc-"
 *   e.g. sipoc-supplier, sipoc-input, sipoc-process, sipoc-output, sipoc-customer
 */

const SIPOC_SLOTS = [
  "sipoc-supplier",
  "sipoc-input",
  "sipoc-process",
  "sipoc-output",
  "sipoc-customer",
] as const;
type SipocSlot = (typeof SIPOC_SLOTS)[number];

const SIPOC_ELEMENT_KINDS: Record<SipocSlot, string[]> = {
  "sipoc-supplier": [], // free text — stakeholder names, not element ids
  "sipoc-input": ["signal", "expectation"],
  "sipoc-process": ["objective"],
  "sipoc-output": ["product"],
  "sipoc-customer": [], // free text — stakeholder names, not element ids
};

export const e012SipocDiagramValidation: Rule = {
  meta: {
    code: "E012",
    severity: "error",
    type: "problem",
    docs: {
      description:
        "SIPOC diagram is missing required slots or does not reference biz42 elements in process/input/output slots",
      rationale:
        "A SIPOC diagram that omits slots or uses unresolved element ids is structurally incomplete. The process column must contain objective ids, input must contain signal or expectation ids, and output must contain product ids to maintain traceability between the diagram and the business model.",
      biz42Chapter: 0,
      recommended: true,
    },
  },
  check(workspace: Workspace, index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    for (const diagram of workspace.diagrams) {
      if (diagram.notation !== "sipoc") continue;
      if (!diagram.source.trim()) continue;

      const subgraphIds = extractMermaidSubgraphIds(diagram.source);

      // Check all five slots are present
      for (const slot of SIPOC_SLOTS) {
        if (!subgraphIds.has(slot)) {
          diagnostics.push({
            code: "E012",
            severity: "error",
            message: `SIPOC diagram '${diagram.id}': missing required subgraph '${slot}' — add subgraph ${slot}["..."]`,
            file: diagram.loc.file,
            line: diagram.loc.line,
          });
        }
      }

      // Check that process/input/output slots reference real biz42 element ids
      const slotsToCheck: SipocSlot[] = ["sipoc-input", "sipoc-process", "sipoc-output"];
      for (const slot of slotsToCheck) {
        if (!subgraphIds.has(slot)) continue; // already reported above

        const allowedKinds = SIPOC_ELEMENT_KINDS[slot];
        const matchingElements = workspace.elements.filter((e) => allowedKinds.includes(e.kind));

        const anyFound = matchingElements.some((e) => sourceContainsId(diagram.source, e.id));
        if (!anyFound) {
          const kindList = allowedKinds.join("/");
          diagnostics.push({
            code: "E012",
            severity: "error",
            message: `SIPOC diagram '${diagram.id}': slot '${slot}' contains no ${kindList} element ids — add ${kindList} ids from the workspace`,
            file: diagram.loc.file,
            line: diagram.loc.line,
          });
        }
      }
    }

    return diagnostics;
  },
};
