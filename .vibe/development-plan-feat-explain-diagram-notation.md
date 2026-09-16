# Development Plan: biz42 (feat/explain-diagram-notation branch)

*Generated on 2026-09-16 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal

Add `biz42 explain diagram [notation]` — authoring guidance for diagram notations, parallel to
`biz42 explain scope` for block types. When given a notation name (e.g. `bmc`, `sipoc`), the CLI
prints a description, slots/structure, and authoring tips. Without a notation it lists all known
notations. The same data drives the "About" box in the web renderer's `DiagramView.tsx`,
replacing the duplicated `METHODOLOGY` constant there.

## Key Decisions

- Diagram notation guidance lives in `core/src/explain.ts` (same file as element explain) — single
  source of truth, reusable by CLI and web.
- The web renderer imports from `@biz42/core` instead of maintaining its own `METHODOLOGY` map.
- Actual notation list (9 values): `bmc`, `sipoc`, `turtle`, `strategy-map`, `architecture`,
  `sequence`, `flowchart`, `class`, `auto`.
  (`MermaidNotation` from `packages/mermaid/src/model.ts` uses these short names, not prefixed ones.)
- CLI sub-command shape: `biz42 explain diagram [<notation>] [--format text|json]` — the word
  `diagram` is the first positional; remaining positional is the notation. Mirrors
  `biz42 init skill` / `biz42 init template` pattern.
- `ExplainDiagramResult` type: `{ notation, name, description, slots?, authoringTips }`.
  Separate from `ExplainResult` — no biz42Chapter, no field lists.
- `DiagramView.tsx` deletes `METHODOLOGY` + `MethodologyInfo` and imports
  `explainDiagram` from `@biz42/core` instead.
- `DIAGRAM_KIND_ORDER` display order: business notations first (`bmc`, `sipoc`, `turtle`,
  `strategy-map`), then Mermaid-specific ones (`architecture`, `sequence`, `flowchart`, `class`,
  `auto`).

## Notes

### Exploration findings

**`packages/mermaid/src/model.ts`** — `MermaidNotation` union:
  `"mermaid" | "mermaid-sequence" | "mermaid-architecture" | "mermaid-er" |
   "mermaid-mindmap" | "mermaid-timeline" | "sipoc" | "turtle" | "strategy-map"`

**`packages/core/src/model/types.ts`** — `DiagramNotation = MermaidNotation | "bmc"`

**`packages/core/src/explain.ts`** — schema-driven; diagram data is static so we use a plain
  `Record<DiagramNotation, ExplainDiagramResult>` constant.

**`packages/core/src/index.ts`** — already exports the explain API; just need to add the new
  symbols.

**`packages/cli/src/cli.ts` — `runExplain()`** — first positional is currently the block type.
  After: if first positional === `"diagram"`, delegate to `runExplainDiagram()`.

**`packages/web/src/DiagramView.tsx`** — `METHODOLOGY` map + `MethodologyDescription` component.
  Replace map with `explainDiagram(notation)` call; keep the component structure as-is.

## Explore

### Tasks
- [x] Read development plan file
- [x] Read `packages/core/src/explain.ts`
- [x] Read `packages/cli/src/cli.ts` + `guide.ts`
- [x] Read `packages/web/src/DiagramView.tsx`
- [x] Read `packages/core/src/index.ts`
- [x] Read `packages/mermaid/src/model.ts` — confirmed full notation list
- [x] Read `packages/core/src/model/types.ts` — confirmed DiagramNotation type

### Completed
- [x] Full exploration complete — all findings documented above

## Plan

### Tasks
- [x] Define `ExplainDiagramResult` type and `DIAGRAM_DATA` constant in `core/src/explain.ts`
- [x] Add `explainDiagram()`, `formatExplainDiagramText()`, `formatExplainDiagramListText()` to `core/src/explain.ts`
- [x] Export new types and functions from `core/src/index.ts`
- [x] Extend `runExplain()` in `cli/src/cli.ts` to handle `diagram` sub-command
- [x] Update `commandHelp("explain")` in `cli/src/guide.ts` to document `diagram` sub-command
- [x] Replace `METHODOLOGY` in `web/src/DiagramView.tsx` with import from `@biz42/core`
- [x] Build and verify

### Implementation detail

**`core/src/explain.ts` additions:**

```ts
export interface ExplainDiagramSlot {
  label: string;
  meaning: string;
}

export interface ExplainDiagramResult {
  notation: DiagramNotation;
  name: string;
  description: string;
  slots?: ExplainDiagramSlot[];
  authoringTips: string[];
}
```

Static `DIAGRAM_DATA` record covers all notations. Entries for `bmc`, `sipoc`, `turtle`,
`strategy-map` are taken verbatim from the existing `METHODOLOGY` map in `DiagramView.tsx`.
New entries for `mermaid`, `mermaid-sequence`, `mermaid-architecture`, `mermaid-er`,
`mermaid-mindmap`, `mermaid-timeline` are authored with appropriate descriptions.

**`cli/src/cli.ts` `runExplain()` change:**

```
if (positionals[0] === "diagram") {
  // delegate to diagram explain
} else {
  // existing block type explain
}
```

**`web/src/DiagramView.tsx` change:**

Remove `MethodologyInfo` interface and `METHODOLOGY` constant.
Import `explainDiagram` from `@biz42/core`.
Replace `METHODOLOGY[notation]` lookup with `explainDiagram(notation)` call (returns
`ExplainDiagramResult | undefined`). Map `slots` → `{ label, meaning }[]` as before.

### Completed
*None yet*

## Code
### Tasks
- [x] Define `ExplainDiagramResult`, `ExplainDiagramSlot` types in `core/src/explain.ts`
- [x] Add `DIAGRAM_DATA` static record covering all 9 notations
- [x] Add `explainDiagram()`, `formatExplainDiagramText()`, `formatExplainDiagramListText()` to `core/src/explain.ts`
- [x] Export new types and functions from `core/src/index.ts`
- [x] Extend `runExplain()` in `cli/src/cli.ts` to handle `diagram` sub-command
- [x] Update `commandHelp("explain")` in `cli/src/guide.ts` to document `diagram` sub-command
- [x] Replace `METHODOLOGY` map in `web/src/DiagramView.tsx` with `explainDiagram()` import
- [x] Build `@biz42/core`, `@biz42/cli` (includes web build) — all green
- [x] Run `pnpm test` — 24 tests passed, 0 failures

### Completed
- All code tasks complete, builds pass, tests pass

## Commit
### Tasks
- [x] Scan changed files for debug output, TODOs, commented-out code — none found
- [x] Correct Key Decisions notation list (was stale from pre-exploration)
- [x] No long-term docs to update (no `.vibe/docs/` files exist)
- [x] Final test run — 24 tests passed, builds clean

### Completed
- All commit tasks done. No debug artifacts or stale comments in changed files.
- Key Decisions updated to reflect actual `MermaidNotation` short-name values.
- PR ready to create.



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
