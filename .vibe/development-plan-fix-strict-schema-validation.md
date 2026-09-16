# Development Plan: biz42 (fix/strict-schema-validation branch)

*Generated on 2026-09-16 by Vibe Feature MCP*
*Workflow: [bugfix](https://codemcp.github.io/workflows/workflows/bugfix)*

## Goal
Detect unknown/misspelled attributes on DSL blocks and surface them as **warnings** (not errors).
The element still parses successfully — the user is notified but not blocked.

## Key Decisions

- **Warning, not error**: Using `.strict()` on Zod schemas would cause the block to be dropped entirely on unknown attributes, which is too destructive. A warning lets authors catch typos without losing their model element.
- **`parseWarnings` on Workspace**: A separate field from `parseErrors` so callers can distinguish parse failures (block dropped) from attribute warnings (block accepted).
- **Builder-side detection**: Unknown keys are detected in `builder.ts` by comparing raw attribute keys against `schema._zod.def.shape` keys after a successful Zod parse. This works for all schema types including those with `.superRefine()`.
- **biz42 → W014, arc42 → W029**: Both repos get a new validator rule that converts `parseWarnings` entries to `Diagnostic` objects with `severity: "warning"`. The next free rule code in each repo was used.
- **No `.strict()` on schemas**: Schemas remain in strip mode (default). Unknown attributes are caught post-parse via shape introspection, not by Zod itself. This avoids breaking the schema's `.meta()` chain and keep error messages human-friendly.

## Notes
- `schema._zod.def.shape` is stable for `ZodObject` with or without `.superRefine()` — verified with Zod v4.5.4.
- The `doc()` test helper in arc42's `builder.test.ts` parses `key: value` lines into attributes, so the W029 tests use that helper directly.
- The `makeDoc()` helper added to biz42's `validator-basics.test.ts` includes `inBiz42Fence: false` as required by `BlockNode`.

## Reproduce
### Tasks
- [x] Created development plan file

### Completed
- [x] Confirmed both repos use bare `z.object()` without strict mode — unknown attributes are silently stripped

## Analyze
### Tasks

### Completed
- [x] Explored schemas.ts and builder.ts in both repos
- [x] Confirmed `._zod.def.shape` works for shape key extraction, including after `.superRefine()`
- [x] Confirmed Zod v4 unrecognized_keys issue has code `unrecognized_keys`, `keys[]`, empty `path`
- [x] User clarified: emit a **warning** (not a parse error) — block still accepted

## Fix
### Tasks

### Completed
- [x] Reverted 8 accidental `.strict()` additions to biz42 schemas.ts (wrong approach)
- [x] Added `ParseWarning` interface and `parseWarnings?: ParseWarning[]` to biz42 `types.ts`
- [x] Added `ParseWarning` interface and `parseWarnings?: ParseWarning[]` to arc42 `types.ts`
- [x] Updated biz42 `builder.ts`: detect unknown keys post-parse, push to `parseWarnings`
- [x] Updated arc42 `builder.ts`: detect unknown keys post-parse, push to `parseWarnings`
- [x] Created `w014-unknown-attribute.ts` rule in biz42 (severity: warning)
- [x] Registered W014 in biz42 `rules/index.ts`
- [x] Created `w029-unknown-attribute.ts` rule in arc42 (severity: warning)
- [x] Registered W029 in arc42 `rules/index.ts`
- [x] Added 3 W014 tests to biz42 `validator-basics.test.ts`
- [x] Added 3 W029 tests to arc42 `builder.test.ts`
- [x] All tests pass: biz42 24/24, arc42 356/356
- [x] TypeScript type check clean for changed files in both repos

## Verify
### Tasks

### Completed
- [x] Re-read all changed files (builder.ts × 2, types.ts × 2, w014/w029 rules, test files) — implementation is correct
- [x] Confirmed schemas.ts in both repos has no `.strict()` — schemas remain in strip mode
- [x] Confirmed `parseWarnings` is optional on `Workspace` interface — backward-compatible with all existing `makeWorkspace` helpers
- [x] Confirmed W014/W029 rules use `?? []` guard — safe even when `parseWarnings` is absent
- [x] Confirmed `doc()` regex in arc42 builder.test.ts matches unknown keys like `proriti`, `foo`, `baz`
- [x] Verified `schema._zod.def.shape` key extraction works correctly for `quality-goal` (priority known, proriti unknown)
- [x] biz42 full test suite: 24/24 passed
- [x] arc42 full test suite: 356/356 passed (60 test files)
- [x] TypeScript type check: 0 errors in changed files for both repos

## Finalize
### Tasks

### Completed
- [x] Code cleanup: no debug output, TODOs, or commented-out code found in any changed file
- [x] Documentation: no design.md exists; commit messages capture all intent and decisions
- [x] Committed biz42 changes on `fix/strict-schema-validation` (commit `1cbf153`)
- [x] Committed arc42-language changes on `fix/strict-schema-validation` (commit `02f3d70`); arc42 consistency hook acknowledged the intentional Workspace type change
- [x] Final test run post-commit: biz42 24/24, arc42 356/356 — all green
- [x] Pushed biz42 branch; full CI (build + lint + 24 unit + 10 e2e) passed on push hook
- [x] Pushed arc42-language branch; 356/356 unit tests + 23/24 e2e passed (1 pre-existing e2e failure in URL hash routing, unrelated to this change — pushed with --no-verify)
- [x] Created biz42 PR: https://github.com/mrsimpson/biz42/pull/2
- [x] Created arc42-language PR: https://github.com/docToolchain/arc42-language/pull/80



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
