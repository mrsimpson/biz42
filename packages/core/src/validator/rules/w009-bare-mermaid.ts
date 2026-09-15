import type { Rule, Diagnostic } from "../types.ts";
import type { Workspace } from "../../model/types.ts";
import type { ReferenceIndex } from "../../resolver/types.ts";

/**
 * W009 — A bare ```mermaid fence was found without a preceding :::diagram block.
 *
 * Use :::diagram with id and notation attributes to associate structured metadata
 * with the diagram. A bare fence is still rendered but lacks id and notation context.
 */
export const w009BareMermaid: Rule = {
  meta: {
    code: "W009",
    severity: "warning",
    type: "suggestion",
    docs: {
      description:
        "Bare ```mermaid fence without :::diagram wrapper — wrap with :::diagram to add id and notation",
      rationale:
        "A bare mermaid fence is anonymous: it has no id, no declared notation, and cannot be referenced or validated by notation-specific rules. The :::diagram block adds structured metadata that makes diagrams first-class elements in the biz42 model.",
      biz42Chapter: 0,
      recommended: true,
    },
  },
  check(workspace: Workspace, _index: ReferenceIndex): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    for (const doc of workspace.documents) {
      for (const node of doc.nodes) {
        if (node.kind !== "bare-mermaid") continue;
        diagnostics.push({
          code: "W009",
          severity: "warning",
          message:
            "Bare ```mermaid fence without :::diagram wrapper — add :::diagram block with id and notation attributes",
          file: doc.filePath,
          line: node.startLine,
        });
      }
    }

    return diagnostics;
  },
};
