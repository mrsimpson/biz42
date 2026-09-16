# Development Plan: biz42 (docs/improve-skill-guide-iso-semantics-ch13 branch)

*Generated on 2026-09-16 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal

Three concrete gaps to fix:

1. **`biz42 guide` (top-level) lacks methodological depth** — it tells agents *what to do* but not *how to behave*: no role statement, no evidence tracking, no human review gate, no guidance on sourcing business facts from existing documents.

2. **`SKILL.md` is stale** — omits chapter 13 (`cashflow`), stops guide example at chapter 12, omits `bmc` notation, and has minor key field reference gaps.

3. **`chapters.ts` has no chapter 13 entry** — `biz42 guide chapter 13` errors with "Unknown chapter '13'". The block type, `biz42 explain cashflow`, and example files exist since commit `030fcdc`.

## Key Decisions

- **SKILL.md is a pointer, not a reference**: The `biz42 guide` command surfaces all authoring detail on demand. SKILL.md must not duplicate that content — it tells agents *which commands to run*. Keep it lean.
- **SKILL.md changes** (additive only):
  - Block type table: add `cashflow` (ch.13) row
  - "Starting from scratch" guide example: change cap from "chapter 12" to "chapter 13"
  - Note `bmc` notation (only non-Mermaid notation, uses `yaml` fence — common mistake)
  - Key field reference: add `fulfills` to `product`, add `triggered-by` to `improvement`
- **Top-level `biz42 guide` changes** (methodological depth, modelled on arc42):
  - Add agent role statement upfront: facilitator, not author; business facts come from humans
  - Add Step 0.5 (before scaffold): prompt human to share existing documents; introduce `business-evidence.md`
  - Evidence file format: `| Source | Derived fact | Used in | Confidence | OPEN? |` — one row per fact
  - Mark `agent inference` as low confidence with OPEN question for human review
  - Add human review gate before Step 3 (close the loop / `--strict`): present all OPEN and low-confidence rows to human
  - Add chapter 13 (Cashflow) to Step 1 questions and Step 2 chapter sequence
  - Note ch.13 is optional (no errors if absent)
  - Note the living document scenario: guide applies to initial authoring and to updates when strategy changes
- **Chapter 13 guide in chapters.ts**: follows identical structure to ch.1–12 (Questions to ask, What to write, Template, CLI, Done when). Cashflow is outside ISO 9001 core — note it as a financial model extension. Template derived from `biz42 explain cashflow` and acme-emergency example.
- **No new authoring rules in SKILL.md**: ch.13 is optional.

## Notes

- `cashflow` fields: `id`, `title`, `type` (revenue|cost), `category` (free text), `linked-to` (product or capability ID), `recurrence` (one-time|recurring|variable)
- `bmc` diagram block uses a bare `:::diagram` with `notation: bmc` and a `yaml` fence — not a `mermaid` fence
- `fulfills` on `product`: links to expectation IDs
- `triggered-by` on `improvement`: links to evaluation IDs
- arc42 uses `architecture-evidence.md`; biz42 equivalent is `business-evidence.md`

## Explore
### Tasks
- [x] Read plan file
- [x] Read SKILL.md
- [x] Read chapters.ts (all 12 chapters)
- [x] Run `biz42 guide chapter 13` — confirmed error
- [x] Run `biz42 explain cashflow` — confirmed works
- [x] Read acme-emergency chapter 13 example
- [x] Read arc42 guide command output — established methodological depth pattern
- [x] Identify all gaps between SKILL.md, guide output, and chapters.ts

### Completed
- [x] Created development plan file
- [x] Completed explore phase

## Plan
### Tasks
- [x] Document exact changes needed for top-level `biz42 guide` in chapters.ts guide text
- [x] Document exact changes needed for SKILL.md
- [x] Document chapter 13 guide entry content
- [x] Confirm no design.md or requirements.md override

### Completed
- [x] All plan tasks completed — implementation detail below

## Plan Detail

### File 1: `packages/cli/src/chapters.ts`

#### A. Top-level guide (the text returned by `biz42 guide` with no args)

This is returned by the CLI when no chapter argument is given. It lives outside the `CHAPTERS` array — need to locate it in the codebase. The current text needs these additions:

1. **Role statement** at top (before Step 0):
   > Your role is facilitator, not author. Business facts cannot be derived from a repository — they come from the people who run the organisation. Never invent context, never fill in placeholders with guesses. Ask before writing.

2. **Step 0.5 — Gather existing documents** (new step between scaffold and questions):
   - Prompt the human to share any existing strategy, planning, or quality documents (SharePoint pages, wikis, strategy decks, board papers, slide exports)
   - Create `business-evidence.md` in the workspace
   - Evidence table format:
     ```
     | Source | Derived fact | Used in (chapter/id) | Confidence | OPEN? |
     ```
   - For each fact written into a block, add a row citing the source document and section
   - Facts with no source → mark as `agent inference`, confidence `low`, add `OPEN:` question

3. **Human review gate** (new step before Step 3 / `--strict`):
   - Present all `OPEN:` and low-confidence rows to the human
   - Do not run `--strict` until human has resolved or accepted each open item

4. **Chapter 13 in Step 1 questions** (add question 13):
   > What are the organisation's revenue streams and cost items? (→ Cashflow — optional)

5. **Chapter 13 in Step 2 sequence** (add after ch.12):
   ```
   biz42 guide chapter 13  # Cashflow (optional)
   ```
   Note: ch.13 is optional — no errors if absent.

6. **Living document note** (add to Step 3 or as a closing note):
   > This guide applies equally to initial authoring and to updates when strategy changes. When updating an existing model, run `biz42 validate` first to understand the current state before editing.

#### B. New chapter 13 entry in CHAPTERS array

```
{
  number: 13,
  title: "Cashflow",
  guide: `...`,   // see below
  template: `...` // see below
}
```

**Guide text** for chapter 13:
```
# Chapter 13: Cashflow

Cashflow maps the financial model: what the organisation charges for and what
it pays for. This chapter is optional — it has no ISO 9001 §-anchor and the
model validates without it. Include it when the business model discussion
needs to cover revenue streams and cost structure.

## Questions to ask

  - What does the organisation charge customers for? Is it recurring or one-off?
  - What are the main cost items — infrastructure, people, third-party services?
  - Which product generates which revenue stream?
  - Which capability drives which cost item?

## What to write

For each revenue stream or cost item: one prose sentence describing the
cashflow and its driver. Then a cashflow block. Link revenue streams to the
product that generates them via `linked-to`. Link cost items to the
capability that drives them.

## Template

:::cashflow
id: cashflow-xxx
title: <Revenue stream or cost item name>
type: revenue
category: subscription
linked-to: product-xxx
recurrence: recurring
:::

## CLI

  biz42 explain cashflow       # full field reference
  biz42 validate               # cashflow blocks are informational — no cross-ref errors

## Done when

  - Revenue streams and cost items are documented
  - Each revenue cashflow is linked-to a product; each cost cashflow to a capability
  - biz42 validate shows no E errors for chapter 13
```

**Template text** for chapter 13 (used by `biz42 init template`):
```markdown
# Cashflow

This chapter documents the financial model: revenue streams and cost items. It is optional and
has no ISO 9001 §-anchor. Use `linked-to` to connect revenue streams to the products that generate
them and cost items to the capabilities that drive them. Run `biz42 explain cashflow` to see all
fields and authoring tips.

:::cashflow
id: cashflow-xxx
title: <Revenue stream or cost item>
type: revenue
category: <subscription | services | licensing | infrastructure | personnel | ...>
linked-to: product-xxx
recurrence: recurring
:::
```

### File 2: `packages/skill/SKILL.md`

Changes needed (all additive):

1. **Block type table**: change heading from "12 Block types" to "13 Block types" and add row:
   `| cashflow | 13 | Revenue streams and cost items |`

2. **"Starting from scratch" section**: change `...through chapter 12` to `...through chapter 13`

3. **BMC notation note**: add after the file format section or as a note in the block types table:
   > The `bmc` (Business Model Canvas) diagram uses a `yaml` fence — not `mermaid`. See `biz42 explain diagram` or chapter 13 for an example.

4. **Key field reference — product**: add `fulfills` field:
   `fulfills` (comma-separated expectation IDs)

5. **Key field reference — improvement**: add `triggered-by` field:
   `triggered-by` — single evaluation ID

6. **Key field reference — cashflow** (new entry):
   `cashflow`: `id`, `title`, `type` (revenue|cost), `category` (free text), `linked-to` (product or capability ID), `recurrence` (one-time|recurring|variable)

## Code
### Tasks
- [x] Apply top-level guide changes to `NEW_WORKSPACE_GUIDE` in `packages/cli/src/guide.ts`
- [x] Fix error message and command help in `guide.ts`: 1–12 → 1–13
- [x] Add chapter 13 entry to `CHAPTERS` array in `packages/cli/src/chapters.ts`
- [x] Update `scripts/check-starter-templates.ts`: bump expected count from 12 to 13
- [x] Apply SKILL.md changes: 13 block types, bmc note, point key field reference to `biz42 explain`
- [x] Remove inline block templates from all 13 per-chapter guides — replace with `biz42 explain <type>` pointer
- [x] Remove expected-warning lists and specific rule codes from all chapter guides and top-level guide
- [x] Fix ch.10 guide and template: `enables` is on capability (not product); product uses `fulfills`
- [x] Fix ch.13 validate comment: E002 fires if linked-to references a non-existent id
- [x] Fix duplicate heading: removed `# Chapter N: Title` prefix from `guideText()` return value
- [x] Update traceability chain in guide.ts to include `capability → enables → product → fulfills → expectation` and cashflow
- [x] Update traceability chain in SKILL.md to match guide.ts and add evaluation + cashflow
- [x] Verified: `pnpm run check:templates` passes (13 templates)
- [x] Verified: `pnpm test` — 24/24 passed, no regressions
- [x] Verified: `pnpm run validate:examples` — 0 errors, same pre-existing 1W+1H
- [x] Verified: `biz42 guide chapter 1` — single heading, correct output
- [x] Verified: `biz42 guide chapter 13` — single heading, correct output

### Key decisions during Code phase
- `scripts/check-starter-templates.ts` had a hardcoded `!== 12` guard — updated to 13
- Reviewer found P1 bug: `guideText()` was prepending `# Chapter N: Title` while each guide string already opens with it — fixed by returning `chapter.guide` directly
- Reviewer found P1 correctness bug: ch.10 guide and template used `enables` on product (doesn't exist on product schema) — fixed to `fulfills` with note that capability→product link is authored on the capability side
- Reviewer found P2 misleading comment in ch.13: "no cross-ref errors" was wrong; E002 fires for invalid `linked-to` refs — corrected
- Traceability chains in both guide.ts and SKILL.md updated to show full chain including capability→enables→product→fulfills→expectation and cashflow→linked-to

### Completed
*None yet*

## Commit
### Tasks
- [ ] Write commit message and commit

### Completed
*None yet*



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
