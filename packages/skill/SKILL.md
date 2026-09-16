---
name: biz42
description: The `biz42` CLI manages a plain-text business model — a set of `.biz42.md` files that describe an organisation's strategy using the biz42 DSL (grounded in ISO 9001:2015). Use it whenever business modelling related tasks are required (e. g. new strategies, product, opotunities, risks arise)
---

## CLI — top-level commands

```bash
biz42 init template [--dir <path>]           # create starter chapter files
biz42 guide [chapter <n>]                    # authoring guidance per chapter
biz42 validate [--dir <path>] [--strict]     # validate workspace consistency
biz42 get [<id>] [--type <type>] [--format text|json|markdown]
biz42 explain [<block-type>]                 # field reference and tips
biz42 rules [--chapter <n>]                  # list all validation rules
biz42 serve [--port 3142] [--open]           # open SPA viewer in browser
biz42 build --out <dir>                      # static SPA export
```

## Starting from scratch

`guide` is the entry point for building a new model. Always start there:

```bash
biz42 guide                  # Explains the overall workflow
biz42 guide chapter 1        # get authoring instructions for Scope
biz42 guide chapter 2        # then Signals, and so on through chapter 12
```

Ask the human questions for each chapter — business context cannot be derived from
the repository. Work chapter by chapter, validate after each one, and fix any errors
before moving on.

```bash
biz42 validate               # check consistency after each chapter
```

## File format

Each chapter is a separate `.biz42.md` file. Blocks use `:::type ... :::` syntax
inside optional ` ```biz42 ``` ` fences:

````markdown
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
````

## 12 Block types

| Type          | Ch  | Purpose                                     |
| ------------- | --- | ------------------------------------------- |
| `scope`       | 01  | Organisation scope and boundaries           |
| `signal`      | 02  | External/internal factors (ISO 9001 §4.1)   |
| `expectation` | 03  | Stakeholder needs (ISO 9001 §4.2)           |
| `risk`        | 04  | Negative threats (ISO 9001 §6.1)            |
| `opportunity` | 05  | Positive opportunities (ISO 9001 §6.1)      |
| `objective`   | 06  | SMART goals — hub of the traceability chain |
| `measure`     | 07  | Success criteria                            |
| `owner`       | 08  | Accountability                              |
| `capability`  | 09  | Organisational abilities                    |
| `product`     | 10  | Products and services delivered             |
| `evaluation`  | 11  | Performance evaluation practices            |
| `improvement` | 12  | Planned improvement actions                 |

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

## Authoring rules

1. Every block **must** have a unique `id` — use kebab-case: `obj-privacy-arch`
2. `objective` is the traceability hub — always fill `addresses`, `measured-by`, `owner`
3. Every `risk` should be addressed by at least one `objective`
4. Every `objective` needs at least one `measure` in `measured-by`
5. Field names are **kebab-case** in the DSL: `measured-by`, not `measuredBy`
6. Fill `surfaces` on every `signal` and `expectation` to link them to risks/opportunities
7. Add a prose sentence above each block — blocks without context get H005 hints
8. Always close every block with `:::` — a missing fence silently drops the element (E003)

## Ongoing agent workflow

1. `biz42 validate` — check current state
2. `biz42 get --type objective` — see existing objectives
3. `biz42 get <id>` — inspect a specific element and its references
4. `biz42 explain <block-type>` — look up fields and tips
5. Edit `.biz42.md` files — add/update blocks and prose
6. `biz42 validate` — verify consistency
