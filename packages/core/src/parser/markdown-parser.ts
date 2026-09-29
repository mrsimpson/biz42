import { parseMarkdown as parseDialect } from "@cli42/lib/parser";
import type { Parser as NotationParser } from "@cli42/lib/notation";
import type { DocumentAst } from "../ast.ts";
import { BIZ42_DIALECT } from "./dialect.ts";

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
  return parseDialect(filePath, content, BIZ42_DIALECT) as DocumentAst;
}

export type Parser = NotationParser<DocumentAst>;

export class MarkdownParser implements Parser {
  parse(filePath: string, content: string): DocumentAst {
    return parseMarkdown(filePath, content);
  }
}
