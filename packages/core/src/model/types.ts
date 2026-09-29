// Meta-model element types for biz42

import type { BlockType, DocumentAst } from "../ast.ts";
import type { IgnoreDirective } from "@cli42/lib/validator";
import type { MermaidNotation } from "../mermaid.ts";
import type { ElementOf, ParseError, ParseWarning, SourceLocation } from "@cli42/lib/model";
import { chaptersOf } from "@cli42/lib/schema";
import { ELEMENT_SCHEMAS } from "./schemas.ts";

export type { IgnoreDirective, ParseError, ParseWarning, SourceLocation };

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
  "cashflow", // ch. 13
] as const;

/** biz42 chapter each element kind belongs to — derived from schema metadata. */
export const ELEMENT_CHAPTER: Readonly<Record<BlockType, number>> = chaptersOf(
  ELEMENT_SCHEMAS,
  "biz42Chapter",
);

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
  13: "Cashflow",
};

// ---------------------------------------------------------------------------
// Element types — derived from Zod schemas + { kind, loc }
// ---------------------------------------------------------------------------

export type Element = ElementOf<typeof ELEMENT_SCHEMAS>;

type ElementKind<K extends BlockType> = Extract<Element, { kind: K }>;

export type Scope = ElementKind<"scope">;
export type Signal = ElementKind<"signal">;
export type Expectation = ElementKind<"expectation">;
export type Risk = ElementKind<"risk">;
export type Opportunity = ElementKind<"opportunity">;
export type Objective = ElementKind<"objective">;
export type Measure = ElementKind<"measure">;
export type Owner = ElementKind<"owner">;
export type Capability = ElementKind<"capability">;
export type Product = ElementKind<"product">;
export type Evaluation = ElementKind<"evaluation">;
export type Improvement = ElementKind<"improvement">;
export type Cashflow = ElementKind<"cashflow">;

/**
 * All diagram notations understood by biz42.
 * `MermaidNotation` covers Mermaid-backed diagrams; `"bmc"` is rendered by a
 * custom React component and is NOT processed by the Mermaid parser.
 */
export type DiagramNotation = MermaidNotation | "bmc";

/** A diagram extracted from a `:::diagram` block in a biz42 document. */
export interface Diagram {
  id: string;
  title?: string;
  notation: DiagramNotation;
  source: string;
  loc: SourceLocation;
}

export interface Workspace {
  elements: Element[];
  parseErrors: ParseError[];
  /** Warnings emitted during parsing — block still parsed successfully (e.g. unknown attributes). */
  parseWarnings?: ParseWarning[];
  /** Raw parsed documents — used by structure-aware validation rules */
  documents: DocumentAst[];
  /** Diagrams extracted from :::diagram blocks */
  diagrams: Diagram[];
  /** Document-scoped ignore directives extracted by the builder */
  ignoreDirectives?: IgnoreDirective[];
}
