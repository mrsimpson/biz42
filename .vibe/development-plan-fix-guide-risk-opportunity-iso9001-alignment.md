# Development Plan: biz42 (fix/guide-risk-opportunity-iso9001-alignment branch)

*Generated on 2026-09-17 by Vibe Feature MCP*
*Workflow: [minor](https://codemcp.github.io/workflows/workflows/minor)*

## Goal

Trim redundancy from all chapter guides in `packages/cli/src/chapters.ts`. Each guide currently contains:
1. Sentences duplicated verbatim from the chapter's own template intro
2. Field semantics / authoring tips that already live in the Zod schema and are surfaced by `biz42 explain <type>`

The fix makes each guide purely process-oriented (ask → write → validate → done) and redirects field/schema questions to `biz42 explain <type>`.

## Key Decisions

- **Single source of truth for field semantics**: `schemas.ts` authoring tips + `biz42 explain <type>`. Guides must not repeat these.
- **Single source of truth for block structure**: The chapter template. Guides must not repeat the template's intro sentences.
- **Guide = process, not schema**: Each guide answers "what questions to ask" and "when is this chapter done". It does not describe what fields mean or what ISO clause applies.
- **No ISO clause references in guides**: These belong in the template intros and schema tips, not the guide text.
- **Explain banner in `guide.ts`**: The "use `biz42 explain <type>`" directive is injected once in `guideText()` as a `EXPLAIN_BANNER` constant prepended to all chapter guide output — not repeated per chapter.
- **Scope of change**: `packages/cli/src/chapters.ts`, `packages/cli/src/guide.ts`, `packages/core/src/explain.ts`, `packages/core/src/model/schemas.ts`, `docs/model-structure.md`.
- **`preventive` → `proactive`**: ISO 9001:2015 dropped "preventive action" as a standalone concept (absorbed into §6.1 risk-based thinking). Renamed enum value to `proactive` (act before failure recurs) to avoid ISO 2008 terminology confusion.
- **Rendering bug fixed**: `formatExplainText()` was not outputting `authoringTips` — fixed by adding the tips section after cross-references, mirroring `formatExplainDiagramText()`.
- **ISO compliance improvements**: evaluation clause broadened from "§9" to §9.1+§9.2+§9.3; owner narrowed from §5.1+§5.3 to §5.3 primary; product expanded with §8.2; scope/expectation/opportunity/objective tips enriched with compliance gaps identified in thinker review.

## Notes

### Redundancy map (guide ↔ template)
| Ch | Duplicated sentence |
|----|---------------------|
| 5  | "An opportunity is a possibility, not a commitment — commitments come in chapter 6." |
| 6  | "An objective without a measure is unverifiable. One without an owner is unaccountable." |
| 9  | "A capability marked `gap` that is required by an objective is a strategic finding." |
| 10 | "A product is the delivery vehicle; the capability is the underlying ability." |
| 11 | "It must be recurring and have a defined cadence — not a one-off event." |
| 12 | "They arise from evaluation findings and feed back into the model." |

### Redundancy map (guide ↔ schema/explain)
| Ch | Duplicated concept | Schema field / tip |
|----|--------------------|--------------------|
| 4  | "severity = likelihood × impact" | RiskSchema authoringTip |
| 7  | "A measure that no objective references is orphaned" | MeasureSchema authoringTip |
| 7  | "rate, count, threshold, date" description of target | MeasureSchema `target` field description |

### ISO clause concern (original issue)
The user noted that per ISO 9001, risks and opportunities in §6.1 are **organisational** risks/opportunities — not risks encountered when trying to address signals. The RiskSchema already has the correct authoring tip: "Focus on risks for the organization! Don't include flaws in the product..." The chapter 4 guide does not contradict this, but its framing ("risks are interpretations of signals") could imply a narrower scope. The guide should be neutral on this — it's a process guide, not a definition.

## Explore
### Tasks
- [x] Read all chapter guides and compare against templates and schemas
- [x] Map all redundancy (guide ↔ template, guide ↔ schema)
- [x] Document key decisions
- [x] Define edit approach for each chapter

### Per-chapter edit plan
- **Ch 1 Scope**: Clean as-is. Add `biz42 explain scope` redirect to "What to write". No removal needed.
- **Ch 2 Signals**: Clean as-is. Add `biz42 explain signal` redirect.
- **Ch 3 Expectations**: Clean as-is. Add `biz42 explain expectation` redirect.
- **Ch 4 Risks**: Remove severity explanation ("product of likelihood × impact") from "Questions to ask" — it's in the schema tip. Add redirect. Rephrase to not imply risks are *only* interpretations of signals.
- **Ch 5 Opportunities**: Remove "An opportunity is a possibility, not a commitment" sentence (in template). Add redirect.
- **Ch 6 Objectives**: Remove "An objective without a measure is unverifiable. One without an owner is unaccountable." (in template). Add redirect.
- **Ch 7 Measures**: Remove "A measure that no objective references is orphaned" (schema tip). Remove field-type description ("rate, count, threshold, date" — in schema). Add redirect.
- **Ch 8 Owners**: Clean as-is ("A committee is not an owner" is good unique framing). Add redirect.
- **Ch 9 Capabilities**: Remove "A capability marked `gap` that is required by an objective is a strategic finding" (in template). Add redirect.
- **Ch 10 Products**: Remove "A product is the delivery vehicle; the capability is the underlying ability" (in template). Add redirect.
- **Ch 11 Evaluation**: Remove "It must be recurring and have a defined cadence" (in template). Add redirect.
- **Ch 12 Improvements**: Remove "They arise from evaluation findings and feed back into the model" (in template). Add redirect.
- **Ch 13 Cashflow**: Clean as-is. Add redirect.

### Completed
- [x] Created development plan file
- [x] Analyzed all 13 chapter guides
- [x] Documented all decisions and edit plan

## Implement
### Tasks
- [x] Edit all 13 chapter guides in `packages/cli/src/chapters.ts` per plan above
- [x] Add `EXPLAIN_BANNER` to `guide.ts` — single DRY redirect to `biz42 explain`
- [x] Fix rendering bug in `explain.ts` — `formatExplainText()` now outputs `authoringTips`
- [x] Rename `preventive` → `proactive` in `ImprovementSchema` enum + tips + `docs/model-structure.md`
- [x] ISO compliance improvements across `schemas.ts` authoring tips (evaluation, owner, product, scope, expectation, opportunity, objective)
- [x] Build passes, all 24 tests pass

### Completed
- All implementation tasks done

## Finalize
### Tasks
- [ ] To be added when this phase becomes active

### Completed
*None yet*

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
