// Core barrel export for @biz42/core

export {
  validateDocuments,
  getElementsFromDocuments,
  parseBusinessDocument,
  loadWorkspaceFromDocuments,
  processModel,
} from "./biz42.ts";

export type {
  ValidateResult,
  GetDocumentsOptions,
  GetQuery,
  GetResult,
  WorkspaceView,
  ElementView,
  ResolvedRef,
  WorkspacePayload,
} from "./biz42.ts";

export type { Diagnostic, Severity, ValidationContext } from "./validator/types.ts";

export type {
  Element,
  Scope,
  Signal,
  Expectation,
  Risk,
  Opportunity,
  Objective,
  Measure,
  Owner,
  Capability,
  Product,
  Evaluation,
  Improvement,
  Workspace,
  ParseError,
  IgnoreDirective,
  SourceLocation,
} from "./model/types.ts";

export { ELEMENT_KIND_ORDER, ELEMENT_CHAPTER, CHAPTER_TITLE } from "./model/types.ts";

export type { ReferenceIndex, Edge } from "./resolver/types.ts";

export type {
  BlockType,
  AstNode,
  DocumentAst,
  IgnoreNode,
  HeadingNode,
  ProseNode,
  BlockNode,
} from "./ast.ts";

// Rule registry
export { builtinRules, rulesByCode } from "./validator/rules/index.ts";
export type { Rule, RuleMeta, RuleDocs, RuleType, Biz42Chapter } from "./validator/types.ts";

// Explain command API
export { explainElement, formatExplainText, formatExplainListText } from "./explain.ts";
export type {
  ExplainResult,
  ExplainSummary,
  ExplainFieldResult,
  ExplainCrossRefResult,
} from "./explain.ts";

// Schema introspection
export { ELEMENT_SCHEMAS, splitListSchema, deriveFields } from "./model/schemas.ts";
export type { CrossRefMeta, FieldMeta } from "./model/schemas.ts";
