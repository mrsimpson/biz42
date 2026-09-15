import { e001DuplicateId } from "./e001-duplicate-id.ts";
import { e002UnresolvedReference } from "./e002-unresolved-reference.ts";
import { e003ParseError } from "./e003-parse-error.ts";
import { e004ElementWrongChapter } from "./e004-element-wrong-chapter.ts";
import { w001RiskUnaddressed } from "./w001-risk-unaddressed.ts";
import { w002ObjectiveNoMeasure } from "./w002-objective-no-measure.ts";
import { w003ObjectiveNoOwner } from "./w003-objective-no-owner.ts";
import { w004OrphanedMeasure } from "./w004-orphaned-measure.ts";
import { w005OwnerNoAssignments } from "./w005-owner-no-assignments.ts";
import { w006BlockWithoutProse } from "./w006-block-without-prose.ts";
import { w007MultipleBlocksUnderHeading } from "./w007-multiple-blocks-under-heading.ts";
import { w008OpportunityUnaddressed } from "./w008-opportunity-unaddressed.ts";
import { w009BareMermaid } from "./w009-bare-mermaid.ts";
import { w010MissingSipocInScope } from "./w010-missing-sipoc-in-scope.ts";
import { w011ObjectiveNotAddressing } from "./w011-objective-not-addressing.ts";
import { w012EvaluationNoEvaluates } from "./w012-evaluation-no-evaluates.ts";
import { w013ImprovementAddressesNothing } from "./w013-improvement-addresses-nothing.ts";
import { e011UnknownDiagramElement } from "./e011-unknown-diagram-element.ts";
import { e012SipocDiagramValidation } from "./e012-sipoc-diagram-validation.ts";
import { e013TurtleDiagramValidation } from "./e013-turtle-diagram-validation.ts";
import { e014StrategyMapValidation } from "./e014-strategy-map-validation.ts";
import { h001SignalNoRiskOpportunity } from "./h001-signal-no-risk-opportunity.ts";
import { h002ExpectationNoRiskOpportunity } from "./h002-expectation-no-risk-opportunity.ts";
import { h003CapabilityNoProduct } from "./h003-capability-no-product.ts";
import { h004ProductNoExpectation } from "./h004-product-no-capability.ts";
import { h005RiskOpportunityNoSource } from "./h005-risk-opportunity-no-source.ts";
import { h006ImprovementNoTriggeredBy } from "./h006-improvement-no-triggered-by.ts";
import { h007CapabilityNotRequired } from "./h007-capability-not-required.ts";
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
  w006BlockWithoutProse,
  w007MultipleBlocksUnderHeading,
  w008OpportunityUnaddressed,
  w009BareMermaid,
  w010MissingSipocInScope,
  w011ObjectiveNotAddressing,
  w012EvaluationNoEvaluates,
  w013ImprovementAddressesNothing,
  e011UnknownDiagramElement,
  e012SipocDiagramValidation,
  e013TurtleDiagramValidation,
  e014StrategyMapValidation,
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
