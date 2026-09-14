import type { DocumentAst, AstNode } from "../ast.ts";

interface IgnoreMetadata {
  ruleCode: string;
  reason?: string;
  startLine: number;
}

/**
 * Line-oriented parser for .biz42.md files.
 * Parser is intentionally dumb — unknown block types are emitted as-is;
 * the meta-model builder rejects them.
 *
 * Differences from arc42-language parser:
 * - Recognises ```biz42 ... ``` fence (also accepts ```arc42 for compat)
 * - No diagram support (no :::diagram blocks, no bare mermaid)
 * - Simplified — no DiagramNode, BareMermaidNode emitted
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

    // biz42 fence: ```biz42 ... ``` or ```arc42 ... ``` wraps :::blocks
    if (/^```(biz42|arc42)\s*$/.test(line)) {
      inBiz42Fence = true;
      continue;
    }
    if (inBiz42Fence && /^```\s*$/.test(line)) {
      inBiz42Fence = false;
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
