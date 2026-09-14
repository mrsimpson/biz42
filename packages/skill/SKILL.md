# biz42 Agent Skill

You are working with a biz42 business model workspace — a set of `.biz42.md`
files that document an organisation's strategy using the biz42 DSL.

## File format

Each chapter is a separate `.biz42.md` file. Blocks use `:::type ... :::` syntax
inside optional ` ```biz42 ``` ` fences:

```markdown
```biz42
:::objective
id: obj-example
title: Achieve X
addresses: risk-y
measured-by: measure-z
owner: owner-cto
requires: capability-foo
:::
```
```

## 12 Block types

| Type        | Ch | Purpose |
|-------------|-----|---------|
| `scope`       | 01 | Organisation scope and boundaries |
| `signal`      | 02 | External/internal factors (ISO 9001 §4.1) |
| `expectation` | 03 | Stakeholder needs (ISO 9001 §4.2) |
| `risk`        | 04 | Negative threats (ISO 9001 §6.1) |
| `opportunity` | 05 | Positive opportunities (ISO 9001 §6.1) |
| `objective`   | 06 | SMART goals — hub of the traceability chain |
| `measure`     | 07 | Success criteria |
| `owner`       | 08 | Accountability |
| `capability`  | 09 | Organisational abilities |
| `product`     | 10 | Products and services delivered |
| `evaluation`  | 11 | Performance evaluation practices |
| `improvement` | 12 | Planned improvement actions |

## Traceability chain

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

## Key field reference

**signal**: `id`, `title`, `source` (external|internal|free text), `surfaces` (comma-separated risk/opportunity IDs)

**expectation**: `id`, `title`, `source` (stakeholder), `surfaces` (comma-separated risk/opportunity IDs)

**objective** (hub):
- `id` (required), `title` (required)
- `addresses` — comma-separated risk or opportunity IDs
- `measured-by` — comma-separated measure IDs
- `owner` — single owner ID
- `requires` — comma-separated capability IDs

**risk**: `id`, `title`, `severity` (high|medium|low), `mitigation`

**capability**: `id`, `title`, `status` (exists|planned|gap)

**product**: `id`, `title`, `enables` (comma-separated capability IDs)

**improvement**: `id`, `title`, `addresses` (comma-separated objective/risk/measure IDs)

## CLI commands

```bash
biz42 validate [--dir <path>] [--strict]     # validate workspace
biz42 get [<id>] [--type <type>] [--format text|json|markdown]
biz42 explain [<block-type>]                 # field and tip reference
biz42 rules [--chapter <n>]                  # list validation rules
biz42 init template [--dir <path>]           # create starter files
biz42 init skill [--path <dest>]             # install this SKILL.md
biz42 serve [--port 3142] [--open]           # open SPA in browser
biz42 build --out <dir>                      # static SPA export
biz42 guide [migration|chapter <n>]          # authoring guidance
```

## Validation rules quick reference

**Errors (E):**
- E001 Duplicate element id
- E002 Unresolved cross-reference
- E003 Unknown block type / missing required field
- E004 Element in wrong chapter file

**Warnings (W):**
- W001 Risk not addressed by any objective
- W002 Objective has no measured-by entries
- W003 Objective has no owner
- W004 Measure not referenced by any objective
- W005 Owner not assigned to any objective

**Hints (H):**
- H001 Signal has no `surfaces` entries — not linked to any risk or opportunity
- H002 Expectation has no `surfaces` entries — not linked to any risk or opportunity
- H003 Capability not enabled by any product
- H004 Product.enables is empty
- H005 Block has no prose description

## Authoring rules for agents

1. Every block **must** have a unique `id` — use kebab-case: `obj-privacy-arch`
2. `objective` is the traceability hub — always fill `addresses`, `measured-by`, `owner`
3. Every `risk` should be addressed by at least one `objective`
4. Every `objective` needs at least one `measure` in `measured-by`
5. Field names are **kebab-case** in the DSL: `measured-by`, not `measuredBy`
6. Fill `surfaces` on every `signal` and `expectation` to link them to the risks/opportunities they reveal
7. Suppress a rule for a specific block: `:::ignore H001 reason :::` inside a ` ```biz42 ` fence
8. Blocks without prose get H005 hints — add a sentence of context above each block
9. Always close every block with `:::` — a missing closing fence silently drops the element and produces E003

## Typical agent workflow

1. `biz42 validate` — check current state
2. `biz42 get --type objective` — see what objectives exist
3. `biz42 get <id>` — inspect a specific element and its references
4. `biz42 explain objective` — look up fields and tips for a block type
5. Edit `.biz42.md` files — add/update blocks and prose
6. `biz42 validate` — verify changes are consistent
