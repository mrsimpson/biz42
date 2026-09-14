# Requirements Document

## Functional Requirements

### DSL and File Format

- R01: Parse `.biz42.md` files containing `:::type ... :::` fenced blocks
- R02: Support wrapping blocks in ` ```biz42 ``` ` code fences (also accept ` ```arc42 ``` `)
- R03: Support 12 block types: scope, signal, expectation, risk, opportunity, objective, measure, owner, capability, product, evaluation, improvement
- R04: Each block must have a unique `id` field
- R05: Unrecognised block types produce a parse error (E003)
- R06: Missing required fields produce a parse error (E003)
- R07: An unclosed block (missing closing `:::`) produces E003 — no silent data loss

### Cross-Reference Model

- R08: `signal.surfaces` and `expectation.surfaces` — comma-separated IDs of risks and opportunities the element reveals
- R09: `objective.addresses` — comma-separated risk/opportunity IDs
- R10: `objective.measured-by` — comma-separated measure IDs
- R11: `objective.owner` — single owner ID
- R12: `objective.requires` — comma-separated capability IDs
- R13: `product.enables` — comma-separated capability IDs
- R14: `improvement.addresses` — comma-separated objective/risk/measure IDs
- R15: All cross-reference IDs must resolve within the workspace (E002)
- R16: `surfaces` targets must be risk or opportunity elements (E002)

### Validation

- R17: E001 — duplicate element id
- R18: E002 — unresolved cross-reference (with target-kind check for `surfaces`)
- R19: E003 — parse errors (unknown type, missing field, unclosed block)
- R20: E004 — element placed in wrong chapter file (e.g. risk in 06-objectives.biz42.md)
- R21: W001 — risk not addressed by any objective
- R22: W002 — objective with no measured-by entries
- R23: W003 — objective with no owner
- R24: W004 — measure not referenced by any objective
- R25: W005 — owner not assigned to any objective
- R26: H001 — signal with no surfaces entries
- R27: H002 — expectation with no surfaces entries
- R28: H003 — capability not enabled by any product
- R29: H004 — product enables is empty
- R30: H005 — block without prose description
- R31: Ignore directives suppress specific rules per file/line: `:::ignore RULE reason :::`
- R32: Stale ignore directives are reported

### CLI Commands

- R33: `biz42 validate [--dir] [--strict] [--quiet] [--format text|json]` — validate workspace
- R34: `biz42 get [<id>] [--type] [--format text|json|markdown]` — inspect elements
- R35: `biz42 explain [<block-type>]` — show field reference and authoring tips
- R36: `biz42 rules [--chapter <n>] [--format text|json]` — list validation rules
- R37: `biz42 init template [--dir]` — generate 12 starter .biz42.md files
- R38: `biz42 init skill [--path]` — install SKILL.md for AI agents
- R39: `biz42 serve [--port] [--open]` — serve SPA with live reload
- R40: `biz42 build --out <dir>` — static SPA export with embedded workspace JSON
- R41: `biz42 guide [migration|chapter <n>]` — authoring guidance text
- R42: `BIZ42_DIR` env var as default workspace directory

### SPA

- R43: Human/agent view toggle — human view shows prose, agent view shows structured fields
- R44: Sidebar navigation by chapter
- R45: Element cards showing all fields and resolved cross-references
- R46: Static export via `biz42 build`
- R47: Live reload via SSE when served with `biz42 serve`

### Example Workspace

- R48: `examples/acme-emergency/docs/biz42/` — 12 .biz42.md files covering a realistic scenario
- R49: Example workspace validates at 0 errors, 0 warnings, 0 hints

### Agent Skill

- R50: `packages/skill/SKILL.md` — self-contained reference for AI agents, covering block types, fields, CLI, validation rules, and authoring rules

## Non-Functional Requirements

### Performance

- NFR01: CLI validate on a workspace of up to 50 files should complete in under 2 seconds
- NFR02: Built CLI bundle ≤ 250 kB gzipped

### Usability

- NFR03: Validation output clearly identifies file, line, rule code, and message
- NFR04: `--format json` output is machine-readable for CI integration
- NFR05: `biz42 explain <type>` is self-contained — no external docs required

## Business Rules

- BR01: Chapter file naming convention: `NN-<slug>.biz42.md` where NN is zero-padded chapter number
- BR02: Block type determines expected chapter — enforced by E004
- BR03: `surfaces` is the only field that links signals/expectations into the traceability chain
- BR04: `objective` is the hub of the traceability chain — all paths converge through it
- BR05: `--strict` flag fails on errors OR hints (warnings alone do not fail `--strict`)

## Assumptions and Dependencies

- TypeScript 5.x, Zod 4.x, React 18, pnpm workspaces, vite-plus
- Mirrors arc42-language package structure 1:1 — design decisions reference arc42-language
- No diagram support in v1 (no `:::diagram` blocks, no Mermaid)
- No `diff` command in v1
- No coverage report in v1
