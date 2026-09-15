// Meta-model element types for biz42

import type { BlockType, DocumentAst } from "../ast.ts";
import type { MermaidNotation } from "@biz42/mermaid";
import { z } from "zod";
import {
  ELEMENT_SCHEMAS,
  ScopeSchema,
  SignalSchema,
  ExpectationSchema,
  RiskSchema,
  OpportunitySchema,
  ObjectiveSchema,
  MeasureSchema,
  OwnerSchema,
  CapabilitySchema,
  ProductSchema,
  EvaluationSchema,
  ImprovementSchema,
} from "./schemas.ts";

export interface SourceLocation {
  file: string;
  line: number;
  /** The text of the nearest heading that precedes this element in its source file, if any. */
  heading?: string;
  /** Prose lines between the nearest preceding heading and this element's block, if any. */
  prose?: string;
}

/**
 * Canonical biz42 chapter order for element kinds.
 * Drives rendering order in `get` (workspace view) and all renderers.
 * Alphabetical-by-id sort is applied within each kind.
 */
export const ELEMENT_KIND_ORDER: readonly BlockType[] = [
  "scope", // ch. 1
  "signal", // ch. 2
  "expectation", // ch. 3
  "risk", // ch. 4
  "opportunity", // ch. 5
  "objective", // ch. 6
  "measure", // ch. 7
  "owner", // ch. 8
  "capability", // ch. 9
  "product", // ch. 10
  "evaluation", // ch. 11
  "improvement", // ch. 12
] as const;

/** biz42 chapter each element kind belongs to — derived from schema metadata. */
export const ELEMENT_CHAPTER: Readonly<Record<BlockType, number>> = Object.fromEntries(
  (Object.entries(ELEMENT_SCHEMAS) as [BlockType, z.ZodType][]).map(([kind, schema]) => {
    const meta = z.globalRegistry.get(schema) as { biz42Chapter?: number } | undefined;
    if (meta?.biz42Chapter === undefined) {
      throw new Error(`Schema for '${kind}' is missing biz42Chapter in .meta()`);
    }
    return [kind, meta.biz42Chapter];
  }),
) as Readonly<Record<BlockType, number>>;

/** Human-readable biz42 chapter titles */
export const CHAPTER_TITLE: Readonly<Record<number, string>> = {
  1: "Scope",
  2: "Signals",
  3: "Expectations",
  4: "Risks",
  5: "Opportunities",
  6: "Objectives",
  7: "Measures",
  8: "Owners",
  9: "Capabilities",
  10: "Products and Services",
  11: "Evaluation",
  12: "Improvements",
};

// ---------------------------------------------------------------------------
// Element types — derived from Zod schemas + { kind, loc }
// ---------------------------------------------------------------------------

export type Scope = z.infer<typeof ScopeSchema> & {
  kind: "scope";
  loc: SourceLocation;
};

export type Signal = z.infer<typeof SignalSchema> & {
  kind: "signal";
  loc: SourceLocation;
};

export type Expectation = z.infer<typeof ExpectationSchema> & {
  kind: "expectation";
  loc: SourceLocation;
};

export type Risk = z.infer<typeof RiskSchema> & {
  kind: "risk";
  loc: SourceLocation;
};

export type Opportunity = z.infer<typeof OpportunitySchema> & {
  kind: "opportunity";
  loc: SourceLocation;
};

export type Objective = z.infer<typeof ObjectiveSchema> & {
  kind: "objective";
  loc: SourceLocation;
};

export type Measure = z.infer<typeof MeasureSchema> & {
  kind: "measure";
  loc: SourceLocation;
};

export type Owner = z.infer<typeof OwnerSchema> & {
  kind: "owner";
  loc: SourceLocation;
};

export type Capability = z.infer<typeof CapabilitySchema> & {
  kind: "capability";
  loc: SourceLocation;
};

export type Product = z.infer<typeof ProductSchema> & {
  kind: "product";
  loc: SourceLocation;
};

export type Evaluation = z.infer<typeof EvaluationSchema> & {
  kind: "evaluation";
  loc: SourceLocation;
};

export type Improvement = z.infer<typeof ImprovementSchema> & {
  kind: "improvement";
  loc: SourceLocation;
};

export type Element =
  | Scope
  | Signal
  | Expectation
  | Risk
  | Opportunity
  | Objective
  | Measure
  | Owner
  | Capability
  | Product
  | Evaluation
  | Improvement;

export interface ParseError {
  message: string;
  file: string;
  line: number;
}

export interface IgnoreDirective {
  ruleCode: string;
  reason?: string;
  file: string;
  line: number;
  /** True if at least one diagnostic with matching code and file was suppressed */
  used: boolean;
}

/** A diagram extracted from a `:::diagram` block in a biz42 document. */
export interface Diagram {
  id: string;
  title?: string;
  notation: MermaidNotation;
  source: string;
  loc: SourceLocation;
}

export interface Workspace {
  elements: Element[];
  parseErrors: ParseError[];
  /** Raw parsed documents — used by structure-aware validation rules */
  documents: DocumentAst[];
  /** Diagrams extracted from :::diagram blocks */
  diagrams: Diagram[];
  /** Document-scoped ignore directives extracted by the builder */
  ignoreDirectives?: IgnoreDirective[];
}
