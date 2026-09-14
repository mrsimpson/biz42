import { e001DuplicateId } from "./e001-duplicate-id.ts";
import { e002UnresolvedReference } from "./e002-unresolved-reference.ts";
import { e003ParseError } from "./e003-parse-error.ts";
import { e004ElementWrongChapter } from "./e004-element-wrong-chapter.ts";
import { w001RiskUnaddressed } from "./w001-risk-unaddressed.ts";
import { w002ObjectiveNoMeasure } from "./w002-objective-no-measure.ts";
import { w003ObjectiveNoOwner } from "./w003-objective-no-owner.ts";
import { w004OrphanedMeasure } from "./w004-orphaned-measure.ts";
import { w005OwnerNoAssignments } from "./w005-owner-no-assignments.ts";
import { h001SignalNoRiskOpportunity } from "./h001-signal-no-risk-opportunity.ts";
import { h002ExpectationNoRiskOpportunity } from "./h002-expectation-no-risk-opportunity.ts";
import { h003CapabilityNoProduct } from "./h003-capability-no-product.ts";
import { h004ProductNoCapability } from "./h004-product-no-capability.ts";
import { h005BlockWithoutProse } from "./h005-block-without-prose.ts";
import type { Rule } from "../types.ts";

export const builtinRules: readonly Rule[] = [
  e001DuplicateId,
  e002UnresolvedReference,
  e003ParseError,
  e004ElementWrongChapter,
  w001RiskUnaddressed,
  w002ObjectiveNoMeasure,
  w003ObjectiveNoOwner,
  w004OrphanedMeasure,
  w005OwnerNoAssignments,
  h001SignalNoRiskOpportunity,
  h002ExpectationNoRiskOpportunity,
  h003CapabilityNoProduct,
  h004ProductNoCapability,
  h005BlockWithoutProse,
];

export const rulesByCode: Readonly<Record<string, Rule>> = Object.fromEntries(
  builtinRules.map((r) => [r.meta.code, r]),
);
