import type { DocumentAst } from "../ast.ts";
import type { Workspace, Element, ParseError, IgnoreDirective } from "./types.ts";
import { ELEMENT_SCHEMAS } from "./schemas.ts";
import type { BlockType } from "../ast.ts";

/**
 * Map a Zod parse failure into a human-friendly ParseError message.
 */
function zodErrorToMessage(
  blockType: string,
  issues: { path: (string | number)[]; message: string }[],
  attributes: Record<string, string>,
): string {
  const issue = issues[0];
  if (!issue) return `Invalid ${blockType}`;

  const field = issue.path[0];

  if (typeof field === "string") {
    const rawValue = attributes[field];
    const isMissing = rawValue === undefined || rawValue.trim() === "";

    if (isMissing) {
      return `Missing required attribute '${field}'`;
    }

    if (field === "severity") {
      return `Invalid severity — must be high | medium | low`;
    }
    if (field === "status" && blockType === "capability") {
      return `Invalid status — must be exists | planned | gap`;
    }

    return `Invalid value for '${field}' on ${blockType}`;
  }

  return `Invalid ${blockType}: ${issue.message}`;
}

export function buildWorkspace(documents: DocumentAst[]): Workspace {
  const elements: Element[] = [];
  const parseErrors: ParseError[] = [];
  const ignoreDirectives: IgnoreDirective[] = [];

  for (const doc of documents) {
    let currentHeading: string | undefined = undefined;
    let pendingProse: string[] = [];

    for (const node of doc.nodes) {
      if (node.kind === "ignore") {
        if (node.ruleCode.trim() !== "") {
          ignoreDirectives.push({
            ruleCode: node.ruleCode,
            reason: node.reason,
            file: doc.filePath,
            line: node.startLine,
            used: false,
          });
        }
        continue;
      }

      if (node.kind === "heading") {
        currentHeading = node.text;
        pendingProse = [];
        continue;
      }

      if (node.kind === "prose") {
        pendingProse.push(node.text);
        continue;
      }

      if (node.kind !== "block") continue;

      const { blockType, attributes, startLine } = node;
      const file = doc.filePath;
      const proseText = pendingProse.length > 0 ? pendingProse.join("\n") : undefined;
      const loc = { file, line: startLine, heading: currentHeading, prose: proseText };
      pendingProse = [];

      if (!Object.hasOwn(ELEMENT_SCHEMAS, blockType)) {
        // __parse_error__ is a sentinel emitted by the parser for unclosed blocks
        if (blockType === "__parse_error__") {
          parseErrors.push({
            message: attributes["message"] ?? `Unclosed block at line ${startLine}`,
            file,
            line: Number(attributes["startLine"] ?? startLine),
          });
        } else {
          parseErrors.push({
            message: `Unknown block type '${blockType}'`,
            file,
            line: startLine,
          });
        }
        continue;
      }

      const schema = ELEMENT_SCHEMAS[blockType as BlockType];

      // Normalise empty strings to undefined so Zod's optional() treats them as absent
      const normalisedAttrs: Record<string, string | undefined> = {};
      for (const [k, v] of Object.entries(attributes)) {
        normalisedAttrs[k] = v === "" || v.trim() === "" ? undefined : v;
      }

      const result = schema.safeParse(normalisedAttrs);

      if (!result.success) {
        parseErrors.push({
          message: zodErrorToMessage(
            blockType,
            result.error.issues as { path: (string | number)[]; message: string }[],
            attributes,
          ),
          file,
          line: startLine,
        });
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = result.data as any;
      elements.push({ ...data, kind: blockType, loc } as Element);
    }
  }

  return { elements, parseErrors, documents, ignoreDirectives };
}
