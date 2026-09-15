/** Mermaid notation understood by the biz42 syntax boundary. */
export type MermaidNotation =
  | "architecture"
  | "sequence"
  | "flowchart"
  | "class"
  | "auto"
  | "sipoc"
  | "turtle"
  | "strategy-map";

export interface MermaidParseRequest {
  notation: MermaidNotation;
  source: string;
}

export interface MermaidParseSuccess {
  ok: true;
  notation: MermaidNotation;
  /** The diagram type selected by Mermaid's parser. */
  diagramType: string;
}

export interface MermaidParseFailure {
  ok: false;
  notation: MermaidNotation;
  message: string;
}

export type MermaidParseResult = MermaidParseSuccess | MermaidParseFailure;

/** Stable parser boundary consumed by biz42 semantic validators. */
export interface MermaidSyntaxParser {
  parse(request: MermaidParseRequest): Promise<MermaidParseResult>;
}
