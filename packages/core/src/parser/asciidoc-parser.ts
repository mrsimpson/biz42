import { parseAsciidoc as parseDialect } from "@cli42/lib/parser";
import type { DocumentAst } from "../ast.ts";
import { BIZ42_DIALECT } from "./dialect.ts";
import type { Parser } from "./markdown-parser.ts";

/**
 * Line-oriented parser for .biz42.adoc files: the same constructs as
 * .biz42.md, in [source,biz42] + ---- fences, with AsciiDoc headings
 * (= … ======) and comments (//, ////).
 */
export function parseAsciidoc(filePath: string, content: string): DocumentAst {
  return parseDialect(filePath, content, BIZ42_DIALECT) as DocumentAst;
}

export class AsciidocParser implements Parser {
  parse(filePath: string, content: string): DocumentAst {
    return parseAsciidoc(filePath, content);
  }
}
