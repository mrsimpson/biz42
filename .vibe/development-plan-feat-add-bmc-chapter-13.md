# Development Plan: biz42 (feat/add-bmc-chapter-13 branch)

*Generated on 2026-09-17 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal

Add a Business Model Canvas (BMC) section to chapter 13 (Cashflow) of the biz42 documentation framework.

This means:
1. Updating the chapter 13 **guide** in `packages/cli/src/chapters.ts` to explain the BMC diagram and how to author it alongside cashflow blocks.
2. Updating the chapter 13 **template** in `packages/cli/src/chapters.ts` to include a starter `:::diagram notation: bmc` block with a YAML stub.
3. Updating `docs/model-structure.md` to add a chapter 13 section documenting Cashflow and the BMC as an optional visualisation layer.

The example file `examples/acme-emergency/docs/biz42/13-cashflow.biz42.md` **already contains a fully working BMC diagram** — no changes needed there.

## Key Decisions

- **Scope is documentation/templates only.** The BMC parser (E015), validator rules, and rendering are already fully implemented. No TypeScript code changes needed.
- **`docs/model-structure.md` currently has no chapter 13 section.** It will be added as a new section at the end of the file. The BMC is described as an optional visualisation on top of cashflow elements — not a separate model element, since it has no ISO 9001 mapping.
- **chapter 13 guide** gets a new "## Business Model Canvas" subsection after the existing "What to write" section, explaining: the nine slots, which ones reference biz42 ids (validated by E015), and which are free-text strings.
- **chapter 13 template** gets a BMC `:::diagram` block appended after the existing `cashflow` block stub, with all nine BMC YAML slots shown as comments.
- **Slot mapping for the guide:** value-propositions → product ids, key-resources/key-activities/channels → capability ids, cost-structure → cashflow ids (type: cost), revenue-streams → cashflow ids (type: revenue), key-partners/customer-segments/customer-relationships → free-text strings.
- **The guide's "Done when" section** gets a new bullet: BMC diagram present and `biz42 validate` shows no E015 errors.

## Notes

- Branch: `feat/add-bmc-chapter-13`
- Only `*.md`, `*.txt`, `*.adoc` files can be edited in the Plan phase; `*.ts` is allowed in Code
- The acme-emergency example already demonstrates the BMC correctly and validates without errors
- BMC validation rule E015 validates: value-propositions (product ids), key-resources/key-activities/channels (capability ids), cost-structure (cashflow ids type:cost), revenue-streams (cashflow ids type:revenue). Free-text slots are not validated.
- The YAML source for a BMC diagram follows a flat `key: [list]` structure inside a fenced YAML block that immediately follows the `:::diagram` block

## Explore

### Tasks
- [x] Read development plan
- [x] Read `docs/model-structure.md`
- [x] Read `examples/acme-emergency/docs/biz42/13-cashflow.biz42.md`
- [x] Read `packages/cli/src/chapters.ts` (chapter 13 guide + template)
- [x] Read E015 validation rule to understand BMC slot rules
- [x] Confirm no code changes are needed (BMC already fully implemented)

### Completed
- [x] Created development plan file
- [x] Full codebase exploration complete

## Plan

### Tasks
- [x] Read current chapter 13 guide and template text (lines 614–666 of chapters.ts)
- [x] Confirm docs/model-structure.md has no chapter 13 section (ends at chapter 12)
- [x] Decide exact content for each of the three file changes
- [x] Document implementation tasks in Code section

### Key planning decisions recorded above

### Completed
- [x] All plan tasks complete

## Code

### Tasks

#### Task 1 — Update chapter 13 guide in `packages/cli/src/chapters.ts`

**File:** `packages/cli/src/chapters.ts`  
**Location:** The `guide` string for chapter 13 (starting at line ~617)

Add a new `## Business Model Canvas` section after the existing `## What to write` section, and add a bullet to `## Done when`.

New guide content (replace the existing guide string):

```
# Chapter 13: Cashflow

Cashflow maps the financial model: what the organisation charges for and what
it pays for. This chapter is optional — it has no ISO 9001 §-anchor and the
model validates without it. Include it when the business model discussion
needs to cover revenue streams and cost structure explicitly.

## Questions to ask

  - What does the organisation charge customers for? Is it recurring or one-off?
  - What are the main cost items — infrastructure, people, third-party services?
  - Which product generates which revenue stream?
  - Which capability drives which cost item?

## What to write

For each revenue stream or cost item: one prose sentence describing the
cashflow and its driver. Then a cashflow block. Link each item to the
product or capability it is tied to.

## Business Model Canvas

Add a single BMC diagram at the end of chapter 13 to visualise the full
business model on one canvas. The diagram uses `notation: bmc` and its
content is a YAML block with nine fixed slots:

  - `value-propositions`     — list of product ids
  - `key-resources`          — list of capability ids
  - `key-activities`         — list of capability ids
  - `channels`               — list of capability ids
  - `cost-structure`         — list of cashflow ids (type: cost)
  - `revenue-streams`        — list of cashflow ids (type: revenue)
  - `key-partners`           — free-text list (not validated)
  - `customer-segments`      — free-text list (not validated)
  - `customer-relationships` — free-text list (not validated)

The six id-based slots are validated by rule E015: each id must exist in the
workspace and match the expected element kind. Free-text slots accept any string.

## CLI

  biz42 explain cashflow       # block syntax and full field reference
  biz42 explain diagram bmc    # BMC notation and slot reference
  biz42 validate               # E002 fires if linked-to references a non-existent id
                               # E015 fires if a BMC slot references a wrong element kind

## Done when

  - Revenue streams and cost items are documented
  - Each cashflow is linked to the product or capability it is tied to
  - A BMC diagram is present and all nine slots are filled
  - biz42 validate shows no E errors for chapter 13
```

---

#### Task 2 — Update chapter 13 template in `packages/cli/src/chapters.ts`

**File:** `packages/cli/src/chapters.ts`  
**Location:** The `template` string for chapter 13 (starting at line ~648)

Append a BMC diagram stub after the existing cashflow block stub.

New template content (replace the existing template string):

```
# Cashflow

This chapter documents the financial model: revenue streams and cost items. It is optional and
has no ISO 9001 §-anchor. Use `linked-to` to connect revenue streams to the products that generate
them and cost items to the capabilities that drive them. Run `biz42 explain cashflow` to see all
fields and authoring tips.

```biz42
:::cashflow
id: cashflow-xxx
title: <Revenue stream or cost item>
type: revenue
category: <subscription | services | licensing | infrastructure | personnel | ...>
linked-to: product-xxx
recurrence: recurring
:::
```

## Business Model Canvas

The BMC visualises the complete business model. Add one at the end of this chapter once all
cashflow elements, products, and capabilities are defined.

:::diagram
id: diagram-bmc
title: Business Model Canvas
notation: bmc
:::

```yaml
key-partners:
  - "<Partner or supplier>"
key-resources:
  - capability-xxx
key-activities:
  - capability-xxx
value-propositions:
  - product-xxx
customer-relationships:
  - "<Relationship type>"
channels:
  - capability-xxx
customer-segments:
  - "<Target segment>"
cost-structure:
  - cashflow-xxx
revenue-streams:
  - cashflow-xxx
```
```

---

#### Task 3 — Add chapter 13 section to `docs/model-structure.md`

**File:** `docs/model-structure.md`  
**Location:** Append a new `## 13. Cashflow` section after the `## 12. Improvements` section, before the `## Relationship Summary` section. Also add chapter 13 row to the ISO 9001:2015 Coverage table.

New section content:

```markdown
## 13. Cashflow

**ISO 9001 mapping:** None — this chapter has no direct ISO 9001 clause anchor.

**What it is:** The financial model of the business: what the organisation charges for (revenue
streams) and what it spends on (cost items). Cashflow is optional — the model validates without
it. Include it when the business model discussion needs to make the financial logic explicit.

**Structure:** Each cashflow item has a `type` (`revenue` or `cost`), a `category`, a
`recurrence` (`recurring` or `one-time`), and a `linked-to` reference pointing to the product
or capability it is tied to.

**Business Model Canvas:** Chapter 13 also hosts the Business Model Canvas (BMC) diagram
(`notation: bmc`). The BMC is a one-page visualisation that maps all nine building blocks of the
business model onto a single canvas. Its slots reference existing biz42 ids: products for
value-propositions, capabilities for key-resources/key-activities/channels, and cashflow items
for cost-structure and revenue-streams. The remaining slots (key-partners, customer-segments,
customer-relationships) are free-text.

**Relates to:** Cashflow links revenue streams to _Products & Services_ and cost items to
_Capabilities_. The BMC draws on elements from every other chapter.
```

And in the ISO coverage table, add a row:

```
| Cashflow / BMC    | —          | ✓ (optional) |
```

---

## Commit

### Tasks
- [ ] Write a conventional commit message and commit the changes

### Completed
*None yet*

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
