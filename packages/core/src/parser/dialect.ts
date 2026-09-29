import type { DiagramMetadata, DslDialect } from "@cli42/lib/parser";
import type { DiagramNode } from "../ast.ts";

/** A `:::diagram` block and its source; the notation defaults to "auto". */
function createDiagramNode(
  { attributes, startLine }: DiagramMetadata,
  source: string,
  endLine: number,
): DiagramNode {
  return {
    kind: "diagram",
    id: attributes["id"] ?? "",
    title: attributes["title"],
    notation: attributes["notation"] ?? "auto",
    source,
    startLine,
    endLine,
  };
}

/**
 * The biz42 dialect of the shared DSL: `biz42` fences (```biz42 in Markdown,
 * [source,biz42] + ---- in AsciiDoc) and biz42's diagram nodes.
 */
export const BIZ42_DIALECT: DslDialect<DiagramNode, "inBiz42Fence"> = {
  fences: ["biz42"],
  fenceFlag: "inBiz42Fence",
  createDiagram: createDiagramNode,
};
