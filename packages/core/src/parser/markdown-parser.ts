import type { DocumentAst, AstNode } from "../ast.ts";

interface IgnoreMetadata {
  ruleCode: string;
  reason?: string;
  startLine: number;
}

interface DiagramMetadata {
  id: string;
  title?: string;
  notation: string;
  startLine: number;
}

/**
 * Line-oriented parser for .biz42.md files.
 * Parser is intentionally dumb — unknown block types are emitted as-is;
 * the meta-model builder rejects them.
 *
 * Supported constructs:
 * - ```biz42 ... ``` fence (also accepts ```arc42 for compat)
 * - :::diagram blocks followed by ```mermaid fences → DiagramNode
 * - Bare ```mermaid fences (no :::diagram) → BareMermaidNode
 */
export function parseMarkdown(filePath: string, content: string): DocumentAst {
  const lines = content.split("\n");
  const nodes: AstNode[] = [];

  let openBlock: {
    blockType: string;
    attributes: Record<string, string>;
    startLine: number;
  } | null = null;

  let pendingIgnore: IgnoreMetadata | null = null;
  let inHtmlComment = false;
  let inBiz42Fence = false;

  // Diagram parsing state
  let pendingDiagram: DiagramMetadata | null = null; // after :::diagram, before ```mermaid
  let inMermaidFence: { startLine: number; bare: boolean } | null = null;
  let mermaidLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    const line = lines[i]!;

    // Track HTML comment blocks (<!-- ... -->) and skip their contents.
    if (!inHtmlComment) {
      const openIdx = line.indexOf("<!--");
      if (openIdx !== -1) {
        const closeIdx = line.indexOf("-->", openIdx + 4);
        if (closeIdx === -1) {
          inHtmlComment = true;
        }
        continue;
      }
    } else {
      if (line.includes("-->")) {
        inHtmlComment = false;
      }
      continue;
    }

    // Inside a mermaid fence — collect lines until closing ```
    if (inMermaidFence !== null) {
      if (/^```\s*$/.test(line)) {
        const source = mermaidLines.join("\n");
        if (inMermaidFence.bare) {
          nodes.push({
            kind: "bare-mermaid",
            source,
            startLine: inMermaidFence.startLine,
            endLine: lineNo,
          });
        } else if (pendingDiagram !== null) {
          nodes.push({
            kind: "diagram",
            id: pendingDiagram.id,
            title: pendingDiagram.title,
            notation: pendingDiagram.notation,
            source,
            startLine: pendingDiagram.startLine,
            endLine: lineNo,
          });
          pendingDiagram = null;
        }
        inMermaidFence = null;
        mermaidLines = [];
        continue;
      }
      mermaidLines.push(line);
      continue;
    }

    // biz42 fence: ```biz42 ... ``` or ```arc42 ... ``` wraps :::blocks
    if (/^```(biz42|arc42)\s*$/.test(line)) {
      inBiz42Fence = true;
      continue;
    }
    if (inBiz42Fence && /^```\s*$/.test(line)) {
      inBiz42Fence = false;
      continue;
    }

    // Bare mermaid fence (not inside a biz42 fence, no pending :::diagram)
    if (/^```mermaid\s*$/.test(line)) {
      if (pendingDiagram !== null) {
        // A :::diagram was open — start collecting as DiagramNode
        inMermaidFence = { startLine: lineNo, bare: false };
      } else {
        // No :::diagram — bare mermaid
        inMermaidFence = { startLine: lineNo, bare: true };
      }
      mermaidLines = [];
      continue;
    }

    if (pendingIgnore) {
      if (/^:::\s*$/.test(line)) {
        nodes.push({
          kind: "ignore",
          ruleCode: pendingIgnore.ruleCode,
          reason: pendingIgnore.reason,
          startLine: pendingIgnore.startLine,
          endLine: lineNo,
        });
        pendingIgnore = null;
        continue;
      }
      const contentMatch = /^([^:\s]+)(?:\s+(.*?))?\s*$/.exec(line);
      if (contentMatch) {
        if (/^[a-zA-Z0-9]+[a-zA-Z0-9-]*$/.test(contentMatch[1]!)) {
          pendingIgnore.ruleCode = contentMatch[1]!;
          pendingIgnore.reason = contentMatch[2] ? contentMatch[2].trim() : undefined;
        } else {
          nodes.push({
            kind: "ignore",
            ruleCode: "",
            startLine: pendingIgnore.startLine,
            endLine: pendingIgnore.startLine,
          });
          pendingIgnore = null;
        }
      } else {
        nodes.push({
          kind: "ignore",
          ruleCode: "",
          startLine: pendingIgnore.startLine,
          endLine: pendingIgnore.startLine,
        });
        pendingIgnore = null;
      }
    }

    if (openBlock !== null) {
      // Closing fence
      if (/^:::\s*$/.test(line)) {
        if (openBlock.blockType === "ignore") {
          nodes.push({
            kind: "ignore",
            ruleCode: "",
            reason: undefined,
            startLine: openBlock.startLine,
            endLine: lineNo,
          });
        } else if (openBlock.blockType === "diagram") {
          // :::diagram block closed — set up pendingDiagram to capture the following mermaid fence
          const attrs = openBlock.attributes;
          pendingDiagram = {
            id: attrs["id"] ?? "",
            notation: attrs["notation"] ?? "auto",
            title: attrs["title"],
            startLine: openBlock.startLine,
          };
        } else {
          nodes.push({
            kind: "block",
            blockType: openBlock.blockType,
            attributes: openBlock.attributes,
            startLine: openBlock.startLine,
            endLine: lineNo,
            inBiz42Fence,
          });
        }
        openBlock = null;
        continue;
      }

      // Attribute line: key: value (kebab-case keys allowed)
      const attrMatch = /^([a-z][a-z0-9-]*):\s*(.*)$/.exec(line);
      if (attrMatch) {
        openBlock.attributes[attrMatch[1]!] = attrMatch[2]!;
      }
      continue;
    }

    // Single-line ignore directive (only inside biz42 fence)
    const singleLineIgnore = inBiz42Fence
      ? /^:::ignore\s+([^:\s]+)(?:\s+(.*?))?\s*:::\s*$/.exec(line)
      : null;
    if (singleLineIgnore) {
      nodes.push({
        kind: "ignore",
        ruleCode: singleLineIgnore[1]!,
        reason: singleLineIgnore[2] ? singleLineIgnore[2].trim() : undefined,
        startLine: lineNo,
        endLine: lineNo,
      });
      continue;
    }

    if (inBiz42Fence && /^:::ignore\s*:::$/.test(line)) {
      nodes.push({
        kind: "ignore",
        ruleCode: "",
        reason: undefined,
        startLine: lineNo,
        endLine: lineNo,
      });
      continue;
    }

    if (!inBiz42Fence && /^:::ignore\s*$/.test(line)) {
      nodes.push({ kind: "prose", text: line, line: lineNo });
      continue;
    }

    if (inBiz42Fence && line.startsWith(":::ignore")) {
      const singleLineMatch = /^:::ignore\s+([^:\s]+)(?:\s+(.*?))?\s*:::/.exec(line);
      if (singleLineMatch) {
        nodes.push({
          kind: "ignore",
          ruleCode: singleLineMatch[1]!,
          reason: singleLineMatch[2] ? singleLineMatch[2].trim() : undefined,
          startLine: lineNo,
          endLine: lineNo,
        });
        continue;
      }
      const bareMatch = /^:::ignore\s*$/.exec(line);
      if (bareMatch) {
        pendingIgnore = { ruleCode: "", reason: undefined, startLine: lineNo };
        continue;
      }
      const multiLineMatch = /^:::ignore\s+([^:\s]+)(?:\s+(.*?))?\s*$/.exec(line);
      if (multiLineMatch) {
        pendingIgnore = {
          ruleCode: multiLineMatch[1]!,
          reason: multiLineMatch[2] ? multiLineMatch[2].trim() : undefined,
          startLine: lineNo,
        };
        continue;
      }
    }

    // Opening fence: :::type
    const openMatch = /^:::([a-z][a-z0-9-]*)\s*$/.exec(line);
    if (openMatch) {
      openBlock = {
        blockType: openMatch[1]!,
        attributes: {},
        startLine: lineNo,
      };
      continue;
    }

    // Heading
    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line);
    if (headingMatch) {
      nodes.push({
        kind: "heading",
        level: headingMatch[1]!.length,
        text: headingMatch[2]!.trim(),
        line: lineNo,
      });
      continue;
    }

    // Prose
    nodes.push({ kind: "prose", text: line, line: lineNo });
  }

  // Unclosed block at end of file → emit a parse error node so E003 fires
  if (openBlock !== null) {
    nodes.push({
      kind: "block",
      blockType: "__parse_error__",
      attributes: {
        message: `Unclosed block ':::${openBlock.blockType}' opened at line ${openBlock.startLine} — missing closing ':::'`,
        startLine: String(openBlock.startLine),
      },
      startLine: openBlock.startLine,
      endLine: lines.length,
      inBiz42Fence,
    });
  }

  return { filePath, nodes };
}

export interface Parser {
  parse(filePath: string, content: string): DocumentAst;
}

export class MarkdownParser implements Parser {
  parse(filePath: string, content: string): DocumentAst {
    return parseMarkdown(filePath, content);
  }
}
