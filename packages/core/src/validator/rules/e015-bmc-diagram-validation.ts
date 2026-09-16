import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

/**
 * E015 — BMC diagram references an element id that does not exist in the workspace
 * or is the wrong element kind for its slot.
 *
 * Applies to diagrams with notation === "bmc".
 *
 * Validated slots:
 *   value-propositions  → product ids
 *   key-resources       → capability ids
 *   key-activities      → capability ids
 *   channels            → capability ids
 *   cost-structure      → cashflow ids (type: cost)
 *   revenue-streams     → cashflow ids (type: revenue)
 *
 * Free-text slots (key-partners, customer-segments, customer-relationships)
 * are not validated.
 *
 * An entry is considered a biz42 element id reference when it:
 *   - contains no whitespace, AND
 *   - is not surrounded by quotes in the raw source (quotes indicate free text)
 *
 * The YAML is parsed with a minimal inline parser (no library dependency).
 */

interface SlotRule {
  kind: string;
  type?: "revenue" | "cost";
}

const BMC_VALIDATED_SLOTS: Record<string, SlotRule> = {
  "value-propositions": { kind: "product" },
  "key-resources": { kind: "capability" },
  "key-activities": { kind: "capability" },
  channels: { kind: "capability" },
  "cost-structure": { kind: "cashflow", type: "cost" },
  "revenue-streams": { kind: "cashflow", type: "revenue" },
};

/**
 * Minimal YAML list-of-strings parser for the flat BMC format.
 * Returns a map of top-level key → string[] of list items.
 * Strips surrounding quotes from quoted values.
 */
function parseBmcYaml(source: string): Map<string, string[]> {
  const result = new Map<string, string[]>();
  let currentKey: string | null = null;

  for (const rawLine of source.split("\n")) {
    const line = rawLine.trimEnd();

    // Skip blank lines and comment lines
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;

    // Top-level key: "key-name:"
    const keyMatch = /^([a-z][a-z0-9-]*):\s*$/.exec(line);
    if (keyMatch) {
      currentKey = keyMatch[1]!;
      if (!result.has(currentKey)) {
        result.set(currentKey, []);
      }
      continue;
    }

    // List item: "  - value" or "  - 'value'" or '  - "value"'
    if (currentKey !== null) {
      const itemMatch = /^\s+-\s+(.+)$/.exec(line);
      if (itemMatch) {
        let value = itemMatch[1]!.trim();
        // Strip surrounding quotes (single or double)
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        result.get(currentKey)!.push(value);
      }
    }
  }

  return result;
}

/**
 * Returns true when a value looks like a biz42 element id reference
 * (no whitespace — free text entries contain spaces).
 */
function looksLikeElementId(value: string): boolean {
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/.test(value);
}

export const e015BmcDiagramValidation: Rule = {
  meta: {
    code: "E015",
    severity: "error",
    type: "problem",
    docs: {
      description:
        "BMC diagram references an element id that does not exist in the workspace or is placed in the wrong slot",
      rationale:
        "A Business Model Canvas diagram that references element ids which do not exist, or places them in the wrong slot, is inconsistent with the model. Validated slots: value-propositions (products), key-resources/key-activities/channels (capabilities), cost-structure (cashflow costs), revenue-streams (cashflow revenues).",
      biz42Chapter: 0,
      recommended: true,
    },
  },
  check(workspace: Workspace, index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    for (const diagram of workspace.diagrams) {
      if (diagram.notation !== "bmc") continue;
      if (!diagram.source.trim()) continue;

      const slots = parseBmcYaml(diagram.source);

      for (const [slotName, rule] of Object.entries(BMC_VALIDATED_SLOTS)) {
        const entries = slots.get(slotName);
        if (!entries) continue; // slot absent — not required

        for (const entry of entries) {
          if (!looksLikeElementId(entry)) continue; // free text — skip

          const element = index.byId.get(entry);

          if (!element) {
            diagnostics.push({
              code: "E015",
              severity: "error",
              message: `BMC diagram '${diagram.id}': '${entry}' in slot '${slotName}' is not a known element id`,
              file: diagram.loc.file,
              line: diagram.loc.line,
            });
            continue;
          }

          if (element.kind !== rule.kind) {
            diagnostics.push({
              code: "E015",
              severity: "error",
              message: `BMC diagram '${diagram.id}': '${entry}' in slot '${slotName}' must be a ${rule.kind} element, but is a ${element.kind}`,
              file: diagram.loc.file,
              line: diagram.loc.line,
            });
            continue;
          }

          if (rule.type !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cashflowType = (element as any).type as string | undefined;
            if (cashflowType !== rule.type) {
              diagnostics.push({
                code: "E015",
                severity: "error",
                message: `BMC diagram '${diagram.id}': '${entry}' in slot '${slotName}' must be a cashflow with type: ${rule.type}, but has type: ${cashflowType ?? "unknown"}`,
                file: diagram.loc.file,
                line: diagram.loc.line,
              });
            }
          }
        }
      }
    }

    return diagnostics;
  },
};
