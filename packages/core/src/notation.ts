// The notations of biz42 — Markdown (.biz42.md) and AsciiDoc (.biz42.adoc):
// the shared parser with the biz42 dialect and the shared prose renderers,
// behind the NotationAdapter every *42 language implements. Asciidoctor is
// loaded on first use, so Markdown-only callers (and bundles) never load it.
import { MarkdownProseRenderer } from "@cli42/lib/markdown";
import { detectNotation } from "@cli42/lib/notation";
import type { NotationAdapter, ProseRenderer } from "@cli42/lib/notation";
import type { DocumentAst } from "./ast.ts";
import { AsciidocParser } from "./parser/asciidoc-parser.ts";
import { MarkdownParser } from "./parser/markdown-parser.ts";
import type { Parser } from "./parser/markdown-parser.ts";

export type Notation = "markdown" | "asciidoc";

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

/** Renders AsciiDoc prose with the shared renderer, loading Asciidoctor on first use. */
class LazyAsciidocProseRenderer implements ProseRenderer {
  private renderer: Promise<ProseRenderer> | undefined;

  async renderProse(text: string): Promise<string> {
    this.renderer ??= import("@cli42/lib/asciidoc").then(
      ({ AsciidocProseRenderer }) => new AsciidocProseRenderer(),
    );
    return (await this.renderer).renderProse(text);
  }
}

/** NotationAdapter for AsciiDoc (.biz42.adoc) workspaces. */
export class AsciidocNotationAdapter implements NotationAdapter<"asciidoc", DocumentAst> {
  readonly notation = "asciidoc" as const;
  readonly fileExtension = ".biz42.adoc";
  readonly fenceDescription = "[source,biz42] / ---- fence";

  matchesFile(filename: string): boolean {
    return filename.endsWith(".biz42.adoc");
  }

  createParser(): Parser {
    return new AsciidocParser();
  }

  createProseRenderer(): ProseRenderer {
    return new LazyAsciidocProseRenderer();
  }

  chapterFilename(number: number, slug: string): string {
    return `${String(number).padStart(2, "0")}-${slug}.biz42.adoc`;
  }
}

export const NOTATIONS = {
  markdown: new MarkdownNotationAdapter(),
  asciidoc: new AsciidocNotationAdapter(),
} as const satisfies Record<Notation, NotationAdapter<Notation, DocumentAst>>;

/** A business model document, in either notation, by its path. */
export function isBusinessModelDocument(path: string): boolean {
  return Object.values(NOTATIONS).some((adapter) => adapter.matchesFile(path));
}

/** The notation adapter of one document; Markdown unless it is a .biz42.adoc file. */
export function notationOfFile(path: string): MarkdownNotationAdapter | AsciidocNotationAdapter {
  return NOTATIONS.asciidoc.matchesFile(path) ? NOTATIONS.asciidoc : NOTATIONS.markdown;
}

/**
 * The notation of a workspace from its document paths; Markdown when there
 * are none. A workspace mixing both notations is refused.
 */
export function detectWorkspaceNotation(paths: readonly string[], location: string): Notation {
  return detectNotation<Notation>(
    paths,
    Object.values(NOTATIONS).map((adapter) => [adapter.notation, adapter.fileExtension] as const),
    location,
  );
}
