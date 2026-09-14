// Diagnostic and Rule types for the biz42 validation engine.
// Rule shape is ESLint-inspired (meta.docs, type) with biz42-specific extensions.

import type { Workspace } from "../model/types.ts";
import type { ReferenceIndex } from "../resolver/types.ts";

export type Severity = "error" | "warning" | "hint";

export interface Diagnostic {
  code: string;
  severity: Severity;
  message: string;
  file: string;
  line: number;
}

/** Validation context passed to rules. */
export interface ValidationContext {
  // reserved for future use (e.g. path evidence)
}

/** Which biz42 chapter this rule primarily relates to.
 * 0 = cross-cutting (applies to all chapters)
 */
export type Biz42Chapter = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Rule type — mirrors ESLint's RuleType vocabulary:
 * - "problem"     → likely incorrect / broken (maps to error/warning)
 * - "suggestion"  → not wrong, but could be better (maps to hint)
 */
export type RuleType = "problem" | "suggestion";

/** Documentation metadata */
export interface RuleDocs {
  /** One-line description */
  description: string;
  /** Why this rule exists */
  rationale: string;
  /** Which biz42 chapter this rule belongs to */
  biz42Chapter: Biz42Chapter;
  /** Whether the rule is enabled by default */
  recommended: boolean;
  /** Optional URL to extended documentation */
  url?: string;
}

/** Full rule metadata */
export interface RuleMeta {
  /** Rule code, e.g. "E001". Never changes once assigned. */
  code: string;
  /** Default severity for this rule */
  severity: Severity;
  /** Rule type */
  type: RuleType;
  /** Human-readable docs */
  docs: RuleDocs;
}

/** A single validation rule. Inspired by ESLint's RuleDefinition. */
export interface Rule {
  meta: RuleMeta;
  /** Run this rule against the fully-built workspace + index */
  check(workspace: Workspace, index: ReferenceIndex, context?: ValidationContext): Diagnostic[];
}
