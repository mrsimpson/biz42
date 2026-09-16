// AST types produced by the parser for biz42 DSL files.

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

export interface HeadingNode {
  kind: "heading";
  level: number;
  text: string;
  line: number;
}

export interface ProseNode {
  kind: "prose";
  text: string;
  line: number;
}

export interface BlockNode {
  kind: "block";
  blockType: string; // raw string — builder rejects unknowns
  attributes: Record<string, string>;
  startLine: number;
  endLine: number;
  /** True when the block was parsed inside a ```biz42 ... ``` wrapper fence. */
  inBiz42Fence: boolean;
}

/** Ignore directive: `:::ignore RULE [reason] :::` inside a ```biz42 fence. */
export interface IgnoreNode {
  kind: "ignore";
  ruleCode: string;
  reason?: string;
  startLine: number;
  endLine: number;
}

/**
 * A `:::diagram` block followed by a ```mermaid fence.
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

/**
 * A bare ```mermaid fence without a preceding `:::diagram` block.
 * Fires W009; still rendered in the webapp.
 */
export interface BareMermaidNode {
  kind: "bare-mermaid";
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
