import type {
  GetResult,
  WorkspaceView,
  ElementView,
  Element,
  ResolvedRef,
  SourceLocation,
} from "@biz42/core";
import { ELEMENT_CHAPTER, CHAPTER_TITLE } from "@biz42/core";
import type { GetRenderer } from "./json.ts";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function locLink(loc: SourceLocation): string {
  const label = `${loc.file}:${loc.line}`;
  const slug = loc.heading ? toSlug(loc.heading) : "";
  const href = slug ? `${loc.file}#${slug}` : loc.file;
  return `[${label}](${href})`;
}

function refLink(ref: ResolvedRef): string {
  if (!ref.element) return ref.id;
  const { loc } = ref.element;
  const href = loc.heading ? `${loc.file}#${toSlug(loc.heading)}` : loc.file;
  return `[${ref.id}](${href}) — ${ref.element.kind}`;
}

export class MarkdownGetRenderer implements GetRenderer {
  meta = {
    id: "markdown",
    description: "Markdown renderer with navigable reference links",
    mimeType: "text/markdown",
  };

  render(result: GetResult): string {
    if (result.kind === "workspace") return this.renderWorkspace(result);
    return this.renderElement(result as ElementView);
  }

  private renderWorkspace(view: WorkspaceView): string {
    const chapterElements = new Map<number, Element[]>();
    for (const el of view.elements) {
      const ch = ELEMENT_CHAPTER[el.kind];
      if (!chapterElements.has(ch)) chapterElements.set(ch, []);
      chapterElements.get(ch)!.push(el);
    }

    const title = view.typeFilter
      ? `biz42 Model — ${CHAPTER_TITLE[ELEMENT_CHAPTER[view.typeFilter as import("@biz42/core").BlockType]] ?? view.typeFilter}`
      : "biz42 Business Model";

    const lines = [`# ${title}\n`];
    for (const ch of [...chapterElements.keys()].sort((a, b) => a - b)) {
      const els = chapterElements.get(ch)!;
      lines.push(`## ${CHAPTER_TITLE[ch] ?? `Chapter ${ch}`}\n`);
      for (const el of els) {
        lines.push(`### ${el.id} — ${el.title}\n`);
        lines.push(`*${el.kind}* · ${locLink(el.loc)}\n`);
      }
    }
    return lines.join("\n");
  }

  private renderElement(view: ElementView): string {
    const el = view.element;
    const lines: string[] = [];
    lines.push(`# ${el.kind}: ${el.id}\n`);
    lines.push(`**${el.title}**\n`);
    lines.push(`Source: ${locLink(el.loc)}\n`);

    if (view.refsFrom.length > 0) {
      lines.push("## References\n");
      for (const r of view.refsFrom) lines.push(`- ${refLink(r)}`);
      lines.push("");
    }

    if (view.refsTo.length > 0) {
      lines.push("## Referenced by\n");
      for (const r of view.refsTo) lines.push(`- ${refLink(r)}`);
      lines.push("");
    }

    return lines.join("\n");
  }
}
