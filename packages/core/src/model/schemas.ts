// Zod schemas for all 13 biz42 DSL block types.
// These are the single source of truth for field definitions, required/optional,
// enum values, AND all guidance metadata (description, biz42Chapter, crossRefs,
// authoringTips). Nothing is duplicated.
//
// Schema-level metadata is stored via .meta() in Zod's globalRegistry:
//   z.globalRegistry.get(schema) → { description, biz42Chapter, crossRefs, authoringTips }
//
// Field-level metadata is also stored via .meta():
//   z.globalRegistry.get(field) → { description }
//
// required/optional status and enumValues are derived structurally from the
// Zod def tree — see deriveFields().
//
// IMPORTANT: `kind` and `loc` are NOT part of the schemas — they come from the
// AST node and are injected by the builder after a successful parse.

import { z } from "zod";
import type { BlockType } from "../ast.ts";

// ---------------------------------------------------------------------------
// Cross-reference metadata type
// ---------------------------------------------------------------------------

export interface CrossRefMeta {
  field: string;
  targetKind: string;
  cardinality: "one" | "many";
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Optional comma-separated list (field may be absent). */
export const splitListSchema = z
  .string()
  .optional()
  .transform((v) =>
    v && v.trim() !== ""
      ? v
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [],
  );

// ---------------------------------------------------------------------------
// Per-element schemas — all metadata lives in .meta()
// ---------------------------------------------------------------------------

export const ScopeSchema = z
  .object({
    id: z.string().min(1).meta({ description: "Unique identifier (used in cross-references)" }),
    title: z.string().min(1).meta({ description: "Human-readable name of the scope" }),
    included: z
      .string()
      .optional()
      .meta({ description: "What is explicitly within this scope (comma-separated or free text)" }),
    excluded: z.string().optional().meta({
      description: "What is explicitly outside this scope (comma-separated or free text)",
    }),
    parent: z
      .string()
      .optional()
      .meta({ description: "ID of the parent scope when this is a nested or subordinate scope" }),
  })
  .meta({
    description: "Defines the organisation, its purpose, and the boundaries of the business model.",
    biz42Chapter: 1,
    crossRefs: [
      { field: "parent", targetKind: "scope", cardinality: "one" },
    ] satisfies CrossRefMeta[],
    authoringTips: [
      "A biz42 model has exactly one scope block — it is the boundary declaration for the whole model.",
      "Use 'included' and 'excluded' to make the boundary explicit and machine-readable.",
      "Use 'parent' to link this model's scope to a broader organisational scope in a nested model.",
      "Keep the title concise — one short name that any stakeholder can understand.",
      "Align with ISO 9001 §4.3: determine the scope of the quality management system.",
    ],
  });

export const SignalSchema = z
  .object({
    id: z.string().min(1).meta({ description: "Unique identifier" }),
    title: z.string().min(1).meta({ description: "Short name for the signal" }),
    source: z
      .enum(["external", "internal"])
      .optional()
      .meta({ description: "Origin of the signal: 'external' or 'internal'" }),
    surfaces: splitListSchema.meta({
      description:
        "Comma-separated risk or opportunity IDs this signal surfaces — the analytical step from observation to identified risk/opportunity",
    }),
  })
  .meta({
    description:
      "An external or internal factor that could affect the organisation's ability to achieve intended outcomes.",
    biz42Chapter: 2,
    crossRefs: [
      { field: "surfaces", targetKind: "risk or opportunity", cardinality: "many" },
    ] satisfies CrossRefMeta[],
    authoringTips: [
      "Signals come from environmental scanning — PESTLE, SWOT inputs, or customer feedback.",
      "Keep signals factual and observable; avoid mixing in responses (those become risks or opportunities).",
      "Label the source as 'external' (market, regulation) or 'internal' (capacity, culture).",
      "Use 'surfaces' to link each signal to the risks and opportunities it reveals.",
      "Aligns with ISO 9001 §4.1: understanding the organisation and its context.",
    ],
  });

export const ExpectationSchema = z
  .object({
    id: z.string().min(1).meta({ description: "Unique identifier" }),
    title: z.string().min(1).meta({ description: "Short name for the expectation" }),
    source: z
      .string()
      .optional()
      .meta({ description: "Who or what holds this expectation (stakeholder, regulation, etc.)" }),
    surfaces: splitListSchema.meta({
      description:
        "Comma-separated risk or opportunity IDs this expectation surfaces — the analytical step from stakeholder need to identified risk/opportunity",
    }),
  })
  .meta({
    description:
      "A requirement or need of an interested party that must be considered by the business model.",
    biz42Chapter: 3,
    crossRefs: [
      { field: "surfaces", targetKind: "risk or opportunity", cardinality: "many" },
    ] satisfies CrossRefMeta[],
    authoringTips: [
      "Map each expectation to a specific stakeholder (customer, regulator, employee, investor).",
      "Keep expectations distinct from objectives — expectations are inputs, objectives are responses.",
      "Use 'surfaces' to link each expectation to the risks and opportunities it reveals.",
      "Aligns with ISO 9001 §4.2: understanding the needs and expectations of interested parties.",
      "An expectation not addressed by any risk or opportunity via 'surfaces' is a planning gap.",
    ],
  });

export const RiskSchema = z
  .object({
    id: z.string().min(1).meta({ description: "Unique identifier" }),
    title: z.string().min(1).meta({ description: "Short name for the risk" }),
    severity: z
      .enum(["high", "medium", "low"])
      .meta({ description: "How critical this risk is to the business model" }),
    mitigation: z
      .string()
      .optional()
      .meta({ description: "What is being done or could be done to reduce this risk" }),
  })
  .meta({
    description:
      "A potential negative effect on the organisation's ability to achieve its objectives.",
    biz42Chapter: 4,
    crossRefs: [] satisfies CrossRefMeta[],
    authoringTips: [
      "Focus on risks for the organization! Don't include flaws in the product, but rather describe the impact of these flaws that e. g. impact reputation, compliance or similar.",
      "Risk severity is the combination of likelihood and impact — be explicit in the prose.",
      "Every high-severity risk should be addressed by at least one objective.",
      "Include a mitigation plan or note it as accepted/monitored.",
      "Aligns with ISO 9001 §6.1: actions to address risks and opportunities.",
    ],
  });

export const OpportunitySchema = z
  .object({
    id: z.string().min(1).meta({ description: "Unique identifier" }),
    title: z.string().min(1).meta({ description: "Short name for the opportunity" }),
  })
  .meta({
    description:
      "A potential positive outcome the organisation could pursue to improve its business model.",
    biz42Chapter: 5,
    crossRefs: [] satisfies CrossRefMeta[],
    authoringTips: [
      "Opportunities arise from signals and expectations — link them in prose.",
      "An opportunity without an objective addressing it is a missed planning item.",
      "Keep opportunities distinct from objectives — they are identified possibilities, not commitments.",
      "Aligns with ISO 9001 §6.1: actions to address risks and opportunities.",
    ],
  });

export const ObjectiveSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .meta({ description: "Unique identifier (hub of the traceability chain)" }),
    title: z.string().min(1).meta({ description: "Human-readable name for the objective" }),
    addresses: splitListSchema.meta({
      description: "Comma-separated risk or opportunity IDs this objective responds to",
    }),
    "measured-by": splitListSchema.meta({
      description: "Comma-separated measure IDs that define success criteria for this objective",
    }),
    owner: z
      .string()
      .optional()
      .meta({ description: "ID of the owner responsible for this objective" }),
    requires: splitListSchema.meta({
      description: "Comma-separated capability IDs required to achieve this objective",
    }),
  })
  .meta({
    description:
      "A specific, time-bound outcome the organisation is committed to achieving. The hub of the biz42 traceability chain.",
    biz42Chapter: 6,
    crossRefs: [
      { field: "addresses", targetKind: "risk or opportunity", cardinality: "many" },
      { field: "measured-by", targetKind: "measure", cardinality: "many" },
      { field: "owner", targetKind: "owner", cardinality: "one" },
      { field: "requires", targetKind: "capability", cardinality: "many" },
    ] satisfies CrossRefMeta[],
    authoringTips: [
      "Objectives must be SMART — Specific, Measurable, Achievable, Relevant, Time-bound.",
      "Every objective should address at least one risk or opportunity to ensure traceability.",
      "Assign an owner — an objective without accountability is a wish, not a commitment.",
      "Link measures explicitly so progress can be tracked.",
      "Aligns with ISO 9001 §6.2: quality objectives and planning to achieve them.",
    ],
  });

export const MeasureSchema = z
  .object({
    id: z.string().min(1).meta({ description: "Unique identifier" }),
    title: z.string().min(1).meta({ description: "Short name for the measure" }),
    target: z
      .string()
      .optional()
      .meta({ description: "Measurable success criterion (e.g. NPS > 50, defect rate < 1%)" }),
  })
  .meta({
    description: "A measurable criterion that defines whether an objective has been achieved.",
    biz42Chapter: 7,
    crossRefs: [] satisfies CrossRefMeta[],
    authoringTips: [
      "Every measure must be quantifiable — avoid vague targets like 'improve customer satisfaction'.",
      "State the target value and the measurement method in the prose.",
      "A measure not referenced by any objective is an orphan — consider removing it.",
      "Aligns with ISO 9001 §9.1: monitoring, measurement, analysis, and evaluation.",
    ],
  });

export const OwnerSchema = z
  .object({
    id: z.string().min(1).meta({ description: "Unique identifier" }),
    title: z.string().min(1).meta({ description: "Name of the owner (person or role)" }),
    role: z
      .string()
      .optional()
      .meta({ description: "Job title or organisational role of the owner" }),
  })
  .meta({
    description: "A person or role accountable for one or more objectives.",
    biz42Chapter: 8,
    crossRefs: [] satisfies CrossRefMeta[],
    authoringTips: [
      "Owners are people or roles, not teams — accountability must be individual.",
      "An owner with no assigned objectives is unneeded in the model.",
      "Document the role to clarify accountability in organisational context.",
      "Aligns with ISO 9001 §5.1 and §5.3: leadership and organisational roles.",
    ],
  });

export const CapabilitySchema = z
  .object({
    id: z.string().min(1).meta({ description: "Unique identifier" }),
    title: z.string().min(1).meta({ description: "Short name for the capability" }),
    status: z
      .enum(["exists", "planned", "gap"])
      .optional()
      .meta({ description: "Current availability: exists, planned, or gap" }),
    enables: splitListSchema.meta({
      description: "Comma-separated product IDs that this capability enables or delivers through",
    }),
    owner: z
      .string()
      .optional()
      .meta({ description: "ID of the owner accountable for this capability" }),
  })
  .meta({
    description:
      "An organisational ability, skill, or resource required to achieve one or more objectives.",
    biz42Chapter: 9,
    crossRefs: [
      { field: "enables", targetKind: "product", cardinality: "many" },
      { field: "owner", targetKind: "owner", cardinality: "one" },
    ] satisfies CrossRefMeta[],
    authoringTips: [
      "Use status: gap to flag capabilities that must be built or acquired.",
      "A capability not referenced by any objective may be redundant.",
      "Use 'enables' to link capabilities to the products they make possible.",
      "Assign an owner to make accountability explicit.",
      "Capabilities bridge objectives (what we want) and products (how we deliver).",
      "Aligns with ISO 9001 §7.1 and §7.2: resources and competence.",
    ],
  });

export const ProductSchema = z
  .object({
    id: z.string().min(1).meta({ description: "Unique identifier" }),
    title: z.string().min(1).meta({ description: "Name of the product or service" }),
    fulfills: splitListSchema.meta({
      description: "Comma-separated expectation IDs that this product fulfills for stakeholders",
    }),
    owner: z
      .string()
      .optional()
      .meta({ description: "ID of the owner accountable for this product" }),
  })
  .meta({
    description:
      "A product or service delivered by the organisation that fulfils stakeholder expectations.",
    biz42Chapter: 10,
    crossRefs: [
      { field: "fulfills", targetKind: "expectation", cardinality: "many" },
      { field: "owner", targetKind: "owner", cardinality: "one" },
    ] satisfies CrossRefMeta[],
    authoringTips: [
      "Use 'fulfills' to link each product to the stakeholder expectations it satisfies.",
      "A product with no fulfills entries has no modelled stakeholder rationale — add them.",
      "Assign an owner to make delivery accountability explicit.",
      "Products represent the delivery vehicle; capabilities represent the underlying ability.",
      "Aligns with ISO 9001 §8.1: operational planning and control.",
    ],
  });

export const EvaluationSchema = z
  .object({
    id: z.string().min(1).meta({ description: "Unique identifier" }),
    title: z.string().min(1).meta({ description: "Short name for the evaluation practice" }),
    method: z
      .string()
      .optional()
      .meta({ description: "How evaluation is conducted (e.g. quarterly review, audit)" }),
    evaluates: splitListSchema.meta({
      description: "Comma-separated measure IDs that this evaluation reviews against",
    }),
  })
  .meta({
    description:
      "A described practice for evaluating performance, customer satisfaction, or system effectiveness.",
    biz42Chapter: 11,
    crossRefs: [
      { field: "evaluates", targetKind: "measure", cardinality: "many" },
    ] satisfies CrossRefMeta[],
    authoringTips: [
      "Evaluation is a practice, not a single event — describe the cadence and method.",
      "Use 'evaluates' to link this practice to the measures it reviews.",
      "Include both internal performance review and customer satisfaction evaluation.",
      "Aligns with ISO 9001 §9: performance evaluation.",
    ],
  });

export const ImprovementSchema = z
  .object({
    id: z.string().min(1).meta({ description: "Unique identifier" }),
    title: z.string().min(1).meta({ description: "Short name for the improvement action" }),
    type: z.enum(["corrective", "preventive", "innovative"]).meta({
      description:
        "Type of improvement: corrective (fix nonconformity), preventive (prevent failure), innovative (exploit opportunity)",
    }),
    "triggered-by": z
      .string()
      .optional()
      .meta({ description: "ID of the evaluation that triggered this improvement" }),
    addresses: splitListSchema.meta({
      description:
        "Comma-separated objective, capability, or product IDs that this improvement targets",
    }),
  })
  .meta({
    description:
      "A planned or ongoing action to improve the business model in response to evaluation findings.",
    biz42Chapter: 12,
    crossRefs: [
      { field: "triggered-by", targetKind: "evaluation", cardinality: "one" },
      { field: "addresses", targetKind: "objective, capability, or product", cardinality: "many" },
    ] satisfies CrossRefMeta[],
    authoringTips: [
      "Set 'type' to corrective (fix a confirmed problem), preventive (prevent a potential one), or innovative (exploit an opportunity).",
      "Use 'triggered-by' to link this improvement to the evaluation that identified the need.",
      "Use 'addresses' to link to the objective, capability, or product being improved.",
      "Every improvement should address a specific gap identified in evaluation.",
      "Improvements with no addresses entries have no traceability — add them.",
      "Aligns with ISO 9001 §10: improvement.",
    ],
  });

export const CashflowSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .meta({ description: "Unique identifier (e.g. cashflow-subscription-fee)" }),
    title: z.string().min(1).meta({ description: "Short name for the cashflow item" }),
    type: z
      .enum(["revenue", "cost"])
      .meta({ description: "Type: revenue (money in) or cost (money out)" }),
    category: z.string().optional().meta({
      description: "Optional free-text taxonomy (e.g. subscription, salary, infrastructure)",
    }),
    "linked-to": z.string().optional().meta({
      description:
        "ID of a product (for revenue streams) or capability (for costs) this cashflow is tied to",
    }),
    recurrence: z
      .enum(["one-time", "recurring", "variable"])
      .optional()
      .meta({ description: "Payment pattern: one-time, recurring, or variable" }),
  })
  .meta({
    description: "A single revenue stream (revenue) or cost item (cost) in the business model.",
    biz42Chapter: 13,
    crossRefs: [
      { field: "linked-to", targetKind: "product or capability", cardinality: "one" },
    ] satisfies CrossRefMeta[],
    authoringTips: [
      "Set type: revenue or cost.",
      "Link revenue streams to the product they come from using linked-to.",
      "Link costs to the capability they fund using linked-to.",
      "Use category to group related items (e.g. all 'subscription' revenue streams).",
      "Cashflow is outside ISO 9001 scope but complements the business model canvas.",
    ],
  });

// ---------------------------------------------------------------------------
// Schema map — keyed by BlockType for use in builder and explain
// ---------------------------------------------------------------------------

export const ELEMENT_SCHEMAS = {
  scope: ScopeSchema,
  signal: SignalSchema,
  expectation: ExpectationSchema,
  risk: RiskSchema,
  opportunity: OpportunitySchema,
  objective: ObjectiveSchema,
  measure: MeasureSchema,
  owner: OwnerSchema,
  capability: CapabilitySchema,
  product: ProductSchema,
  evaluation: EvaluationSchema,
  improvement: ImprovementSchema,
  cashflow: CashflowSchema,
} as const satisfies Record<BlockType, z.ZodType>;

// ---------------------------------------------------------------------------
// Schema introspection — derive FieldMeta[] from Zod shape + globalRegistry
// ---------------------------------------------------------------------------

export interface FieldMeta {
  name: string;
  description: string;
  required: boolean;
  enumValues: string[] | null;
}

/**
 * Walk a ZodObject's shape and extract field metadata structurally.
 * - required: field def type is not "optional" and not a pipe whose input is "optional"
 * - enumValues: field (or unwrapped optional inner) def type is "enum" → entries keys
 * - description: from globalRegistry.get(field)?.description
 *
 * NOTE: This function inspects Zod v4 internal `_zod.def` structure. It is coupled to
 * zod@4.5.4 (pinned). If Zod is upgraded, verify this function still works correctly.
 */
export function deriveFields(schema: z.ZodObject<z.ZodRawShape>): FieldMeta[] {
  const fields: FieldMeta[] = [];

  for (const [name, field] of Object.entries(schema._zod.def.shape)) {
    const meta = z.globalRegistry.get(field as z.ZodType) as { description?: string } | undefined;
    const description = meta?.description ?? name;

    const def = (field as z.ZodType)._zod.def as unknown as Record<string, unknown>;
    let required = true;
    let enumValues: string[] | null = null;

    if (def["type"] === "optional") {
      required = false;
      const innerDef = (def["innerType"] as z.ZodType)._zod.def as unknown as Record<
        string,
        unknown
      >;
      if (innerDef["type"] === "enum") {
        enumValues = Object.keys(innerDef["entries"] as Record<string, string>);
      }
    } else if (def["type"] === "pipe") {
      // splitListSchema:         pipe(optional(string), transform) → optional
      // splitListRequiredSchema: pipe(string.min(1), transform)    → required
      const inDef = (def["in"] as z.ZodType)._zod.def as unknown as Record<string, unknown>;
      if (inDef["type"] === "optional") {
        required = false;
      }
    } else if (def["type"] === "enum") {
      enumValues = Object.keys(def["entries"] as Record<string, string>);
    }

    fields.push({ name, description, required, enumValues });
  }

  return fields;
}
