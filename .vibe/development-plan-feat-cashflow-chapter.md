# Development Plan: biz42 (feat/cashflow-chapter branch)

*Generated on 2026-09-16 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal

Add a new optional chapter 13 (`cashflow`) to the biz42 business model DSL that captures money flowing in and out. Each `cashflow` block represents one financial item (a revenue stream or a cost).

The chapter also introduces a new `bmc` (Business Model Canvas) diagram notation with a **custom React renderer** (not Mermaid). The source is authored as YAML specifying the nine BMC building blocks. Element ids referenced in the YAML are validated against the workspace. Free text entries are allowed in all blocks.

## Key Decisions

- **Optional chapter**: Cashflow is outside ISO 9001 scope. No validation errors if absent. Consistent with all other chapters which are optional by nature.
- **One block type, one item per block**: A single `cashflow` block type with a `flow` enum (`inflow` | `outflow`). Authors create one block per item.
- **Cross-references are one-way**: `cashflow` blocks reference `product` (for inflows) and `capability` (for outflows) via an optional `linked-to` field. Products and capabilities do NOT gain a back-reference field.
- **`linked-to` is optional**: A cashflow item may exist without a model linkage (e.g. "office rent" doesn't map to a specific capability).
- **Custom BMC renderer, not Mermaid**: The `bmc` diagram notation uses a custom React component (`BmcDiagram`) instead of Mermaid. `DiagramView` branches on `notation === "bmc"`.
- **BMC source format is YAML**: The nine BMC block contents are authored as YAML. Entries that match known element ids are validated and rendered as clickable links. Free text entries are plain labels.
- **Code fence is ` ```yaml `**: The parser is extended to accept ` ```yaml ` as a diagram source fence when `pendingDiagram` is set. Editors will syntax-highlight it correctly. A bare ` ```yaml ` without a preceding `:::diagram` block is treated as prose — safe, no breakage.
- **Nine BMC blocks**: key-partners, key-activities, key-resources, value-propositions, customer-relationships, channels, customer-segments, cost-structure, revenue-streams.
- **BMC element id validation (E015)**: A new validator rule checks that element ids referenced in `bmc` diagram YAML exist in the workspace with the correct kind. Validates: product ids in `value-propositions`, capability ids in `key-resources`/`key-activities`/`channels`, cashflow outflow ids in `cost-structure`, cashflow inflow ids in `revenue-streams`. Free text entries in `key-partners`, `customer-segments`, `customer-relationships` are not validated.
- **E011 extended**: `cashflow-` added to `ELEMENT_PREFIXES` so cashflow ids in *other* Mermaid diagram types (sipoc, turtle, strategy-map) are also validated. `bmc` itself is excluded from E011 (E015 handles it).
- **Chapter number is 13**: Appended after the existing 12.
- **Full implementation in one PR**: cashflow block type + BMC parser + BMC validator + BMC renderer + e2e test.
- **`bmc` is NOT added to `MermaidNotation`**: It is a notation handled by the custom renderer. The `MermaidSyntaxParser` is not involved and `@biz42/mermaid` is not changed.
- **`DiagramNotation` type introduced in `@biz42/core`**: `Diagram.notation` is widened from `MermaidNotation` to `MermaidNotation | "bmc"`. A local `DiagramNotation` type alias is added to `types.ts`. The builder cast in `builder.ts` is updated to use it. This avoids polluting `@biz42/mermaid` with a non-Mermaid concept.
- **YAML parsed inline (no new dependency)**: E015 and `BmcDiagram` use a simple line-by-line key/list parser — the YAML structure is a flat map of string lists, trivially parseable without a library.

## BMC Block to biz42 Element Mapping

| BMC Block             | biz42 element       | Validation |
|-----------------------|---------------------|------------|
| value-propositions    | `product`           | E015 validates ids |
| key-resources         | `capability`        | E015 validates ids |
| key-activities        | `capability`        | E015 validates ids |
| channels              | `capability`        | E015 validates ids |
| cost-structure        | `cashflow` (outflow)| E015 validates ids |
| revenue-streams       | `cashflow` (inflow) | E015 validates ids |
| key-partners          | free text           | not validated |
| customer-segments     | `expectation`/free  | not validated (source field is free text) |
| customer-relationships| free text           | not validated |

## BMC YAML Source Format

```yaml
key-partners:
  - "Logistics provider"
  - "AWS"
key-resources:
  - capability-alert-delivery
  - capability-location-routing
key-activities:
  - capability-sensor-ingestion
value-propositions:
  - product-alert-service
customer-relationships:
  - "Self-service onboarding"
channels:
  - capability-platform-integration
customer-segments:
  - "Large B2B organisations"
cost-structure:
  - cashflow-cloud-infra
  - cashflow-salaries
revenue-streams:
  - cashflow-subscription-fee
```

## Notes

### Type Architecture: DiagramNotation

`Diagram.notation` in `types.ts` is currently typed as `MermaidNotation` (imported from `@biz42/mermaid`). Since `bmc` is not a Mermaid notation, we add a local type alias:

```ts
// types.ts
import type { MermaidNotation } from "@biz42/mermaid";
export type DiagramNotation = MermaidNotation | "bmc";

export interface Diagram {
  ...
  notation: DiagramNotation;
  ...
}
```

In `builder.ts`, the cast on line 93 becomes:
```ts
const notation = (node.notation || "auto") as DiagramNotation;
```

The import in `builder.ts` changes from `MermaidNotation` to `DiagramNotation`.

`DiagramView.tsx` in `packages/web` also imports `Diagram` — it already works since it reads `diagram.notation` as a string comparison.

### Parser Change (`​```yaml` fence)

In `markdown-parser.ts`, the mermaid fence detection (line 108) is extended:
```ts
// Before:
if (/^```mermaid\s*$/.test(line)) {
// After:
if (/^```mermaid\s*$/.test(line) || (/^```yaml\s*$/.test(line) && pendingDiagram !== null)) {
```

A bare ` ```yaml ` without a `:::diagram` block has `pendingDiagram === null`, so it falls through to prose. Safe.

### Schema Fields for cashflow

```
id:          required  — unique identifier (e.g. cashflow-subscription-fee)
title:       required  — short name
flow:        required  — enum: inflow | outflow
category:    optional  — free text taxonomy (e.g. "subscription", "salary")
linked-to:   optional  — ID of a product (inflow) or capability (outflow)
recurrence:  optional  — enum: one-time | recurring | variable
```

### Inline YAML Parser (shared utility)

Both E015 (validator) and `BmcDiagram` (renderer) need to parse the flat YAML structure. A shared pure function `parseBmcYaml(source: string): Record<string, string[]>` lives in:
- Validator side: inlined in `e015-bmc-diagram-validation.ts` (no cross-package dep)
- Renderer side: inlined in `BmcDiagram.tsx`

The parser handles:
- Top-level keys ending in `:`
- List items starting with `  - ` (with or without quotes)
- Ignores blank lines and comments

### BmcDiagram Component Layout

Classic BMC grid: 5 columns, 2 rows on top + 1 row on bottom.

```
| Key Partners | Key Activities  | Value Props | Customer Rel | Customer Seg |
|              | Key Resources   |             |              |              |
|         Cost Structure         |             |   Revenue Streams            |
```

Entries matching known element ids render as `<a href="#chapter-N-id">title</a>` (same anchor pattern as `buildClickableNodes`). Free text entries render as plain `<span>`. A `data-testid="bmc-diagram"` on the root element supports e2e tests.

### E015 Rule Structure

```ts
// e015-bmc-diagram-validation.ts
const BMC_VALIDATED_SLOTS: Record<string, { kind: string; flow?: "inflow" | "outflow" }> = {
  "value-propositions": { kind: "product" },
  "key-resources":      { kind: "capability" },
  "key-activities":     { kind: "capability" },
  "channels":           { kind: "capability" },
  "cost-structure":     { kind: "cashflow", flow: "outflow" },
  "revenue-streams":    { kind: "cashflow", flow: "inflow" },
};
```

For each entry in a validated slot:
1. If it looks like a biz42 id (matches element prefix pattern), check it exists in workspace with correct kind (and flow for cashflow).
2. If not found → emit E015 error.
3. Free text entries (contain spaces or are quoted strings) → skip.

### e2e Test

New describe block in `serve-ui.spec.ts`:
```ts
test.describe("BMC diagram", () => {
  test("renders the BMC diagram with block headings", async ({ page }) => {
    await page.goto("/#13-cashflow.biz42.md");
    await expect(page.getByTestId("bmc-diagram")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Revenue Streams")).toBeVisible();
    await expect(page.getByText("Cost Structure")).toBeVisible();
  });
});
```

---

## Explore
### Tasks
- [x] Understand the existing block type registration pattern (ast.ts → schemas.ts → types.ts)
- [x] Understand the diagram notation registration pattern (mermaid model → parser → validator)
- [x] Understand how E011 and E01x diagram validation rules work
- [x] Identify all files that need changing for a new block type
- [x] Decide schema fields for cashflow
- [x] Decide BMC diagram notation name, source format, and validation approach
- [x] Understand the rendering pipeline (DiagramView → MermaidDiagram)
- [x] Understand the e2e test setup
- [x] Confirm fence format (```yaml when pendingDiagram is set)
- [x] Confirm BMC uses custom renderer, not Mermaid
- [x] Confirm type architecture: DiagramNotation = MermaidNotation | "bmc" in core, not mermaid package

### Completed
- [x] Created development plan file

## Plan
### Tasks
- [x] Confirm type architecture for DiagramNotation
- [x] Confirm inline YAML parser approach (no new deps)
- [x] Confirm BmcDiagram layout and link pattern
- [x] Write ordered Code phase task list

### Completed
*See Code section below*

## Code
### Tasks

> Execute in order — each task depends on the one above.

**Group A — Core data model (no deps)**

- [x] A1. `packages/core/src/ast.ts` — add `"cashflow"` to `BlockType` union
- [x] A2. `packages/core/src/model/schemas.ts` — add `CashflowSchema` (id, title, flow enum, category?, linked-to?, recurrence?); add to `ELEMENT_SCHEMAS`
- [x] A3. `packages/core/src/model/types.ts` — add `Cashflow` type; add to `Element` union; add `"cashflow"` to `ELEMENT_KIND_ORDER`; add `13: "Cashflow"` to `CHAPTER_TITLE`; add `DiagramNotation = MermaidNotation | "bmc"` type alias; update `Diagram.notation` to `DiagramNotation`
- [x] A4. `packages/core/src/model/builder.ts` — import `DiagramNotation` instead of `MermaidNotation`; update cast on line 93; add a special zodErrorToMessage case for `"flow"` field on cashflow

**Group B — Parser (depends on A)**

- [x] B1. `packages/core/src/parser/markdown-parser.ts` — extend fence detection to also accept ` ```yaml ` when `pendingDiagram !== null`

**Group C — Validator rules (depends on A)**

- [x] C1. `packages/core/src/validator/rules/e011-unknown-diagram-element.ts` — add `"cashflow-"` to `ELEMENT_PREFIXES`; `bmc` notation excluded (not added to `NOTATION_WITH_ELEMENT_REFS`)
- [x] C2. `packages/core/src/validator/rules/e015-bmc-diagram-validation.ts` — **new file**: validates element ids in the six typed BMC slots; inline YAML parser
- [x] C3. `packages/core/src/validator/rules/index.ts` — import and register `e015BmcDiagramValidation`

**Group D — Example content (depends on A, B, C)**

- [x] D1. `examples/acme-emergency/docs/biz42/13-cashflow.biz42.md` — **new file**: cashflow blocks for acme-emergency (subscription fee inflow, platform cost outflow, etc.) + a `:::diagram` block with `notation: bmc` and a ` ```yaml ` source covering all nine BMC slots, referencing real acme-emergency element ids

**Group E — Web renderer (depends on A3)**

- [x] E1. `packages/web/src/BmcDiagram.tsx` — **new file**: custom React component; inline YAML parser; BMC grid layout; element id → clickable anchor; `data-testid="bmc-diagram"`
- [x] E2. `packages/web/src/DiagramView.tsx` — branch on `notation === "bmc"` to render `<BmcDiagram>`; add `bmc` entry to `METHODOLOGY` map with description

**Group F — e2e test (depends on D, E)**

- [x] F1. `packages/web/tests/serve-ui.spec.ts` — add `"BMC diagram"` describe block; navigate to `/#13-cashflow.biz42.md`; assert `data-testid="bmc-diagram"` visible; assert element titles and links visible

**Group G — Verify**

- [x] G1. `pnpm -w build` — TypeScript compiles clean; all packages built successfully
- [x] G2. Core validator + model correct — processModel returns 6 cashflow elements, diagram-bmc with notation "bmc", 0 errors for acme-emergency
- [x] G3. All 12 e2e tests pass (10 pre-existing + 2 new BMC tests)

**Additional fix (not in original plan)**

- [x] X1. `packages/web/src/App.tsx` — `useHashRouter` re-resolves hash after documents load; fixes direct-URL navigation (hash was resolving to doc-index 0 before workspace loaded)

### Completed
- All tasks complete. WIP commits: 3c90248, 9d6f9d3, d8c5755

## Commit
### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
