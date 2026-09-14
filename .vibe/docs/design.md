# Design Document

The design of biz42 mirrors arc42-language exactly.
See `docs/arc42/04-solution-strategy.arc42.md` and `docs/arc42/05-building-blocks.arc42.md`
for the authoritative design documentation.

## biz42-specific Adaptations

### DSL Block Types
Where arc42-language has 13 block types mapping to arc42 chapters, biz42 has 12 block types
mapping to ISO 9001 sections:

| biz42 Block Type  | ISO 9001 | Chapter |
|-------------------|----------|---------|
| `scope`           | 4.3      | 01      |
| `signal`          | 4.1      | 02      |
| `expectation`     | 4.2      | 03      |
| `risk`            | 6.1      | 04      |
| `opportunity`     | 6.1      | 05      |
| `objective`       | 6.2      | 06      |
| `measure`         | 9.1      | 07      |
| `owner`           | 5.1, 5.3 | 08      |
| `capability`      | 7.1–7.2  | 09      |
| `product`         | 8.1      | 10      |
| `evaluation`      | 9        | 11      |
| `improvement`     | 10       | 12      |

### File Extension
`.biz42.md` instead of `.arc42.md`. Same Markdown-with-fences convention.

### Fence Syntax
Same `:::type ... :::` fenced block syntax, wrapped in ` ```biz42 ... ``` ` (also accepts
` ```arc42 ``` ` for compatibility). The parser also recognises bare `:::type` blocks outside
a fence wrapper — same as arc42-language.

### Package Names
`@biz42/core`, `@biz42/workspace-fs`, `@biz42/web`, `@biz42/skill`, `@doctc/biz42` (published CLI).
Binary name: `biz42`.

### Cross-Reference Chain
```
signal ──surfaces──▶ risk/opportunity ◀──surfaces── expectation
                            │
                       addresses
                            ▼
                        objective ──measured-by──▶ measure
                                   ──owner──▶ owner
                                   ──requires──▶ capability ◀──enables── product
improvement ──addresses──▶ objective | risk | measure
```

The `surfaces` field on `signal` and `expectation` is the epistemic link: "this observation led
us to identify these risks/opportunities." It is validated by E002 (targets must be risk or
opportunity) and H001/H002 (must have at least one entry).

---

## Detailed Schema Designs

All schemas follow the arc42-language pattern:
- Zod v4 `.object({...}).meta({...})` with `description`, `biz42Chapter`, `crossRefs`, `authoringTips`
- `kind` and `loc` are NOT part of the schema — injected by the builder
- `splitListSchema` for optional comma-separated lists (absent or empty → `[]`)

### `scope` (chapter 01)
```
id: string (required)
title: string (required)
```
No cross-references. Describes the organisation and scope of the business model.

### `signal` (chapter 02)
```
id: string (required)
title: string (required)
source: string (optional)     — "external", "internal", or free text
surfaces: splitListSchema     — comma-separated risk or opportunity IDs this signal reveals
```
Cross-references: `surfaces` → risk | opportunity (many).

### `expectation` (chapter 03)
```
id: string (required)
title: string (required)
source: string (optional)     — who/what holds this expectation (stakeholder, regulation)
surfaces: splitListSchema     — comma-separated risk or opportunity IDs this expectation reveals
```
Cross-references: `surfaces` → risk | opportunity (many).

### `risk` (chapter 04)
```
id: string (required)
title: string (required)
severity: enum("high","medium","low") (required)
mitigation: string (optional)
```
No schema-level cross-references (objective → risk via `addresses` on objective).

### `opportunity` (chapter 05)
```
id: string (required)
title: string (required)
```
No schema-level cross-references (objective → opportunity via `addresses` on objective).

### `objective` (chapter 06)
```
id: string (required)
title: string (required)
addresses: splitListSchema    — comma-separated risk/opportunity IDs
measured-by: splitListSchema  — comma-separated measure IDs
owner: string (optional)      — single owner ID
requires: splitListSchema     — comma-separated capability IDs
```
Cross-references: `addresses` → risk | opportunity (many); `measured-by` → measure (many);
`owner` → owner (one); `requires` → capability (many).

Note: the DSL field name is `measured-by` (kebab-case), matching the attribute key in .biz42.md files.

### `measure` (chapter 07)
```
id: string (required)
title: string (required)
target: string (optional)     — measurable criterion
```
No schema-level cross-references (objective → measure via `measured-by` on objective).

### `owner` (chapter 08)
```
id: string (required)
title: string (required)
role: string (optional)
```
No schema-level cross-references (objective → owner via `owner` on objective).

### `capability` (chapter 09)
```
id: string (required)
title: string (required)
status: enum("exists","planned","gap") (optional)
```
No schema-level cross-references (objective → capability via `requires`; capability ← product
via `product.enables`).

### `product` (chapter 10)
```
id: string (required)
title: string (required)
enables: splitListSchema      — comma-separated capability IDs this product provides
```
Cross-references: `enables` → capability (many).

### `evaluation` (chapter 11)
```
id: string (required)
title: string (required)
method: string (optional)     — how evaluation is conducted
```
No cross-references.

### `improvement` (chapter 12)
```
id: string (required)
title: string (required)
addresses: splitListSchema    — comma-separated objective/risk/measure IDs
```
Cross-references: `addresses` → objective | risk | measure (many).

---

## Validation Rules (v1)

### Error rules (E-codes)
- **E001** Duplicate element id — two elements share the same id in the workspace
- **E002** Unresolved reference — a cross-ref field points to an id that does not exist;
  also validates that `surfaces` targets are risk or opportunity
- **E003** Parse error — unknown block type, missing required field, or unclosed block
  (missing closing `:::`)
- **E004** Element in wrong chapter file — e.g. a `scope` block in `04-risks.biz42.md`

### Warning rules (W-codes)
- **W001** Risk not addressed by any objective
- **W002** Objective has no `measured-by` entries
- **W003** Objective has no `owner`
- **W004** Measure not referenced by any objective's `measured-by`
- **W005** Owner not assigned to any objective

### Hint rules (H-codes)
- **H001** Signal has no `surfaces` entries — not linked to any risk or opportunity
- **H002** Expectation has no `surfaces` entries — not linked to any risk or opportunity
- **H003** Capability not enabled by any product
- **H004** Product `enables` is empty
- **H005** Block has no prose description in its section

### Ignore directives
Inside a ` ```biz42 ``` ` fence, a rule can be suppressed for the following block:
```
:::ignore H001 reason text :::
```
Stale directives (rule no longer firing) are flagged separately.

---

## ELEMENT_KIND_ORDER and CHAPTER_TITLE
```typescript
export const ELEMENT_KIND_ORDER: readonly BlockType[] = [
  "scope", "signal", "expectation", "risk", "opportunity",
  "objective", "measure", "owner", "capability",
  "product", "evaluation", "improvement",
];

export const CHAPTER_TITLE: Record<number, string> = {
  1: "Scope",           2: "Signals",        3: "Expectations",
  4: "Risks",           5: "Opportunities",  6: "Objectives",
  7: "Measures",        8: "Owners",         9: "Capabilities",
  10: "Products and Services", 11: "Evaluation", 12: "Improvements",
};
```

---

## Monorepo Layout

```
biz42/
  packages/
    core/           @biz42/core — parser, builder, resolver, validator, explain, schemas
      src/
        ast.ts
        biz42.ts
        index.ts
        model/
          schemas.ts
          types.ts
          builder.ts
        parser/
          markdown-parser.ts
        resolver/
          index.ts
          types.ts
        validator/
          index.ts
          types.ts
          rules/
            e001-duplicate-id.ts
            e002-unresolved-reference.ts
            e003-parse-error.ts
            e004-element-wrong-chapter.ts
            w001-risk-unaddressed.ts
            w002-objective-no-measure.ts
            w003-objective-no-owner.ts
            w004-orphaned-measure.ts
            w005-owner-no-assignments.ts
            h001-signal-no-risk-opportunity.ts
            h002-expectation-no-risk-opportunity.ts
            h003-capability-no-product.ts
            h004-product-no-capability.ts
            h005-block-without-prose.ts
        explain.ts
    workspace-fs/   @biz42/workspace-fs — file discovery, workspace loading
      src/index.ts
    cli/            @doctc/biz42 — binary: biz42
      src/
        cli.ts
        renderer/ (text.ts, json.ts, markdown.ts)
        chapters.ts
        guide.ts
        help.ts
        discover.ts
    web/            @biz42/web — React SPA
      src/App.tsx ...
    skill/          @biz42/skill — SKILL.md for AI agents
      SKILL.md
  examples/
    acme-emergency/docs/biz42/   — 12 .biz42.md files, 0 errors/warnings/hints
  docs/arc42/                    — adapted arc42 documentation for biz42 itself
  pnpm-workspace.yaml
  package.json
  tsconfig.json
```

---

## Key Differences from arc42-language

| Aspect | arc42-language | biz42 |
|--------|---------------|-------|
| File extension | `.arc42.md` | `.biz42.md` |
| Fence wrapper | ` ```arc42 ``` ` | ` ```biz42 ``` ` |
| Block types | 13 (arc42 chapters) | 12 (ISO 9001 sections) |
| Env var for dir | `ARC42_DIR` | `BIZ42_DIR` |
| CLI binary | `arc42` | `biz42` |
| Published pkg | `@doctc/arc42` | `@doctc/biz42` |
| Core pkg | `@arc42/core` | `@biz42/core` |
| workspace-fs | `@arc42/workspace-fs` | `@biz42/workspace-fs` |
| Web pkg | `@arc42/web` | `@biz42/web` |
| Skill pkg | `@arc42/skill` | `@biz42/skill` |
| `diff` command | yes | no (v1) |
| Mermaid diagrams | yes | no (v1) |
| Coverage report | yes | no (v1) |
| Chapter concept | arc42Chapter | biz42Chapter |
| signal/expectation → risk/opp | heuristic only | explicit `surfaces` field |
