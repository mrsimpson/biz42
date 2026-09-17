# Development Plan: biz42 (refactor/remove-init-template branch)

*Generated on 2026-09-17 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal

Remove the `init template` subcommand from the `biz42` CLI. The `guide <chapter>` command already provides chapter-by-chapter authoring instructions, making the template scaffolding redundant. Keep `init skill` intact.

## Key Decisions

- **Only `init template` is removed** — `init skill` is preserved as-is.
- **No replacement needed** — `guide` already covers the authoring workflow. The overlap: `guide.ts` (line 172) already instructs users to run `biz42 init template --dir ./docs/biz42` as a setup step, which will be replaced with a plain instruction to create files manually or rely on guide output.
- **No automated tests to update** — no test files cover `init template` or `runInitTemplate`.
- **`CHAPTERS` constant stays** — it is defined in `packages/cli/src/chapters.ts` and is used by the `guide` command too. Only the `template` property on each chapter object may become unused; the constant itself must not be removed.
- **`runInitTemplate` and its `CHAPTERS` import in `cli.ts` can be deleted** — after verifying nothing else in `cli.ts` uses the `template` property.
- **`init` dispatcher in `runInit` must be simplified** — remove the `template` branch and update the usage error message to show only `init skill`.

## Notes

### Files to change

| File | What changes |
|------|-------------|
| `packages/cli/src/cli.ts` | Remove `runInitTemplate()` function, remove `template` branch in `runInit()`, update usage string |
| `packages/cli/src/guide.ts` | Remove two references to `biz42 init template` (lines 101, 172); replace line 172 with a plain file-creation instruction |
| `packages/skill/SKILL.md` | Remove line 9: `biz42 init template [--dir <path>]` |
| `packages/site/src/components/GettingStarted.tsx` | Remove or replace the `npx @biz42/cli init template` code snippet (line 35) |

### Files NOT to change

- `packages/cli/src/chapters.ts` — `CHAPTERS` constant stays; the `template` property is defined there but removing it is out of scope for this refactor.
- `.vibe/development-plan-*.md` — historical plan files are read-only records, no changes needed.

### `filename()` helper

Used by `runInitTemplate` to derive filenames from chapter objects. After removing `runInitTemplate`, check if `filename()` is used anywhere else in `cli.ts`. If not, it can also be removed.

## Explore

### Tasks
- [x] Read plan file
- [x] Read `packages/cli/src/cli.ts` — located `runInit`, `runInitTemplate`, `CHAPTERS` usage
- [x] Read `packages/cli/src/guide.ts` — found 2 references to `init template` (lines 101, 172)
- [x] Search all `.ts` files for `init template`
- [x] Search all `.md` and `.tsx` files for `init template`
- [x] Identify all files requiring changes
- [x] Confirm no test files reference `init template`

### Completed
- [x] Created development plan file
- [x] Full explore phase complete — all affected files identified

## Plan
### Tasks
- [x] Define exact code changes for each file (line-level)

### Completed

#### `packages/cli/src/cli.ts`

1. **Line 33** — remove the `{ CHAPTERS, filename }` import from `./chapters.ts` entirely.
   - `CHAPTERS` is only used in `runInitTemplate` (line 438) — unused after removal.
   - `filename` is only used in `runInitTemplate` (line 439) — unused after removal.
   - `CHAPTERS` is still used in `guide.ts` via its own import; `chapters.ts` is not touched.

2. **Lines 385–398** — replace `runInit()` dispatcher:
   - Remove the `template` branch (`else if (subcommand === "template") { runInitTemplate(args.slice(1)); }`).
   - Update the usage error message from
     `biz42 init skill [--path <dest>]\n  biz42 init template [--dir <path>]`
     to just
     `biz42 init skill [--path <dest>]`.

3. **Lines 426–454** — delete the entire `runInitTemplate()` function.

#### `packages/cli/src/guide.ts`

4. **Lines 97–112** (`case "init":` help block) — rewrite to remove all `template` references:
   - Change headline: `biz42 init — install agent skill`
   - Remove the `biz42 init template [--dir <path>]` usage line.
   - Remove `template` from the Subcommands section.
   - Remove `--dir <path>` option line (only used by template).

5. **Line 24** (`rootHelp`) — update `init` description from
   `init            Initialize templates or install agent skill`
   to
   `init            Install the biz42 agent skill`.

6. **Lines 170–178** (`NEW_WORKSPACE_GUIDE`, Step 0) — replace the entire "Step 0 — Scaffold the workspace" section:
   - Remove `biz42 init template --dir ./docs/biz42` code block and its prose.
   - Replace with instruction to create files manually: agents should create the chapter files themselves using `biz42 guide chapter <n>` to get authoring instructions for each chapter, then create the corresponding `.biz42.md` file with an empty block stub.
   - Renumber: "Step 0" stays, but the body changes from a CLI invocation to a manual instruction.

#### `packages/skill/SKILL.md`

7. **Line 9** — remove `biz42 init template [--dir <path>]           # create starter chapter files` from the top-level commands block.

#### `packages/site/src/components/GettingStarted.tsx`

8. **Lines 34–36** — remove the `<div className="gs__snippet"><code>npx @biz42/cli init template</code></div>` snippet from the "AI agent" card. The `biz42 guide chapter 1` snippet on line 37–39 stays.

---

#### Key decisions finalized in Plan phase

- **`filename()` removal**: `filename` is exported from `chapters.ts` and is only consumed by `runInitTemplate` in `cli.ts`. After removing `runInitTemplate`, the import of `filename` in `cli.ts` is dead. The export in `chapters.ts` can stay (no harm, out of scope to remove). Only the import line in `cli.ts` changes.
- **`CHAPTERS` import in `cli.ts`**: After removing `runInitTemplate`, `CHAPTERS` is no longer referenced in `cli.ts`. Remove the whole `import { CHAPTERS, filename } from "./chapters.ts"` line. `guide.ts` has its own `CHAPTERS` import and is unaffected.
- **Step 0 replacement wording**: Instead of scaffolding via CLI, the guide will instruct the agent to create chapter files as it works through them. The validate step in Step 0 is removed too since there are no files yet. Step 0.5 (gather documents) is unaffected and stays.
- **No `--dir` option removal from `--help` entry for `init`**: the `--dir` option only applied to `template`. After removing `template`, the option line for `--dir` in the `init` help block is also removed.

## Code
### Tasks
- [x] `packages/cli/src/cli.ts`: remove `runInitTemplate()`, remove `template` branch in `runInit()`, update usage string, remove `CHAPTERS`+`filename` import
- [x] `packages/cli/src/guide.ts`: remove/replace both `init template` references
- [x] `packages/skill/SKILL.md`: remove `init template` line
- [x] `packages/site/src/components/GettingStarted.tsx`: remove `init template` code snippet
- [x] Build and verify no compile errors

### Completed
- Removed `import { CHAPTERS, filename } from "./chapters.ts"` from `cli.ts` (both only used in `runInitTemplate`)
- Simplified `runInit()` dispatcher: removed `template` branch, updated usage error message to `biz42 init skill [--path <dest>]`
- Deleted `runInitTemplate()` function (lines 426–454)
- Updated `rootHelp()` in `guide.ts`: `init` description now reads "Install the biz42 agent skill"
- Updated `case "init":` help block in `guide.ts`: headline, usage, subcommands, and options now show only `skill`
- Replaced "Step 0 — Scaffold the workspace" in `NEW_WORKSPACE_GUIDE` with "Step 0 — Create chapter files as you go" (manual per-chapter creation)
- Removed `biz42 init template` line from `SKILL.md` CLI commands block
- Removed `npx @biz42/cli init template` snippet from `GettingStarted.tsx` "AI agent" card
- Build: clean (`pnpm --filter @biz42/cli build` exits 0)
- Smoke-test: `biz42 init template` exits 2 with correct usage message; `biz42 init --help` shows only `skill`

## Commit
### Tasks
- [ ] Write commit message following project conventions

### Completed
*None yet*



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
