// Diagnostic and Rule types for the biz42 validation engine.
// Rule shape is ESLint-inspired (meta.docs, type) with biz42-specific extensions.

import type { Workspace } from "../model/types.ts";
import type { ReferenceIndex } from "../resolver/types.ts";
import type {
  Rule as GenericRule,
  RuleDocs as GenericRuleDocs,
  RuleMeta as GenericRuleMeta,
} from "@cli42/lib/validator";

export type { Diagnostic, RuleType, Severity } from "@cli42/lib/validator";

/** Validation context passed to rules. */
export interface ValidationContext {
  /** How the workspace's notation calls the biz42 fence (WG05), e.g. "```biz42 fence". */
  fenceDescription?: string;
}

/** Which biz42 chapter this rule primarily relates to.
 * 0 = cross-cutting (applies to all chapters)
 */
export type Biz42Chapter = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** Documentation metadata — the engine's rule docs plus the biz42 chapter. */
export interface RuleDocs extends GenericRuleDocs {
  /** Which biz42 chapter this rule belongs to */
  biz42Chapter: Biz42Chapter;
}

/** Full rule metadata */
export type RuleMeta = GenericRuleMeta<RuleDocs>;

/** A single validation rule, run against the fully-built workspace + index. */
export type Rule = GenericRule<Workspace, ReferenceIndex, ValidationContext, RuleDocs>;
