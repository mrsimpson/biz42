// AST types produced by the parser for biz42 DSL files: the node types of the
// shared Markdown notation, with biz42's blocks and diagrams.

import type {
  BareMermaidNode,
  HeadingNode,
  IgnoreNode,
  MarkdownBlockNode,
  ProseNode,
} from "@cli42/lib/parser";

export type BlockType =
  | "scope"
  | "signal"
  | "expectation"
  | "risk"
  | "opportunity"
  | "objective"
  | "measure"
  | "owner"
  | "capability"
  | "product"
  | "evaluation"
  | "improvement"
  | "cashflow";

export type { BareMermaidNode, HeadingNode, IgnoreNode, ProseNode };

export interface BlockNode extends MarkdownBlockNode {
  /** True when the block was parsed inside a ```biz42 ... ``` wrapper fence. */
  inBiz42Fence: boolean;
}

/**
 * A `:::diagram` block inside a ```biz42 fence, followed by its source fence.
 * The `notation` field comes from the `notation:` attribute; defaults to "auto".
 * The `title` field comes from the `title:` attribute (optional).
 */
export interface DiagramNode {
  kind: "diagram";
  id: string;
  title?: string;
  notation: string;
  source: string;
  startLine: number;
  endLine: number;
}

export type AstNode =
  | HeadingNode
  | ProseNode
  | BlockNode
  | IgnoreNode
  | DiagramNode
  | BareMermaidNode;

export interface DocumentAst {
  filePath: string;
  nodes: AstNode[];
}
