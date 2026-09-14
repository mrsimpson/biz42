// explain.ts — provides per-element guidance for the `biz42 explain` CLI command.
// All data is derived from the Zod schemas in schemas.ts — no separate guidance
// constant needed.

import { z } from "zod";
import type { BlockType } from "./ast.ts";
import { ELEMENT_SCHEMAS, deriveFields, type CrossRefMeta } from "./model/schemas.ts";
import { ELEMENT_KIND_ORDER, ELEMENT_CHAPTER, CHAPTER_TITLE } from "./model/types.ts";

// ---------------------------------------------------------------------------
// Public result types
// ---------------------------------------------------------------------------

export interface ExplainFieldResult {
  name: string;
  description: string;
  required: boolean;
  enumValues: string[] | null;
}

export interface ExplainCrossRefResult {
  field: string;
  targetKind: string;
  cardinality: "one" | "many";
}

/** Full guidance for a single block type. */
export interface ExplainResult {
  blockType: BlockType;
  biz42Chapter: number;
  biz42ChapterTitle: string;
  description: string;
  requiredFields: ExplainFieldResult[];
  optionalFields: ExplainFieldResult[];
  crossRefs: ExplainCrossRefResult[];
  authoringTips: string[];
}

/** One-line summary entry for the list view. */
export interface ExplainSummary {
  blockType: BlockType;
  biz42Chapter: number;
  description: string;
}

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

interface SchemaMeta {
  description?: string;
  biz42Chapter?: number;
  crossRefs?: CrossRefMeta[];
  authoringTips?: string[];
}

function buildResult(blockType: BlockType): ExplainResult {
  const schema = ELEMENT_SCHEMAS[blockType];
  const meta = (z.globalRegistry.get(schema) ?? {}) as SchemaMeta;

  const chapter = meta.biz42Chapter ?? ELEMENT_CHAPTER[blockType];
  const description = meta.description ?? blockType;
  const crossRefs = meta.crossRefs ?? [];
  const authoringTips = meta.authoringTips ?? [];

  // deriveFields works on ZodObject
  const objectSchema = schema instanceof z.ZodObject ? schema : null;
  const allFields = objectSchema ? deriveFields(objectSchema) : [];

  return {
    blockType,
    biz42Chapter: chapter,
    biz42ChapterTitle: CHAPTER_TITLE[chapter] ?? `Chapter ${chapter}`,
    description,
    requiredFields: allFields.filter((f) => f.required),
    optionalFields: allFields.filter((f) => !f.required),
    crossRefs: crossRefs.map((cr) => ({
      field: cr.field,
      targetKind: cr.targetKind,
      cardinality: cr.cardinality,
    })),
    authoringTips,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Get full guidance for a single block type. */
export function explainElement(blockType: BlockType): ExplainResult {
  return buildResult(blockType);
}

/** Get one-line summaries for all block types, in chapter order. */
export function formatExplainListText(): string {
  const lines: string[] = ["biz42 block types:\n"];
  for (const kind of ELEMENT_KIND_ORDER) {
    const schema = ELEMENT_SCHEMAS[kind];
    const meta = (z.globalRegistry.get(schema) ?? {}) as SchemaMeta;
    const chapter = meta.biz42Chapter ?? ELEMENT_CHAPTER[kind];
    const desc = meta.description ?? kind;
    lines.push(`  ch.${String(chapter).padStart(2, "0")}  ${kind.padEnd(14)}  ${desc}`);
  }
  return lines.join("\n");
}

/** Format full explain output as human-readable text. */
export function formatExplainText(result: ExplainResult): string {
  const lines: string[] = [];
  lines.push(`Block type: ${result.blockType}`);
  lines.push(`Chapter:    ${result.biz42Chapter} — ${result.biz42ChapterTitle}`);
  lines.push(`\n${result.description}\n`);

  if (result.requiredFields.length > 0) {
    lines.push("Required fields:");
    for (const f of result.requiredFields) {
      const enums = f.enumValues ? ` (${f.enumValues.join(" | ")})` : "";
      lines.push(`  ${f.name}${enums}  — ${f.description}`);
    }
  }

  if (result.optionalFields.length > 0) {
    lines.push("\nOptional fields:");
    for (const f of result.optionalFields) {
      const enums = f.enumValues ? ` (${f.enumValues.join(" | ")})` : "";
      lines.push(`  ${f.name}${enums}  — ${f.description}`);
    }
  }

  if (result.crossRefs.length > 0) {
    lines.push("\nCross-references:");
    for (const cr of result.crossRefs) {
      lines.push(`  ${cr.field} → ${cr.targetKind} (${cr.cardinality})`);
    }
  }

  if (result.authoringTips.length > 0) {
    lines.push("\nAuthoring tips:");
    for (const tip of result.authoringTips) {
      lines.push(`  • ${tip}`);
    }
  }

  return lines.join("\n");
}
