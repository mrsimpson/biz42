import { blockNotInFenceRule } from "@cli42/lib/rules";
import type { Rule, RuleDocs, ValidationContext } from "../types.ts";

/**
 * W016 — A :::block is not wrapped in the ```biz42 fence.
 *
 * The canonical authoring convention is to wrap every :::block inside the
 * ```biz42 fence so that standard Markdown renderers display it as a styled,
 * bordered code block instead of rendering the ::: lines as raw text.
 */
export const w016BlockNotInBiz42Fence: Rule = blockNotInFenceRule<ValidationContext, RuleDocs>(
  {
    code: "W016",
    severity: "warning",
    type: "suggestion",
    docs: {
      description:
        "Block is not wrapped in a ```biz42 fence — wrap :::blocks with the fence for proper rendering",
      rationale:
        "Standard Markdown renderers do not understand the :::type syntax and render the delimiter lines as raw text. Wrapping a :::block in the ```biz42 fence causes renderers to display it as a styled, bordered code block, making the document readable in GitHub, VS Code, and AI tools without changing the DSL or the parser output. Diagram metadata must also be inside the fence so the parser can distinguish it from prose.",
      biz42Chapter: 0,
      recommended: true,
    },
  },
  { fenceFlag: "inBiz42Fence", fenceDescription: () => "```biz42 fence" },
);
