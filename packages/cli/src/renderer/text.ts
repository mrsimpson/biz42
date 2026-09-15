import type { GetResult, WorkspaceView, ElementView, Element } from "@biz42/core";
import { ELEMENT_CHAPTER, CHAPTER_TITLE } from "@biz42/core";
import type { GetRenderer } from "./json.ts";

export class TextGetRenderer implements GetRenderer {
  meta = {
    id: "text",
    description: "Plain text renderer",
    mimeType: "text/plain",
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

    const lines: string[] = [];
    for (const ch of [...chapterElements.keys()].sort((a, b) => a - b)) {
      const els = chapterElements.get(ch)!;
      lines.push(`=== ${CHAPTER_TITLE[ch] ?? `Chapter ${ch}`} (${els.length}) ===`);
      for (const el of els) {
        lines.push(this.renderElementLine(el));
      }
      lines.push("");
    }
    return lines.join("\n");
  }

  private renderElementLine(el: Element): string {
    switch (el.kind) {
      case "scope":
        return `  ${el.id}  ${el.title}`;
      case "signal":
        return `  ${el.id}  ${el.title}${el.source ? `  [${el.source}]` : ""}`;
      case "expectation":
        return `  ${el.id}  ${el.title}${el.source ? `  [${el.source}]` : ""}`;
      case "risk":
        return `  ${el.id}  ${el.title}  [${el.severity}]`;
      case "opportunity":
        return `  ${el.id}  ${el.title}`;
      case "objective": {
        const parts = [`  ${el.id}  ${el.title}`];
        if (el.owner) parts.push(`    owner: ${el.owner}`);
        if (el.addresses.length > 0) parts.push(`    addresses: ${el.addresses.join(", ")}`);
        if (el["measured-by"].length > 0)
          parts.push(`    measured-by: ${el["measured-by"].join(", ")}`);
        return parts.join("\n");
      }
      case "measure":
        return `  ${el.id}  ${el.title}${el.target ? `  → ${el.target}` : ""}`;
      case "owner":
        return `  ${el.id}  ${el.title}${el.role ? `  [${el.role}]` : ""}`;
      case "capability": {
        const parts = [`  ${el.id}  ${el.title}${el.status ? `  [${el.status}]` : ""}`];
        if (el.enables.length > 0) parts.push(`    enables: ${el.enables.join(", ")}`);
        if (el.owner) parts.push(`    owner: ${el.owner}`);
        return parts.join("\n");
      }
      case "product": {
        const parts = [`  ${el.id}  ${el.title}`];
        if (el.fulfills.length > 0) parts.push(`    fulfills: ${el.fulfills.join(", ")}`);
        if (el.owner) parts.push(`    owner: ${el.owner}`);
        return parts.join("\n");
      }
      case "evaluation": {
        const parts = [`  ${el.id}  ${el.title}${el.method ? `  [${el.method}]` : ""}`];
        if (el.evaluates.length > 0) parts.push(`    evaluates: ${el.evaluates.join(", ")}`);
        return parts.join("\n");
      }
      case "improvement": {
        const parts = [`  ${el.id}  ${el.title}  [${el.type}]`];
        if (el["triggered-by"]) parts.push(`    triggered-by: ${el["triggered-by"]}`);
        if (el.addresses.length > 0) parts.push(`    addresses: ${el.addresses.join(", ")}`);
        return parts.join("\n");
      }
    }
  }

  private renderElement(view: ElementView): string {
    const lines: string[] = [];
    const el = view.element;
    lines.push(`${el.kind}: ${el.id}`);
    lines.push(`title: ${el.title}`);
    lines.push(`file:  ${el.loc.file}:${el.loc.line}`);

    if (view.refsFrom.length > 0) {
      lines.push("\nReferences:");
      for (const r of view.refsFrom) {
        lines.push(
          `  → ${r.id}${r.element ? `  (${r.element.kind}: ${r.element.title})` : "  (unresolved)"}`,
        );
      }
    }

    if (view.refsTo.length > 0) {
      lines.push("\nReferenced by:");
      for (const r of view.refsTo) {
        lines.push(`  ← ${r.id}${r.element ? `  (${r.element.kind}: ${r.element.title})` : ""}`);
      }
    }

    return lines.join("\n");
  }
}
