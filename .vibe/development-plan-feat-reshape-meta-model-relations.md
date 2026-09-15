# Development Plan: biz42 (feat/reshape-meta-model-relations branch)

*Generated on 2026-09-15 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal

Reshape the biz42 meta-model to make the relation set (the verbs connecting model entities) semantically correct and complete, then rebuild the validation rules on top of that corrected foundation.

The outside-in information flow of the model is the primary design constraint. Every relation, every field, and every validation rule must be traceable to a real flow in that chain.

---

## Key Decisions

### D1 — Relations are the foundation; validations build on top

The relation set (fields + edge types in the resolver) must be correct and complete before any validation rules are written or revised. A rule that references a non-existent or inverted relation is meaningless.

### D2 — Only enum where values have semantic consequences for validation

Enum fields are only added when the enum value changes what a validation rule should check. Taxonomy for its own sake is out of scope.

### D3 — `product.enables` is semantically inverted

The existing `product.enables → capability` field is wrong in both verb and direction. A product *draws on* capabilities; a capability *enables* products. The README and model-structure.md confirm: "capabilities enable Products & Services". The field must move from `product` to `capability` and be renamed accordingly.

**Decision:** Add `capability.enables: string[]` (splitListSchema) pointing at products. Remove `product.enables`. Edge relation type stays `"enables"` but edge direction flips: capability → product.

### D4 — `product.requires` replaces `product.enables` for the capability link

Products need to express which capabilities they draw on. Since `capability.enables → product` is now the canonical direction, products reference capabilities via `product.requires → capability`. Wait — on reflection: if `capability.enables → product` already exists, the reverse link (product → capability) is redundant and derivable via `refsTo`. Do NOT add `product.requires` — the graph is already traversable in both directions via `refsTo`.

**Decision:** Products no longer hold any capability reference field. The capability → product link is the only edge. Downstream queries use `refsTo` to ask "which capabilities enable this product?"

### D5 — New fields to complete the feedback loop

The following fields are missing and must be added to their respective schemas:

| Element | New field | Relation type | Target kind |
|---|---|---|---|
| `capability` | `enables` (splitList) | `"enables"` | product |
| `capability` | `owner` (string) | `"owner"` | owner |
| `product` | `fulfills` (splitList) | `"fulfills"` | expectation |
| `product` | `owner` (string) | `"owner"` | owner |
| `evaluation` | `evaluates` (splitList) | `"evaluates"` | measure |
| `improvement` | `triggered-by` (string) | `"triggered-by"` | evaluation |
| `improvement` | `type` (enum) | — | no edge (typing field) |

### D6 — `improvement.addresses` target set narrowed

Current target set: objective, risk, measure. Correct target set: objective, capability, product.

Rationale: An improvement is a concrete change to something in the model. Risks are addressed by objectives, not by improvements directly. Measures are KPI definitions — you don't improve a measure, you improve the thing it measures. The correct targets are the three concrete delivery/commitment elements: objective (revise the commitment), capability (build/change an ability), product (change what's delivered).

Edge relation type: keep `"improvement-addresses"`.

### D7 — `improvement.type` enum is required

Values: `"corrective" | "preventive" | "innovative"`

- `corrective`: fixes a confirmed nonconformity (ISO §10.2)
- `preventive`: removes a potential failure cause before it occurs
- `innovative`: introduces something new to exploit an opportunity (ISO §10.3)

Required because the type affects what validation rules should check: e.g. a `corrective` improvement without an `evaluation` trigger is a red flag; an `innovative` improvement may stand without one.

### D8 — `signal.source` becomes an enum

Values: `"external" | "internal"`

Rationale: model-structure.md defines source as exactly these two values. Free text offers no validation leverage. An `external` signal and an `internal` signal have different analytical implications.

### D9 — New edge relation types required in `resolver/types.ts`

Add: `"enables"` (already exists — reused for capability→product), `"fulfills"`, `"evaluates"`, `"triggered-by"`.

Note: `"enables"` already exists in the Edge union for product→capability. It will now represent capability→product. The semantic meaning of the verb is the same; only the source kind changes.

Remove: The `improvement-addresses` relation's target set changes in meaning but the type string stays.

### D10 — `scope.parent` edge must be wired into the resolver

The field exists in `ScopeSchema` with a `crossRefs` entry but `buildIndex` never creates an edge for it. Add `"parent"` relation type and wire it.

### D11 — Validation rules are IN SCOPE for this branch (revised)

Originally deferred, but with the schema foundation now stable and several rules already half-baked or missing, all validation work is done on this branch. Rules must only be written on top of correct, existing relations — that constraint is now satisfied.

---

## Outside-in Flow Map (captured from exploration)

```
WORLD IN
  signal      ──surfaces──►     risk | opportunity
  expectation ──surfaces──►     risk | opportunity

ANALYSIS → COMMITMENT
  objective   ──addresses──►    risk | opportunity
  objective   ──measured-by──►  measure
  objective   ──owner──►        owner
  objective   ──requires──►     capability

COMMITMENT → DELIVERY
  capability  ──enables──►      product          (moved from product, direction corrected)
  capability  ──owner──►        owner            (new)

DELIVERY → STAKEHOLDERS
  product     ──fulfills──►     expectation      (new)
  product     ──owner──►        owner            (new)

MEASUREMENT → REVIEW
  evaluation  ──evaluates──►    measure          (new)

REVIEW → IMPROVEMENT → LOOP
  improvement ──triggered-by──► evaluation       (new)
  improvement ──addresses──►    objective | capability | product   (targets corrected)

STRUCTURAL
  scope       ──parent──►       scope            (fix: wire into resolver)
```

### Complete edge relation type set (after changes)

`surfaces` | `addresses` | `measured-by` | `owner` | `requires` | `enables` | `fulfills` | `evaluates` | `triggered-by` | `improvement-addresses` | `parent`

---

## Notes

- Stack: TypeScript monorepo, pnpm workspaces, Zod 4 schemas, Vitest tests
- `splitListSchema` = optional comma-separated string → `string[]` after transform
- `crossRefs` metadata in schemas drives the `explain` command and agent authoring tips — must be kept in sync with actual fields
- The example workspace under `examples/acme-emergency/` may contain incorrect relations written by an agent following the old/wrong model — do NOT use it as a reference for correctness
- `deriveFields()` in `schemas.ts` inspects Zod v4 internal `_zod.def` structure — pinned to zod@4.5.4
- `refsFrom` / `refsTo` in ReferenceIndex give bidirectional traversal without duplicating edges

---

## Explore
### Tasks
- [x] Read model/types.ts, model/schemas.ts, resolver/types.ts, resolver/index.ts
- [x] Read docs/model-structure.md in full
- [x] Audit all existing relation fields and edge types
- [x] Identify inverted, missing, and incorrectly typed relations
- [x] Decide on improvement.type enum values
- [x] Decide on signal.source enum
- [x] Decide on improvement.addresses target set
- [x] Capture all decisions in plan

### Completed
- [x] Created development plan file
- [x] Full exploration and decision-making complete

## Plan
### Tasks
- [x] Define all schema changes as a precise diff (field by field)
- [x] Define all resolver changes (new edge types, new cases in buildIndex)
- [x] Define all crossRefs metadata updates
- [x] Identify all files affected
- [x] Check for existing tests that will break and need updating
- [x] Order changes to minimise breakage

### Completed
- [x] All planning tasks completed — see Implementation Specification below

---

## Implementation Specification

### Files touched (in order of execution)

1. `packages/core/src/model/schemas.ts` — field changes (primary)
2. `packages/core/src/resolver/types.ts` — Edge relation union
3. `packages/core/src/resolver/index.ts` — buildIndex cases
4. `packages/core/tests/validator-basics.test.ts` — fix broken test fixtures
5. `packages/core/src/validator/rules/h003-capability-no-product.ts` — logic inverted
6. `packages/core/src/validator/rules/h004-product-no-capability.ts` — logic inverted

---

### Step 1: `model/schemas.ts` — field changes

#### SignalSchema
- `source`: change from `z.string().optional()` to `z.enum(["external", "internal"]).optional()`
- meta description: `"Origin of the signal: 'external' or 'internal'"`

#### CapabilitySchema — add two fields
- `enables`: `splitListSchema` — `"Comma-separated product IDs this capability enables"` — crossRef: `{ field: "enables", targetKind: "product", cardinality: "many" }`
- `owner`: `z.string().optional()` — `"ID of the owner accountable for this capability"` — crossRef: `{ field: "owner", targetKind: "owner", cardinality: "one" }`
- Update crossRefs: was `[]`, becomes the two above
- Update authoringTips to mention enables and owner

#### ProductSchema — remove `enables`, add `fulfills` and `owner`
- REMOVE field: `enables` (the inverted product→capability field)
- ADD `fulfills`: `splitListSchema` — `"Comma-separated expectation IDs this product fulfills"` — crossRef: `{ field: "fulfills", targetKind: "expectation", cardinality: "many" }`
- ADD `owner`: `z.string().optional()` — `"ID of the owner accountable for this product"` — crossRef: `{ field: "owner", targetKind: "owner", cardinality: "one" }`
- Update crossRefs: was `[{ field: "enables", targetKind: "capability", cardinality: "many" }]`, becomes the two above
- Update description: `"A product or service delivered by the organisation that fulfils stakeholder expectations."`
- Update authoringTips accordingly

#### EvaluationSchema — add `evaluates` field
- ADD `evaluates`: `splitListSchema` — `"Comma-separated measure IDs this evaluation reviews"` — crossRef: `{ field: "evaluates", targetKind: "measure", cardinality: "many" }`
- Update crossRefs: was `[]`, becomes the above

#### ImprovementSchema — add `triggered-by` and `type`, update `addresses`
- ADD `triggered-by`: `z.string().optional()` — `"ID of the evaluation that triggered this improvement"` — crossRef: `{ field: "triggered-by", targetKind: "evaluation", cardinality: "one" }`
- ADD `type`: `z.enum(["corrective", "preventive", "innovative"])` (required, no optional) — `"Type of improvement: corrective (fix nonconformity), preventive (prevent failure), innovative (exploit opportunity)"` — no crossRef (typing field, no edge)
- UPDATE `addresses` meta description: `"Comma-separated objective, capability, or product IDs that this improvement targets"` — update crossRef: `{ field: "addresses", targetKind: "objective, capability, or product", cardinality: "many" }`
- Update authoringTips to mention triggered-by, type, and new addresses targets

---

### Step 2: `resolver/types.ts` — Edge relation union

Replace current union:
```
"addresses" | "measured-by" | "owner" | "requires" | "enables" | "improvement-addresses" | "surfaces"
```
With:
```
"surfaces" | "addresses" | "measured-by" | "owner" | "requires" | "enables" | "fulfills" | "evaluates" | "triggered-by" | "improvement-addresses" | "parent"
```

New types: `"fulfills"`, `"evaluates"`, `"triggered-by"`, `"parent"`
Existing `"enables"` stays (now represents capability→product instead of product→capability — string stays, semantics shift).

---

### Step 3: `resolver/index.ts` — buildIndex cases

**Remove** the `product` block that iterates `el.enables`.

**Add** `capability` block:
```ts
} else if (el.kind === "capability") {
  for (const ref of el.enables) {
    edges.push({ from: el.id, to: ref, relation: "enables" });
    addRef(el.id, ref);
  }
  if (el.owner) {
    edges.push({ from: el.id, to: el.owner, relation: "owner" });
    addRef(el.id, el.owner);
  }
}
```

**Add** `product` block (new):
```ts
} else if (el.kind === "product") {
  for (const ref of el.fulfills) {
    edges.push({ from: el.id, to: ref, relation: "fulfills" });
    addRef(el.id, ref);
  }
  if (el.owner) {
    edges.push({ from: el.id, to: el.owner, relation: "owner" });
    addRef(el.id, el.owner);
  }
}
```

**Add** `evaluation` block:
```ts
} else if (el.kind === "evaluation") {
  for (const ref of el.evaluates) {
    edges.push({ from: el.id, to: ref, relation: "evaluates" });
    addRef(el.id, ref);
  }
}
```

**Update** `improvement` block — add `triggered-by`:
```ts
} else if (el.kind === "improvement") {
  if (el["triggered-by"]) {
    edges.push({ from: el.id, to: el["triggered-by"], relation: "triggered-by" });
    addRef(el.id, el["triggered-by"]);
  }
  for (const ref of el.addresses) {
    edges.push({ from: el.id, to: ref, relation: "improvement-addresses" });
    addRef(el.id, ref);
  }
}
```

**Add** `scope` block:
```ts
} else if (el.kind === "scope") {
  if (el.parent) {
    edges.push({ from: el.id, to: el.parent, relation: "parent" });
    addRef(el.id, el.parent);
  }
}
```

---

### Step 4: `tests/validator-basics.test.ts` — fix broken fixtures

- E002 test: objective fixture still has no owner field — this is fine (owner is optional). No change needed.
- W001 test: objective fixture has no `owner` field — fine. No change needed.
- Any fixture using `Product` with `enables` field must be updated to remove `enables` and add `fulfills: []`.
- Currently no product fixtures in the test file — no changes needed.

**One structural concern**: `improvement` now has a required `type` field. Any test fixture creating an improvement must include `type`. Check test file — currently no improvement fixtures. No changes needed.

---

### Step 5: `h003-capability-no-product.ts` — fix inverted logic

Current check: looks at `refsTo` to find products that reference this capability via old `product.enables`.
After change: the edge goes the other way — `capability.enables → product`. So the edge is now `refsFrom`, not `refsTo`.

New logic: a capability with no entries in `el.enables` (empty array) has no delivery vehicle.
Check `el.enables.length === 0` directly on the element — no need to traverse the index.

Update rule description/rationale to match new direction.

---

### Step 6: `h004-product-no-capability.ts` — fix inverted logic

Current check: looks at `el.enables.length === 0` on the product element.
After change: products no longer have an `enables` field. The connection is now `capability.enables → product`.

The concept this rule was checking — "product with no capability link" — is now expressed from the capability side (H003). H004 should be repurposed or removed.

**Decision**: repurpose H004 to check `product.fulfills.length === 0` — "product fulfills no expectation has no stakeholder rationale". This gives H004 a meaningful new role aligned to the corrected model.

Update code, description, rationale, and chapter reference (stays 10).

---

### Test breakage summary

| File | Breaks? | Reason |
|---|---|---|
| `validator-basics.test.ts` | No | No product/improvement/capability fixtures with affected fields |
| `h003-capability-no-product.ts` | Yes (logic) | Traversal direction inverted |
| `h004-product-no-capability.ts` | Yes (field) | `el.enables` removed from Product type |
| All other rule files | No | Do not touch product.enables or improvement.addresses in ways that break |

---

### Build verification after changes

Run: `pnpm --filter @biz42/core test`

TypeScript compile is run implicitly by Vitest (vite-plus). No separate tsc step needed.

---

## Code
### Tasks
- [x] Step 1: Update `packages/core/src/model/schemas.ts`
- [x] Step 2: Update `packages/core/src/resolver/types.ts`
- [x] Step 3: Update `packages/core/src/resolver/index.ts`
- [x] Step 4: Update `packages/core/src/validator/rules/h003-capability-no-product.ts`
- [x] Step 5: Update `packages/core/src/validator/rules/h004-product-no-capability.ts`
- [x] Step 6: Run tests and fix any remaining breakage
- [x] Step 7: Update `docs/model-structure.md` to reflect corrected relations
- [x] Step 8: Upgrade H001/H002 severity from hint → warning
- [x] Step 9: Add W008 — opportunity unaddressed by any objective
- [x] Step 10: Add W011 — objective not addressing any risk or opportunity
- [x] Step 11: Add H005 — risk/opportunity with no signal or expectation pointing to it
- [x] Step 12: Add W012 — evaluation with no evaluates entries
- [x] Step 13: Add H006 — improvement with no triggered-by
- [x] Step 14: Add W013 — improvement with empty addresses
- [x] Step 15: Add H007 — capability not required by any objective
- [x] Step 16: Run all tests; verify no regressions

### Completed
- [x] All schema, resolver, and rule changes applied; TypeScript compiles cleanly; all 5 tests pass
- [x] Additional consumer `packages/cli/src/renderer/text.ts` updated (product.enables → product.fulfills, new capability.enables/owner, evaluation.evaluates, improvement.type/triggered-by)
- [x] `docs/model-structure.md` updated for signal.source enum, capability.enables, product.fulfills, evaluation.evaluates, improvement.type/triggered-by/addresses
- [x] H001/H002 upgraded to severity "warning" (unanalysed signal/expectation breaks Flow 1)
- [x] 7 new validation rules added: W008, W011, W012, W013, H005, H006, H007
- [x] All 21 tests pass; TypeScript compiles cleanly with no errors

---

### Validation Rule Specification (Steps 8–16)

#### Rule code assignment
Check existing codes first to avoid collisions. Existing: E001–E004, E011–E014, W001–W007, W009–W010, H001–H004.
Free slots: W006 is taken (block-without-prose). Need to check actual codes in use.

**Severity rationale:**
- H001/H002 → W: an unanalysed signal/expectation breaks Flow 1 entirely — it's a planning gap, not a style hint
- Opportunity unaddressed → W (same severity as W001 risk unaddressed — symmetric)
- Objective no addresses → W (ISO §6.2 traceability; floating commitment)
- Risk/opportunity no source → H (softer — a risk can legitimately arise from internal analysis without a registered signal)
- Evaluation no evaluates → W (an evaluation practice with no measures has nothing to review)
- Improvement no triggered-by → H (an improvement can be proactive; triggered-by is recommended, not required)
- Improvement no addresses → W (an improvement that changes nothing is incomplete)
- Capability not required by any objective → H (a capability may be maintained without an active objective)

## Commit
### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
