import { e002UnresolvedReference } from "./e002-unresolved-reference.ts";
import { w001RiskUnaddressed } from "./w001-risk-unaddressed.ts";
import { w002ObjectiveNoMeasure } from "./w002-objective-no-measure.ts";
import { w003ObjectiveNoOwner } from "./w003-objective-no-owner.ts";
import { w004OrphanedMeasure } from "./w004-orphaned-measure.ts";
import { w005OwnerNoAssignments } from "./w005-owner-no-assignments.ts";
import { w008OpportunityUnaddressed } from "./w008-opportunity-unaddressed.ts";
import { w010MissingSipocInScope } from "./w010-missing-sipoc-in-scope.ts";
import { w011ObjectiveNotAddressing } from "./w011-objective-not-addressing.ts";
import { w012EvaluationNoEvaluates } from "./w012-evaluation-no-evaluates.ts";
import { w013ImprovementAddressesNothing } from "./w013-improvement-addresses-nothing.ts";
import { e011UnknownDiagramElement } from "./e011-unknown-diagram-element.ts";
import { e012SipocDiagramValidation } from "./e012-sipoc-diagram-validation.ts";
import { e013TurtleDiagramValidation } from "./e013-turtle-diagram-validation.ts";
import { e014StrategyMapValidation } from "./e014-strategy-map-validation.ts";
import { e015BmcDiagramValidation } from "./e015-bmc-diagram-validation.ts";
import { h001SignalNoRiskOpportunity } from "./h001-signal-no-risk-opportunity.ts";
import { h002ExpectationNoRiskOpportunity } from "./h002-expectation-no-risk-opportunity.ts";
import { h003CapabilityNoProduct } from "./h003-capability-no-product.ts";
import { h004ProductNoExpectation } from "./h004-product-no-capability.ts";
import { h005RiskOpportunityNoSource } from "./h005-risk-opportunity-no-source.ts";
import { h006ImprovementNoTriggeredBy } from "./h006-improvement-no-triggered-by.ts";
import { h007CapabilityNotRequired } from "./h007-capability-not-required.ts";
import { genericRules } from "@cli42/lib/rules";
import { ELEMENT_CHAPTER } from "../../model/types.ts";
import type { Rule, ValidationContext } from "../types.ts";

/**
 * Chapter number derived from the file name convention:
 * 01-scope.biz42.md → chapter 1, 06-objectives.biz42.md → chapter 6, etc.
 */
function chapterFromFilePath(filePath: string): number | null {
  const base = filePath.split("/").pop() ?? "";
  const match = /^(\d{2})-/.exec(base);
  if (!match) return null;
  return parseInt(match[1]!, 10);
}

/**
 * The rules every *42 language has (codes EGxx, WGxx), owned by @cli42/lib;
 * in biz42 they are cross-cutting (chapter 0).
 */
const sharedRules: Rule[] = genericRules<ValidationContext>({
  chapters: ELEMENT_CHAPTER,
  chapterOfFile: chapterFromFilePath,
  fenceFlag: "inBiz42Fence",
  fenceDescription: () => "```biz42 fence",
}).map((rule) => ({
  ...rule,
  meta: { ...rule.meta, docs: { ...rule.meta.docs, biz42Chapter: 0 } },
}));

export const builtinRules: readonly Rule[] = [
  ...sharedRules,
  e002UnresolvedReference,
  w001RiskUnaddressed,
  w002ObjectiveNoMeasure,
  w003ObjectiveNoOwner,
  w004OrphanedMeasure,
  w005OwnerNoAssignments,
  w008OpportunityUnaddressed,
  w010MissingSipocInScope,
  w011ObjectiveNotAddressing,
  w012EvaluationNoEvaluates,
  w013ImprovementAddressesNothing,
  e011UnknownDiagramElement,
  e012SipocDiagramValidation,
  e013TurtleDiagramValidation,
  e014StrategyMapValidation,
  e015BmcDiagramValidation,
  h001SignalNoRiskOpportunity,
  h002ExpectationNoRiskOpportunity,
  h003CapabilityNoProduct,
  h004ProductNoExpectation,
  h005RiskOpportunityNoSource,
  h006ImprovementNoTriggeredBy,
  h007CapabilityNotRequired,
];

export const rulesByCode: Readonly<Record<string, Rule>> = Object.fromEntries(
  builtinRules.map((r) => [r.meta.code, r]),
);
