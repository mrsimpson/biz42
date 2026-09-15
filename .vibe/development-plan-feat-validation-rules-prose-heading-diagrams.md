# Development Plan: biz42 (feat/validation-rules-prose-heading-diagrams branch)

*Generated on 2026-09-14 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal

Three structural flaws identified by comparing the biz42 webapp against the arc42-language reference:

1. **Prose blocks are not enforced.** H005 exists but fires only as a `hint` — too weak to surface
   in normal validation output. The acme-emergency example has no H005 violations because every
   element already has prose, but nothing stops a user from omitting it and seeing only a hint.
   The rule should be a proper `warning` aligned with arc42-language's W004.

2. **One-heading-per-block is not enforced.** There is no equivalent to arc42-language's W005.
   Multiple blocks can live under a single heading without any diagnostic, making document
   structure drift undetectable.

3. **No diagrams are modelled or required.** biz42 has no diagram support at all — no AST node,
   no parser recognition, no validation rule requiring an overview diagram, and no webapp
   rendering. arc42-language has a rich diagram system. biz42 needs at least a lightweight
   version: parse `:::diagram` + mermaid fences, require one overview diagram in the scope
   chapter (ch01), validate mermaid syntax, and render it in the webapp using the live mermaid
   runtime (same as arc42-language).

## Key Decisions

- **H005 → W006**: Rename and promote the prose-before-block rule. The `H` prefix (hint) is
  wrong for a structural convention this important. New code: W006, severity: `warning`.
  The old `h005-block-without-prose.ts` file is replaced by `w006-block-without-prose.ts`.
  The validator index and any ignore directives in examples are updated accordingly.

- **W007: one block per heading section**: Direct port of arc42-language W005. Fires `warning`
  when a heading section contains more than one block. New file:
  `w007-multiple-blocks-under-heading.ts`.

- **New `packages/mermaid` package** — mirrors `arc42-language/packages/mermaid` exactly:
  - Name: `@biz42/mermaid`
  - Own `package.json` with `mermaid` as a direct dependency (pinned to `11.17.2`)
  - Exports: `MermaidSyntaxParser`, `parseMermaid`, `warmMermaid`, model types
  - The package acts as the syntax-validation boundary so the mermaid runtime is isolated
    from `@biz42/core` (which stays Node-compatible and has no browser deps)
  - `@biz42/core` adds `"@biz42/mermaid": "workspace:*"` as a dependency
  - `@biz42/web` already indirectly gets mermaid via its dep on `@biz42/core`; for rendering
    it imports `mermaid` directly (same pattern as arc42-language's `MermaidDiagram.tsx`)

- **Diagram support in AST**: A single `DiagramNode` type added to `ast.ts`:
  `{ kind: "diagram", id, notation, source, startLine, endLine }`.
  `AstNode` union extended. No `BareMermaidNode` — a bare mermaid fence fires W009 and is
  still captured as a `BareMermaidNode` for rendering (same as arc42-language approach).

- **Parser**: Recognises `:::diagram` blocks (with `id`, `notation` attributes) followed by
  a ` ```mermaid ``` ` fence. Bare ` ```mermaid ``` ` fences without a preceding `:::diagram`
  emit a `BareMermaidNode`.

- **Workspace.diagrams**: `Workspace` gets a `diagrams: Diagram[]` array. Builder extracts
  `DiagramNode`s into `workspace.diagrams` (same pattern as arc42-language).

- **W008: missing overview diagram in ch01**: Any file matching `01-*.biz42.md` that contains
  a `scope` block but no `diagram` node fires W008 (warning).

- **W009: bare mermaid block**: A ` ```mermaid ``` ` fence not preceded by `:::diagram` fires
  W009 (warning). The bare fence is still rendered in the webapp.

- **E010: mermaid syntax error**: After the syntax boundary validates diagram source via
  `@biz42/mermaid`, invalid mermaid source fires E010 (error).

- **Webapp rendering**: `MermaidDiagram.tsx` component copied/adapted from arc42-language,
  using the live mermaid runtime for rendering (zoom, fullscreen, error state). The webapp
  shows diagrams in the scope chapter view (ch01) and wherever diagrams appear in documents.

- **acme-emergency example**: `01-scope.biz42.md` gets a `:::diagram` block + mermaid
  flowchart overview. No other files need changes (each already has one block per heading
  with prose).

## Notes

- arc42-language `@arc42/mermaid` package: `src/model.ts` + `src/parser.ts` + `src/index.ts`.
  The biz42 equivalent (`@biz42/mermaid`) mirrors this structure exactly, same filenames.
- The `MermaidSyntaxParser` interface allows a test double to be injected, keeping core
  validator tests fast without the mermaid runtime.
- arc42-language keeps `validate()` **sync** and adds a separate `validateAsync()` export in
  `validator/index.ts`. biz42 follows the exact same pattern: `validate()` stays sync (all
  existing callers unchanged), and a new `validateAsync()` runs `validateMermaidSyntax()` then
  applies `suppressInvalidMermaidDiagnostics` before returning. `processModel()`,
  `validateDocuments()`, `loadWorkspaceFromDocuments()`, and `workspace-fs` are **not** made
  async — no cascading changes needed. The CLI and webapp can opt into `validateAsync` later.
- biz42 webapp uses inline styles (no CSS modules). `MermaidDiagram` will use a CSS module
  like arc42-language does — the web package already has `styles.css`, adding a module is fine.
- The `STALE_IGNORE_CODE` in `validator/index.ts` is currently `"W019"`. Since we're adding
  W006–W009, the stale ignore code should stay as-is (it's a separate bookkeeping rule code).
- The `mermaid` catalog entry will be added to `pnpm-workspace.yaml` with version `11.17.2`.

## Future Features (backlog — separate branches)

### Named diagram notations with semantic validation (next diagram branch)

The `:::diagram` block already supports a `notation:` attribute. The next step is to
give that attribute meaning: per-notation semantic validators that check element references,
completeness, and structural correctness — exactly as arc42-language does for its diagram types.

Authors write `:::diagram` blocks with a typed notation and reference real biz42 element IDs
in their mermaid source. The validator then:
- Checks all referenced IDs resolve to real workspace elements
- Checks notation-specific completeness (e.g. all SIPOC slots populated)
- Fires typed diagnostics (E011+ range reserved for diagram semantic errors)

**Three named notations for the first implementation:**

#### `notation: sipoc`
- Industry standard: Six Sigma / ISO 9001 §4.4 (process approach)
- Slots: Supplier → Input → Process → Output → Customer
- biz42 mapping:
  - Supplier ← `expectation.source` (external parties providing inputs)
  - Input ← `signal`, `expectation`
  - Process ← `objective` (what the org does)
  - Output ← `product`
  - Customer ← `expectation.source` (receiving end)
- Validation: all referenced element IDs exist; all 5 slots non-empty; output products exist

#### `notation: turtle`
- Industry standard: ISO 9001 process auditing ("turtle diagram")
- Slots: With what? (resources) + With whom? (people) + How? (methods) + For whom? (customers) → Process → Results
- biz42 mapping:
  - "With what?" ← `capability`
  - "With whom?" ← `owner`
  - "How?" ← `objective`
  - "For whom?" ← `expectation.source`
  - Results ← `measure`
- Validation: all referenced element IDs exist; capability/owner/objective/measure slots non-empty

#### `notation: strategy-map`
- Industry standard: Balanced Scorecard (Kaplan & Norton) — without BSC financial layer
- Rendered as an objective dependency graph: objectives as nodes, linked by cause-and-effect
- biz42 mapping: objective nodes, edges from `addresses` (risk/opp) and `measured-by` (measure),
  owner label on each node
- No BSC perspective tagging added to biz42 elements — rendered honestly from what's there.
  Financial perspective deliberately omitted rather than invented.
- Validation: all objective/measure/risk/opp IDs referenced in diagram source resolve;
  high-severity risks have at least one objective addressing them

**Multi-scope note:** biz42 is limited to one `scope` per workspace for now. If multiple scopes
are modelled in future, diagram notations will need a `scope:` attribute to partition elements.

---

### Generated Business Model Canvas (BMC) view (webapp — separate branch)

- A generated React component (not a mermaid diagram) that renders the 9-block BMC layout
  directly from workspace model entities. No `:::diagram` block needed — computed from `WorkspacePayload`.
- No financial blocks — Revenue Streams and Cost Structure omitted (not modelled in biz42;
  bending data to fill them would be dishonest).
- Rendered as a standard HTML/React page, new "Overview" sidebar navigation entry.
- **Single-scope constraint:** one BMC per workspace (one `scope` element). Multi-scope
  would require a `scope:` partitioning attribute on elements — deferred.
- Mapping:
  - **Customer Segments** ← distinct `expectation.source` values
  - **Value Propositions** ← `scope` title/description + `opportunity` titles
  - **Channels** ← `product` titles (how value reaches customers)
  - **Customer Relationships** ← `expectation` titles (what each stakeholder group needs)
  - **Key Resources** ← `capability` titles
  - **Key Activities** ← `objective` titles
  - **Key Partners** ← external `expectation.source` values (IT ops, IoT operators, regulators)
  - Revenue Streams / Cost Structure: **omitted**

## Explore

### Tasks
- [x] Read arc42-language W004 (block without prose) source
- [x] Read arc42-language W005 (multiple blocks under heading) source
- [x] Read arc42-language diagram AST types
- [x] Read biz42 validator rules index and all existing rule files
- [x] Read biz42 AST types and parser
- [x] Read biz42 model types (Workspace, Element, SourceLocation)
- [x] Read biz42 webapp (App.tsx, types.ts)
- [x] Read acme-emergency example files (01-scope.biz42.md)
- [x] Confirm no existing diagram support in biz42 parser or webapp
- [x] Read arc42-language `packages/mermaid` structure (model.ts, parser.ts, index.ts)
- [x] Confirm arc42-language pattern: mermaid package → core depends on it → web renders with mermaid directly
- [x] Check arc42-language MermaidDiagram.tsx rendering approach (live mermaid runtime, zoom, fullscreen)
- [x] Confirm mermaid version used by arc42-language (11.17.2)
- [x] Confirm biz42 pnpm catalog does not yet have mermaid entry

### Completed
- [x] Created development plan file
- [x] Full codebase exploration completed

## Plan

### Tasks
- [x] Verify async strategy: keep `validate()` sync, add `validateAsync()` — same as arc42-language pattern
- [x] Verify `processModel()` / `validateDocuments()` / `workspace-fs` do NOT need to be made async
- [x] Confirm `e010-mermaid-syntax-error.ts` is superseded by `validator/mermaid-syntax.ts` approach (no separate Rule file needed)
- [x] Confirm all Code tasks are enumerated correctly in Code section

### Completed
- [x] Plan fully elaborated and signed off

## Code

### Tasks

#### New package: `packages/mermaid`
- [x] Create `packages/mermaid/package.json` (`@biz42/mermaid`, depends on `mermaid: 11.17.2`)
- [x] Create `packages/mermaid/src/model.ts` (types: `MermaidNotation`, `MermaidParseRequest`, `MermaidParseResult`, `MermaidSyntaxParser`)
- [x] Create `packages/mermaid/src/parser.ts` (`mermaidSyntaxParser`, `parseMermaid`, `warmMermaid`)
- [x] Create `packages/mermaid/src/index.ts` (barrel export)
- [x] Add `mermaid: 11.17.2` to `pnpm-workspace.yaml` catalog

#### Core: AST
- [x] Add `DiagramNode` and `BareMermaidNode` to `ast.ts`
- [x] Extend `AstNode` union to include `DiagramNode | BareMermaidNode`

#### Core: parser
- [x] Extend `markdown-parser.ts` to recognise `:::diagram` blocks + following ` ```mermaid ``` ` fence → emit `DiagramNode`
- [x] Detect bare ` ```mermaid ``` ` fences (no preceding `:::diagram`) → emit `BareMermaidNode`

#### Core: model
- [x] Add `Diagram` type to `model/types.ts`
- [x] Add `diagrams: Diagram[]` to `Workspace` interface
- [x] Update `model/builder.ts` to extract `DiagramNode`s into `workspace.diagrams`

#### Core: validator rules
- [x] Delete `h005-block-without-prose.ts`, create `w006-block-without-prose.ts`
      (same logic, severity `warning`, code `W006`, type `suggestion`)
- [x] Create `w007-multiple-blocks-under-heading.ts`
      (port of arc42-language W005, adapted to biz42 types)
- [x] Create `w008-missing-overview-diagram.ts`
      (fires on `01-*.biz42.md` files with a scope block but no diagram node)
- [x] Create `w009-bare-mermaid.ts`
      (fires warning on bare ` ```mermaid ``` ` fences not owned by `:::diagram`)
- [x] Update `rules/index.ts`: remove h005, add w006/w007/w008/w009
- [x] Add `"@biz42/mermaid": "workspace:*"` to `packages/core/package.json`
- [x] Add `validateAsync()` to `validator/index.ts` (calls `validateMermaidSyntax` + `suppressInvalidMermaidDiagnostics`, same as arc42-language; `validate()` stays sync, no callers changed)
- [x] Add `validateMermaidSyntax` + `suppressInvalidMermaidDiagnostics` to new `validator/mermaid-syntax.ts`

#### Webapp
- [x] Add `mermaid` dep to `packages/web/package.json`
- [x] Create `MermaidDiagram.tsx` + `MermaidDiagram.module.css` (adapted from arc42-language)
- [x] Add `diagrams` to `WorkspacePayload` in `web/src/types.ts`
- [x] Update `App.tsx`: render diagrams in the chapter view (DiagramCard for each diagram node)

#### Example
- [x] Update `01-scope.biz42.md` to add a `:::diagram` block + mermaid flowchart overview

#### Named diagram notations: validator rules + webapp renderer
- [x] Create `validator/mermaid-utils.ts` — shared source parsing: `extractMermaidIds`, `sourceContainsId`, `extractMermaidEdges`, `extractMermaidSubgraphIds`
- [x] Create `e011-unknown-diagram-element.ts` — flags element-like tokens in sipoc/turtle/strategy-map diagrams that don't resolve to workspace elements; uses element kind prefixes as discriminator; excludes subgraph ids and quoted labels
- [x] Create `e012-sipoc-diagram-validation.ts` — SIPOC structural validation: requires all 5 subgraphs (`sipoc-supplier/input/process/output/customer`), checks input→signal/expectation, process→objective, output→product element refs
- [x] Create `e013-turtle-diagram-validation.ts` — turtle structural validation: requires capability, owner, objective, measure element refs in source
- [x] Create `e014-strategy-map-validation.ts` — strategy map validation: requires at least one objective id and one measure id
- [x] Wire E011–E014 into `validator/rules/index.ts`
- [x] Create `web/src/DiagramView.tsx` — notation-aware dispatcher: builds clickable element node map (id→chapter anchor URL), renders notation badge + legend (SIPOC/Turtle/StrategyMap), passes clickableNodes to MermaidDiagram
- [x] Update `MermaidDiagram.tsx` to accept and apply `clickableNodes` via mermaid `click ... href` directives
- [x] Update `App.tsx` to use `DiagramView` with `chapterMap` built from `WorkspacePayload`
- [x] Add SIPOC, turtle, and strategy-map example diagrams to `01-scope.biz42.md` using real acme-emergency element IDs
- [x] All packages build; CLI validates acme-emergency with 0 errors/warnings/hints

### Key decisions (diagram notation implementation)
- E011 uses element kind prefix heuristic (obj-, risk-, measure-, etc.) rather than scanning all hyphenated tokens — avoids false positives on structural ids like sipoc-supplier
- SIPOC subgraph convention: ids must be prefixed `sipoc-` (supplier/input/process/output/customer) — structural, not element refs
- Turtle: no subgraph convention required; validates by checking element kind presence in source
- Strategy-map: no layer assignment (no BSC perspectives) — renders cause-and-effect graph honestly from what's modelled
- Clickable nodes use `#chapter-{n}-{id}` anchor format; chapter number comes from `ELEMENT_CHAPTER` lookup

#### Webapp: document rendering (new — user-requested)
- [x] Add `marked` dependency to `packages/web/package.json`
- [x] Extend `styles.css` with CSS custom properties needed by modules (`--bg-card`, `--bg-code`, `--border`, `--text`, `--text-muted`, `--accent`, `--font-mono`, `--radius`, `--c-ch*`)
- [x] Create `DocumentView.module.css` (document layout, heading styles, prose block styles)
- [x] Create `AstNodeRenderer.module.css` (proseRun stripe toggle, code blocks)
- [x] Create `ElementCard.module.css` (card layout, dismiss stripe, badge, fields, ref chips)
- [x] Create `ElementCard.tsx` — biz42 element card with kind-specific fields + clickable dismiss stripe
- [x] Create `AstNodeRenderer.tsx` — renders heading, prose (marked), prose-run+block toggle, diagram, bare-mermaid
- [x] Create `DocumentView.tsx` — `groupNodes()` groups prose+block runs; renders AST nodes in document order
- [x] Update `App.tsx` — sidebar navigates by document file (one entry per .biz42.md file); main area renders `DocumentView` instead of element list

### Key decisions (webapp document rendering)
- Sidebar switches from abstract chapter numbers to one entry per document file (filename → human title from H1 heading)
- `groupNodes()` in DocumentView groups consecutive prose nodes + attaches following biz42 block — exact same pattern as arc42-language
- Prose rendered via `marked.parse()` so markdown tables, bold, lists all work
- Block toggle: colored left stripe (4px) = prose view; click → expand element card; card's left stripe (8px clickable) = dismiss back to prose
- Agent view: prose as markdown source, blocks as raw `:::block` source (dark pre/code)
- DiagramView (existing) is reused inline in AstNodeRenderer for diagram nodes
- Sidebar "All documents" entry shows all documents in file order

### Completed
- [x] All prior code tasks complete; all packages build successfully; CLI validates acme-emergency with 0 errors/warnings/hints
- [x] Webapp document rendering complete: DocumentView, AstNodeRenderer, ElementCard, CSS modules; sidebar shows one entry per .biz42.md file; prose rendered as markdown; blocks toggle to element cards on stripe click

## Commit

### Tasks
- [ ] `git add` and commit with conventional commit message

### Completed
*None yet*

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
