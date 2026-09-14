# biz42

In the age of coding agents, building features is easy. But every feature added carries a cost: increased complexity, more code to maintain, more tokens consumed every time an agent reads the codebase to enhance it. That cost only pays off if the feature contributes to a business goal. Yet business goals are rarely modeled explicitly — and they are not transparent to agents.

biz42 is a plain-text, outside-in model for describing a business. It makes the chain from business goal to product to feature explicit, traceable, and readable by both humans and machines.

## Why

Coding agents can implement features faster than organizations can decide which features matter. The bottleneck has shifted from *building* to *aligning*. Without explicit alignment, agents produce features that compile and pass tests but serve no business purpose — and every useless feature makes the next useful one harder to build.

The alignment chain looks like this:

```
biz42                        arc42                         Issue tracker
─────                        ─────                         ─────────────
Expectation ──┐
Opportunity ──┼─→ Product ──→ Requirement (1.1) ──→ Feature/Story
Objective ────┘                    ↑                       ↑
Measure                      Quality Goal (1.2)      Acceptance criteria
Capability                   Quality Scenario (10)
```

**biz42** aligns products with goals. **arc42** takes those products and defines high-level requirements that reference those goals. When implementing features, they reference arc42 chapter 1.1 requirements — establishing an unbroken chain of reasoning from business context to code.

This chain lets agents determine *not* to build a feature when the business justification is missing — or to flag that additional business alignment should be established before taking it on.

Today, business goals live in strategy decks, OKR spreadsheets, risk registers, and product roadmaps — separate documents with no shared structure and no cross-references. None of these are machine-readable. None of them connect to the codebase. When someone asks "which capability supports which objective, and which product depends on it?" — there's no single place to look.

biz42 fixes this by providing a minimal, coherent model that any organizational unit can fill out — grounded in a well-known standard, written in plain text, versioned in git.

## Foundation

biz42 is grounded in **ISO 9001:2015**, the most widely adopted management system standard in the world, with over a million certified organizations across every industry and geography. The vocabulary is deliberately chosen so that business readers recognize the concepts without needing a framework introduction.

Where ISO 9001 prescribes compliance requirements, biz42 extracts the **meta-model** — the entities and relationships — and presents them as a document structure.

| biz42 Element      | ISO 9001 Clause |
|--------------------|-----------------|
| Scope              | 4.3             |
| Signals            | 4.1             |
| Expectations       | 4.2             |
| Risks              | 6.1             |
| Opportunities      | 6.1             |
| Objectives         | 6.2             |
| Measures           | 9.1             |
| Owners             | 5.1, 5.3        |
| Capabilities       | 7.1–7.2         |
| Products & Services| 8.1             |
| Evaluation         | 9               |
| Improvements       | 10              |

Consciously excluded: processes (4.4, 8.x), quality policy (5.2), awareness & communication (7.3, 7.4), documented information management (7.5), change planning (6.3), design/development procedures (8.3), external provider management (8.4), nonconforming output handling (8.7). These are operational concerns, not business model elements.

## The Model

### Structure — Outside In

biz42 follows an outside-in sequence. You start with the world the business operates in and work inward to what it does.

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

### 1. Scope

What the business covers and what it explicitly does not. Products, markets, geographies, customer segments that are in — and those that are deliberately out. Without scope, every other element floats without boundaries.

Scope bounds everything that follows. Signals and expectations are only relevant if they fall within scope.

### 2. Signals

An observable external or internal condition that may affect the business. Market shifts, technology trends, regulatory changes, competitive moves, macro-economic developments. Signals are impersonal — they exist whether or not anyone is watching.

Each signal may give rise to one or more risks or opportunities.

### 3. Expectations

A need, requirement, or demand from a party that has a stake in the business. Customers, regulators, employees, partners, shareholders. Expectations are personal — they come from identifiable actors who can respond if expectations are not met.

Each expectation may give rise to one or more risks or opportunities.

### 4. Risks

Something that could prevent the business from achieving its objectives, reduce customer satisfaction, or cause harm. A risk is always an interpretation of one or more signals or expectations — the same signal can be a risk for one business and irrelevant to another.

Each risk should be addressed by at least one objective.

### 5. Opportunities

Something the business could capitalize on to improve outcomes, gain advantage, or grow. Like a risk, an opportunity is an interpretation of one or more signals or expectations.

Each opportunity should be addressed by at least one objective.

### 6. Objectives

A measurable, time-bound commitment the business makes in response to its risks and opportunities. Each objective has an owner, a target, a timeframe, allocated resources, and a method of evaluation.

Each objective has at least one measure and is assigned to exactly one owner.

### 7. Measures

How the business knows whether an objective is being achieved. A measure defines what is monitored, how, when, and what constitutes success or failure.

A measure without an objective is orphaned. An objective without a measure is unverifiable.

### 8. Owners

A person or role accountable for achieving an objective, maintaining a capability, or delivering a product or service. Ownership means accountability for outcomes, authority to act, and responsibility to report.

Every objective must have an owner. Capabilities and products & services should have one.

### 9. Capabilities

Something the business can do — an ability it possesses or needs to acquire. Capabilities are abstract and shared: multiple products may draw on the same capability, and a single capability may serve multiple objectives.

A gap between required and existing capabilities is a strategic finding.

### 10. Products & Services

What the business offers to its customers. The tangible output that meets expectations, delivers on objectives, and draws on capabilities.

### 11. Evaluation

The practice of reviewing measures to determine whether objectives are being met, whether risks are under control, and whether opportunities are being realized.

Evaluation findings feed into improvements.

### 12. Improvements

What the business changes when evaluation reveals a gap, a failure, or a better way. Improvements may create new signals, modify capabilities, change products & services, or revise objectives. This closes the loop back to the top of the model.

## Recursive Use Across Organizational Units

The model is recursive. Every organizational unit — department, division, team, product line — can fill out the same 12 sections with its own scope.

The connecting mechanism is **expectations**: one unit's product or service becomes another unit's expectation. The platform team's capability is the product team's expectation. An enterprise-level objective becomes an expectation on the division that needs to deliver it.

When two units reference the same capability, that's a shared dependency — and a candidate for a shared-services unit with its own scope.

## Connection to arc42

When a product in the biz42 model is a software product, its [arc42](https://arc42.org/) document is the next level of detail.

**Downward (biz42 → arc42):**

- biz42 **Scope** constrains arc42 Section 1 (Introduction and Goals)
- biz42 **Expectations** map to arc42 Section 1.2 (Quality Goals) and Section 10 (Quality Requirements)
- biz42 **Objectives** with **Measures** inform arc42 quality scenarios
- biz42 **Capabilities** inform arc42 Section 3 (Context and Scope)
- biz42 **Risks** feed arc42 Section 11 (Risks and Technical Debt)

**Upward (arc42 → biz42):**

- arc42 Section 11 (Risks) can surface new **Signals** in the business model
- arc42 quality assessments feed back into **Measures** and **Evaluation**
- Architecture decisions (arc42 Section 9) that limit future options may create new **Risks**

The traceability chain: Expectation → Product → arc42 quality goal → quality scenario → architecture decision → building block.

## Why Not req42 in Between?

[req42](https://req42.de/) is the Product Owner's framework — 12 artifacts for managing a product's backlog, vision, stakeholders, quality requirements, roadmaps, and risks. It sits naturally between business strategy and architecture, and the overlap with both biz42 and arc42 is real.

biz42 connects directly to arc42 without requiring req42 as a formal layer. The reasoning:

- biz42 provides the *upward* rationale: why does this product exist, which objectives and expectations justify it.
- arc42 provides the *downward* structure: quality goals, requirements, building blocks, decisions.
- The backlog (epics, features, stories) already lives in an issue tracker. It doesn't need a second home in a framework.

The one thing req42 adds is *structured prioritization rationale* — forcing every backlog item to connect to a vision, stakeholder, and quality requirement. Without it, that link depends on discipline: does every issue reference an arc42 chapter 1.1 requirement? That's a convention an agent can check without a full framework in between.

If the gap between biz42 and arc42 proves too wide in practice — because the product owner's prioritization logic is getting lost — req42 can be introduced later. But starting with three frameworks before shipping anything would be over-engineering the governance.

## Status

This project is in its early stages. The meta-model is defined; tooling (validation, templates, examples) is planned.

## Related

- [arc42](https://arc42.org/) — template for software architecture documentation
- [arc42-language](https://github.com/docToolchain/arc42-language) — plain-text DSL and CLI for arc42 consistency checking
- [req42](https://req42.de/) — Product Owner framework for agile requirements management
- [ISO 9001:2015](https://www.iso.org/standard/62085.html) — the quality management standard this model is grounded in

## License

MIT
