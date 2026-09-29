import { parseMarkdown as parseDialect } from "@cli42/lib/parser";
import type { DiagramMetadata, MarkdownDialect } from "@cli42/lib/parser";
import type { Parser as NotationParser } from "@cli42/lib/notation";
import type { DiagramNode, DocumentAst } from "../ast.ts";

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

/** The biz42 dialect of the shared Markdown notation: ```biz42 fences. */
const BIZ42_MARKDOWN: MarkdownDialect<DiagramNode, "inBiz42Fence"> = {
  fences: ["biz42"],
  fenceFlag: "inBiz42Fence",
  createDiagram: createDiagramNode,
};

/**
 * Line-oriented parser for .biz42.md files.
 * Parser is intentionally dumb — unknown block types are emitted as-is;
 * the meta-model builder rejects them.
 *
 * Supported constructs:
 * - ```biz42 ... ``` fence wrapping :::blocks, :::ignore and :::diagram
 * - a :::diagram block followed by its source fence (```mermaid, or ```yaml
 *   for bmc) → DiagramNode
 * - bare ```mermaid fences (no :::diagram) → BareMermaidNode
 */
export function parseMarkdown(filePath: string, content: string): DocumentAst {
  return parseDialect(filePath, content, BIZ42_MARKDOWN) as DocumentAst;
}

export type Parser = NotationParser<DocumentAst>;

export class MarkdownParser implements Parser {
  parse(filePath: string, content: string): DocumentAst {
    return parseMarkdown(filePath, content);
  }
}
