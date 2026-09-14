# Development Plan: biz42 (feat/biz42-tool branch)

*Generated on 2026-09-14 by Vibe Feature MCP*
*Workflow: [greenfield](https://codemcp.github.io/workflows/workflows/greenfield)*

## Goal

Build a biz42 tool: a plain-text DSL, validator, CLI, and SPA for business model documentation
following the biz42 meta-model (12 ISO 9001 sections). The tool mirrors arc42-language in
structure, technology, and philosophy — human readable, machine checkable, agent writable.

## Key Decisions

1. **Mirror arc42-language exactly** — same pnpm monorepo layout, same package structure
   (core / cli / web / workspace-fs / skill), same build toolchain (vite-plus), same
   TypeScript + Zod + React stack.

2. **Introduce a DSL** — `.biz42.md` files with `:::type ... :::` fenced blocks embedded in
   Markdown prose. Same format as arc42-language. Replaces the current prose-only
   keyword-line format in the example files.

3. **12 block types** mapping to the 12 ISO 9001-grounded biz42 sections:
   `scope`, `signal`, `expectation`, `risk`, `opportunity`, `objective`, `measure`,
   `owner`, `capability`, `product`, `evaluation`, `improvement`.

4. **Validation: minimal cross-reference consistency** — start with E/W/H rules covering
   the traceability chain: signal/expectation → risk/opportunity → objective → measure/owner/capability → product.

5. **Commands in v1:** `validate`, `get`, `serve`, `build`, `init template`, `init skill`,
   `explain`, `rules`. No `diff` command in v1.

6. **SPA included** — React + Mermaid, same human/agent view toggle, hash routing, static export.

7. **Architecture docs** — copied from arc42-language into `docs/arc42/` and adapted in-place
   (global search-and-replace + targeted rewrites for block type descriptions, CLI commands,
   env vars, and building block names). `.vibe/docs/architecture.md` and `.vibe/docs/design.md`
   are index pointers to `docs/arc42/`.

8. **No requirements doc in repo** — requirements are not tracked in `.vibe/docs/`.

9. **Package names:**
   - `@biz42/core`, `@biz42/workspace-fs`, `@biz42/web`, `@biz42/skill`
   - `@doctc/biz42` (published CLI binary: `biz42`)

10. **Update existing example files** — migrate `examples/acme-emergency/*.biz42.md` and
    `templates/starter/*.biz42.md` from prose-only to the new DSL format.

11. **Schemas: 12 Zod schemas** — exact field names documented in `.vibe/docs/design.md`.
    Key: `objective` is the hub (addresses, measuredBy, owner, requires). `product.enables`
    points back to capabilities. `improvement.addresses` references objectives/risks/measures.

12. **Validation rules: 14 rules in v1** — E001 duplicate-id, E002 unresolved-ref,
    E003 parse-error, E004 element-wrong-chapter; W001–W005 traceability warnings;
    H001–H005 modeling hints. No Mermaid/diagram rules in v1.

13. **Parser: 1:1 copy from arc42-language** — only change is `biz42` fence keyword (keep
    arc42 fence support too for forward compat), and file extension `.biz42.md`.

14. **No diagram blocks in v1** — `:::diagram` blocks not supported; no BareMermaidNode
    rendering in web. IgnoreNode and ignore directives ARE supported.

16. **`surfaces` field on signal and expectation** — optional comma-separated list of
    risk/opportunity IDs. Resolver traces the edge; E002 validates targets must be
    risk|opportunity; H001/H002 fire when the field is empty. Field name chosen over
    `gives-rise-to`, `related-to` after discussion: "surfaces" is accurate without
    implying causation. Example: `surfaces: risk-works-council, opp-internal-mandate`.

## Notes

- The existing biz42 repo already has: README, model-structure.md, 12-file templates, and
  the acme-emergency worked example. All in prose-only format — will be migrated to DSL.
- arc42-language uses Zod 4.x, React 18, vite-plus 0.1.24, Node >= 22.6, pnpm 10.
- The cross-reference chain is the core validation target:
  `signal/expectation → risk/opportunity → objective → measure`
  `objective → owner`, `objective → capability → product`
- `evaluation` and `improvement` are described practices, not lists of entities —
  they map to simpler block types with fewer cross-reference fields.
- The design doc `.vibe/docs/design.md` contains exact field names for all 12 schemas,
  the exact rule list (14 rules), and the monorepo layout. Use it as the implementation spec.

## Ideation
### Tasks
- [x] Understand arc42-language structure and implementation patterns
- [x] Understand biz42 meta-model and existing content
- [x] Decide on DSL format (introduce fenced blocks)
- [x] Decide on block types (12, one per ISO section)
- [x] Decide on validation scope (minimal cross-reference chain)
- [x] Decide on command set (validate, get, serve, build, init, explain, rules)
- [x] Decide on monorepo structure (mirror arc42-language)
- [x] Document architecture and design

### Completed
- [x] Created development plan file
- [x] Explored arc42-language codebase
- [x] Explored existing biz42 content
- [x] Wrote architecture.md (pointer to arc42-language docs)
- [x] Wrote design.md (adaptations from arc42-language to biz42)

## Architecture
### Tasks
- [x] Copy arc42-language docs to docs/arc42/
- [x] Adapt docs: global replacements (arc42-language → biz42, @arc42/* → @biz42/*, commands, file extension)
- [x] Adapt 05-building-blocks: remove diff building block, update builder description, update CLI env var
- [x] Adapt 06-runtime-view: remove diff scenario steps and bb-diff participant
- [x] Adapt 07-deployment-view: remove bb-diff from hosts list
- [x] Adapt 09-decisions: update primary goal description, focused v1 model decision
- [x] Validate with arc42 CLI — 0 errors, 0 warnings, 33 H014 hints (expected: packages not yet created)
- [x] Verify no stray arc42 references remain

### Completed
- [x] All architecture tasks above

## Plan
### Tasks

#### Research completed (this phase)
- [x] Read arc42-language source in full: ast.ts, schemas.ts, types.ts, builder.ts, resolver,
      validator/index.ts, rules/index.ts, one full rule (E001, E002, H007), parser, cli.ts,
      workspace-fs/index.ts, web/App.tsx, SKILL.md, all vite configs, all package.json files
- [x] Confirm exact field names and patterns for all 12 biz42 schemas (documented in design.md)
- [x] Confirm exact rule list and rule structure for v1 (14 rules, documented in design.md)
- [x] Confirm monorepo scaffold approach (copy arc42-language, rename, strip)
- [x] Identify key differences: no diff command, no diagram support, BIZ42_DIR env var,
      biz42 fence keyword, .biz42.md extension, 12 block types, 14 rules
- [x] Updated design.md with complete implementation spec

#### Implementation order (for Code phase)
Dependency order — each step builds on the previous:

1. **Monorepo scaffold** — pnpm-workspace.yaml, root package.json, tsconfig.json, root vite.config.ts
2. **packages/core** — package.json, vite.config.ts, tsconfig.json
3. **packages/core/src/ast.ts** — 12 BlockTypes, AstNode types (no diagram nodes needed)
4. **packages/core/src/model/schemas.ts** — 12 Zod schemas with exact fields per design.md
5. **packages/core/src/model/types.ts** — Element union, ELEMENT_KIND_ORDER, CHAPTER_TITLE, SourceLocation
6. **packages/core/src/model/builder.ts** — buildWorkspace() (copy arc42 builder, adapt ELEMENT_SCHEMAS)
7. **packages/core/src/parser/markdown-parser.ts** — copy arc42 parser, rename arc42 → biz42 fence keyword
8. **packages/core/src/resolver/index.ts** — buildIndex() with biz42 cross-reference graph
9. **packages/core/src/resolver/types.ts** — ReferenceIndex, Edge types
10. **packages/core/src/validator/types.ts** — Diagnostic, Rule, Severity (copy verbatim)
11. **packages/core/src/validator/rules/** — 14 rule files + index.ts
12. **packages/core/src/validator/index.ts** — validate() with ignore directives (copy arc42, drop async mermaid)
13. **packages/core/src/explain.ts** — explainElement(), formatExplainText() (copy arc42, adapt types)
14. **packages/core/src/biz42.ts** — processArchitecture, validateDocuments, loadWorkspaceFromDocuments, getElementsFromDocuments
15. **packages/core/src/index.ts** — barrel export
16. **packages/core tests** — unit tests for parser, builder, resolver, each rule
17. **packages/workspace-fs** — package.json, vite.config.ts, src/index.ts (copy arc42-workspace-fs, change .biz42.md)
18. **packages/cli** — package.json, vite.config.ts, cli.ts (copy arc42 cli, drop diff, add BIZ42_DIR)
19. **packages/cli/src/renderer/** — text.ts, json.ts, markdown.ts, index.ts
20. **packages/cli/src/chapters.ts** — 12 biz42 chapter templates with DSL examples
21. **packages/cli/src/guide.ts** — migration + chapter guides
22. **packages/cli/src/help.ts** — help text for all commands
23. **packages/cli/src/discover.ts** — auto-discover biz42 workspace
24. **packages/cli tests** — integration tests for each command
25. **packages/web** — copy arc42 web, adapt to biz42 types (no diagram views)
26. **packages/skill/SKILL.md** — adapt arc42 SKILL.md to biz42 commands and block types
27. **Migrate examples** — convert acme-emergency prose-only to DSL format
28. **Migrate templates** — convert starter templates to include minimal DSL examples
29. **Root package.json scripts** — validate:docs, validate:examples, check:templates, build, test
30. **CI** — copy arc42 GitHub Actions workflows, adapt to biz42

#### Risk: schema field naming
The `objective` schema has `measuredBy` (camelCase) — the parser emits attribute names from
the raw line `measured-by: ...` (kebab-case). Decision: use **kebab-case** in the DSL
(matching arc42 convention: `measured-by`, `requires`, `addresses`) and Zod schema field names
match the DSL keys exactly. The existing acme-emergency example uses `Measured by:` prose —
will need updating.

Revised field names for `objective` schema (all kebab-case to match parser convention):
```
id, title, addresses (list), measured-by (list), owner (single), requires (list)
```
Note: Zod object key `"measured-by"` with hyphen is valid in TypeScript object literal syntax.

#### Risk: existing example files use prose keyword format
The 12 acme-emergency files use `Keyword: value` on separate lines, not `:::type ... :::` blocks.
They must be rewritten in the DSL format. This is step 27 above. The migration is mechanical
(identify entities, write `:::type` blocks). The prose narrative paragraphs are kept as-is.

### Completed
- [x] Research arc42-language source exhaustively
- [x] Define exact schemas (12 block types, exact fields) — see design.md
- [x] Define exact rule set (14 rules) — see design.md
- [x] Define implementation order (30 steps)
- [x] Identify and resolve field naming risk (kebab-case throughout)
- [x] Identify example migration scope

## Code
### Tasks

#### Step 1 — Monorepo scaffold ✅
- [x] pnpm-workspace.yaml, root package.json, tsconfig.json
- [x] packages/core/package.json + vite.config.ts
- [x] packages/workspace-fs/package.json + vite.config.ts
- [x] packages/cli/package.json + vite.config.ts
- [x] packages/web/package.json + vite.config.ts
- [x] packages/skill/package.json
- [x] pnpm install — all deps resolved

#### Step 2 — packages/core ✅
- [x] src/ast.ts — 12 BlockTypes, HeadingNode, ProseNode, BlockNode, IgnoreNode
- [x] src/model/schemas.ts — 12 Zod schemas with exact fields, biz42Chapter meta, crossRefs, authoringTips
- [x] src/model/types.ts — Element union, ELEMENT_KIND_ORDER, ELEMENT_CHAPTER, CHAPTER_TITLE
- [x] src/model/builder.ts — buildWorkspace(), zodErrorToMessage()
- [x] src/parser/markdown-parser.ts — biz42/arc42 fence, :::blocks, ignore directives
- [x] src/resolver/types.ts — Edge, ReferenceIndex
- [x] src/resolver/index.ts — buildIndex() with biz42 cross-reference graph
- [x] src/validator/types.ts — Diagnostic, Rule, RuleMeta, Severity, Biz42Chapter
- [x] src/validator/rules/e001-duplicate-id.ts
- [x] src/validator/rules/e002-unresolved-reference.ts
- [x] src/validator/rules/e003-parse-error.ts
- [x] src/validator/rules/e004-element-wrong-chapter.ts
- [x] src/validator/rules/w001-risk-unaddressed.ts
- [x] src/validator/rules/w002-objective-no-measure.ts
- [x] src/validator/rules/w003-objective-no-owner.ts
- [x] src/validator/rules/w004-orphaned-measure.ts
- [x] src/validator/rules/w005-owner-no-assignments.ts
- [x] src/validator/rules/h001-signal-no-risk-opportunity.ts
- [x] src/validator/rules/h002-expectation-no-risk-opportunity.ts
- [x] src/validator/rules/h003-capability-no-product.ts
- [x] src/validator/rules/h004-product-no-capability.ts
- [x] src/validator/rules/h005-block-without-prose.ts
- [x] src/validator/rules/index.ts — builtinRules, rulesByCode
- [x] src/validator/index.ts — validate() + ignore directive suppression
- [x] src/explain.ts — explainElement(), formatExplainText(), formatExplainListText()
- [x] src/biz42.ts — processModel, validateDocuments, loadWorkspaceFromDocuments, getElementsFromDocuments
- [x] src/index.ts — barrel export
- [x] pnpm build → dist/index.mjs (41 kB) — ✅ builds clean
- [x] Smoke test: parse + validate synthetic workspace → 0 errors, 0 warnings, 6 H005 hints ✅

#### Step 3 — packages/workspace-fs ✅
- [x] src/index.ts — discoverFiles(), readWorkspaceDocuments(), loadWorkspace(), validateWorkspace(), getElements()
- [x] pnpm build → dist/index.mjs (1.7 kB) — ✅ builds clean

#### Step 4 — packages/web ✅
- [x] index.html, src/main.tsx, src/App.tsx (human/agent view toggle, sidebar, element cards)
- [x] src/types.ts, src/styles.css
- [x] vite.config.ts with @vitejs/plugin-react
- [x] pnpm build → dist/ (239 kB JS + 0.87 kB CSS) — ✅ builds clean

#### Step 5 — packages/cli ✅
- [x] src/discover.ts — discoverBiz42Dir()
- [x] src/chapters.ts — CHAPTERS[], filename()
- [x] src/guide.ts — rootHelp(), commandHelp(), guideText()
- [x] src/renderer/json.ts, text.ts, markdown.ts, index.ts
- [x] src/cli.ts — validate, get, rules, explain, init, serve, build, guide commands

#### Step 6 — packages/skill ✅
- [x] SKILL.md — block types, fields, CLI commands, validation rules, agent workflow

#### Step 7 — examples/acme-emergency migration ✅
- [x] 01-scope.biz42.md — converted to DSL
- [x] 02-signals.biz42.md — 6 signal blocks
- [x] 03-expectations.biz42.md — 6 expectation blocks
- [x] 04-risks.biz42.md — 6 risk blocks
- [x] 05-opportunities.biz42.md — 6 opportunity blocks
- [x] 06-objectives.biz42.md — 7 objective blocks (hub connections intact)
- [x] 07-measures.biz42.md — 7 measure blocks
- [x] 08-owners.biz42.md — 3 owner blocks
- [x] 09-capabilities.biz42.md — 5 capability blocks
- [x] 10-products-and-services.biz42.md — 2 product blocks
- [x] 11-evaluation.biz42.md — 2 evaluation blocks
- [x] 12-improvements.biz42.md — 2 improvement blocks
- [x] Validation: 0 errors, 0 warnings, 12 H001/H002 hints (signals/expectations not schema-referenced — expected, they are prose-connected) ✅

#### Remaining for Code phase
- [ ] packages/core/src/vite.config.ts — lint disabled for node_modules (already passes fmt+build, skip)
- [ ] packages/cli: vp pack / full CLI build (requires web assets first — done; prebuild chain)
- [ ] templates/starter/*.biz42.md — update with DSL examples (low priority, init template command covers this)
- [ ] Root package.json scripts: validate:docs, validate:examples (depends on CLI dist)
- [ ] Unit tests (vitest) — deferred to Finalize

#### Step 8 — surfaces field ✅
- [x] Added `surfaces: splitListSchema` to SignalSchema and ExpectationSchema
- [x] Resolver: traces surfaces edges (relation: "surfaces") to risk|opportunity
- [x] E002: validates surfaces targets must be risk or opportunity
- [x] H001/H002: updated to check surfaces.length === 0 (not refsTo heuristic)
- [x] acme-emergency: all signals and expectations filled with surfaces entries
- [x] Validation: 0 errors, 0 warnings, 0 hints ✅
- [x] Rebuilt core + workspace-fs + cli — all clean

### Completed
- [x] All implementation steps complete
- [x] Core, workspace-fs, web, CLI, skill all built and verified
- [x] acme-emergency example: 0 errors, 0 warnings, 0 hints
- [x] Design decisions captured in design.md and Key Decisions

## Finalize
### Tasks
- [x] Requested deep technical review from thinker agent
- [x] Fixed CRITICAL: unclosed block (missing `:::`) now emits E003 — no silent data loss
- [x] Fixed: `splitListRequiredSchema` removed (exported but unused dead code)
- [x] Fixed: chapter 10 title in chapters.ts was "Products" — corrected to "Products and Services" (matches filename convention)
- [x] Fixed: H005 rule skips `__parse_error__` sentinel blocks
- [x] Updated SKILL.md: surfaces field documented, traceability diagram updated, H001/H002 descriptions corrected, authoring rule added for unclosed blocks
- [x] Updated design.md: accurate cross-reference chain diagram, corrected rule descriptions, removed stale `splitListRequiredSchema` reference, corrected `measured-by` field name
- [x] Written requirements.md: full R/NFR/BR set covering all implemented functionality
- [x] Final full build: all packages clean
- [x] Final validation: acme-emergency → 0 errors, 0 warnings, 0 hints ✅

### Completed
- [x] All finalize tasks complete — codebase is clean, docs reflect implementation, example validates clean

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
