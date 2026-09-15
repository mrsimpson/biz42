# biz42 — Introduction

## The problem

Coding agents can implement features faster than organizations can decide which features matter. The bottleneck has shifted from _building_ to _aligning_. Without explicit alignment, agents produce features that compile and pass tests but serve no business purpose — and every useless feature makes the next useful one harder to build.

Business goals today live in strategy decks, OKR spreadsheets, risk registers, and product roadmaps — separate documents with no shared structure and no cross-references. None of them are machine-readable. None of them connect to the codebase. When someone asks "which capability supports which objective, and which product depends on it?" — there's no single place to look.

## The model

biz42 is a 12-section plain-text model that any organizational unit can fill out. It follows an outside-in sequence: you start with the world the business operates in and work inward to what it does.

```
Scope (bounds everything below)
  │
  ├─ Signals ──────────┐
  │                     ├──→ Risks ──────────┐
  ├─ Expectations ─────┘     Opportunities ──┼──→ Objectives ──→ Measures
                                             │        │
                                             │     Owners
                                             │        │
                                             │   Capabilities
                                             │        │
                                             └──→ Products &
                                                  Services

                                               Evaluation
                                                    │
                                               Improvements ──→ (back to top)
```

Each section maps to ISO 9001:2015 — the most widely adopted management system standard in the world. The vocabulary is familiar to business readers without a framework introduction.

| biz42 Element       | ISO 9001 Clause |
| ------------------- | --------------- |
| Scope               | 4.3             |
| Signals             | 4.1             |
| Expectations        | 4.2             |
| Risks               | 6.1             |
| Opportunities       | 6.1             |
| Objectives          | 6.2             |
| Measures            | 9.1             |
| Owners              | 5.1, 5.3        |
| Capabilities        | 7.1–7.2         |
| Products & Services | 8.1             |
| Evaluation          | 9               |
| Improvements        | 10              |

## How it works

Each model element is a `:::block` fence in a Markdown file — human-readable prose first, structured metadata as its machine-readable summary. The blocks reference each other by id.

```markdown
A risk surfaced by the shift toward AI-assisted development.

:::risk
id: risk-feature-misalignment
title: Features built without business justification
surfaces-from: sig-ai-adoption
addressed-by: obj-alignment-chain
:::
```

The colored badge next to a paragraph in the viewer can be swapped for a compact, machine-readable version. Those elements are linked to each other and validated by the CLI.

## Consistency rules

The CLI enforces a set of rules that keep the business model internally consistent. Run `biz42 rules` to see the full list. Key examples:

- A **signal** or **expectation** that surfaces no risk or opportunity has not been analysed
- A **risk** or **opportunity** not addressed by any objective is a planning gap
- An **objective** without a measure cannot be evaluated (ISO 9001 §6.2)
- An **objective** without an owner has no accountability (ISO 9001 §5.3)
- A **product** that fulfills no expectation has no modelled rationale for its existence
- An **improvement** with no addressed target has no modelled goal

This is the same principle as linting code. It is possible to be in an inconsistent state, but it is probably not desired — and the agent can detect and correct it.

## Changes as merge requests

Because the business model lives in plain text and git, every change to the business structure becomes a pull request. The diff is the decision record: understandable to humans and agents alike.

Want to introduce a new product? You need an expectation it fulfills, a capability it requires, an objective it contributes to. The validator tells you what's missing. The PR shows what changed and why.

## Connection to arc42

When a product in the biz42 model is a software product, its [arc42](https://arc42.org/) document is the next level of detail.

**biz42 → arc42:**

- biz42 **Scope** constrains arc42 Section 1 (Introduction and Goals)
- biz42 **Expectations** map to arc42 quality goals and quality scenarios
- biz42 **Capabilities** inform arc42 Section 3 (Context and Scope)
- biz42 **Risks** feed arc42 Section 11 (Risks and Technical Debt)

**arc42 → biz42:**

- arc42 Section 11 risks can surface new **Signals** in the business model
- Architecture decisions that limit future options may create new **Risks**

The traceability chain: Expectation → Product → arc42 quality goal → quality scenario → architecture decision → building block.

The alignment chain for agents:

```
biz42                        arc42                         Issue tracker
─────                        ─────                         ─────────────
Expectation ──┐
Opportunity ──┼─→ Product ──→ Requirement (1.1) ──→ Feature/Story
Objective ────┘                    ↑                       ↑
Measure                      Quality Goal (1.2)      Acceptance criteria
Capability                   Quality Scenario (10)
```

This chain lets agents determine _not_ to build a feature when the business justification is missing — or to flag that additional business alignment is needed before taking it on.

## Recursive use

The model is recursive. Every organizational unit — department, division, team, product line — can fill out the same 12 sections with its own scope. One unit's product becomes another unit's expectation. Shared capabilities surface shared dependencies.

## Status

Early stage. The meta-model is defined; tooling (validation, templates, examples) is active development. The model is not yet usable with an agent out of the box — that's next.
