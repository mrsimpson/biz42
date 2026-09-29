// The Markdown notation of biz42: its parser dialect and the shared Markdown
// prose renderer, behind the NotationAdapter every *42 language implements.
import { MarkdownProseRenderer } from "@cli42/lib/markdown";
import type { NotationAdapter, ProseRenderer } from "@cli42/lib/notation";
import type { DocumentAst } from "./ast.ts";
import { MarkdownParser } from "./parser/markdown-parser.ts";
import type { Parser } from "./parser/markdown-parser.ts";

/** NotationAdapter for Markdown (.biz42.md) workspaces. */
export class MarkdownNotationAdapter implements NotationAdapter<"markdown", DocumentAst> {
  readonly notation = "markdown" as const;
  readonly fileExtension = ".biz42.md";
  readonly fenceDescription = "```biz42 fence";

  matchesFile(filename: string): boolean {
    return filename.endsWith(".biz42.md");
  }

  createParser(): Parser {
    return new MarkdownParser();
  }

  createProseRenderer(): ProseRenderer {
    return new MarkdownProseRenderer();
  }

  chapterFilename(number: number, slug: string): string {
    return `${String(number).padStart(2, "0")}-${slug}.biz42.md`;
  }
}
