# Business Model — Document Structure

A minimal, outside-in model of a business. Each section describes one model element with its ISO 9001:2015 mapping, a structural description, and its relationships to other elements.

**Out of scope:** Processes (ISO clause 4.4, 8.x detail — implementation detail beneath capabilities), awareness and communication practices (clause 7.3, 7.4), documented information management (clause 7.5), change planning (clause 6.3), design/development procedures (clause 8.3), external provider management (clause 8.4), nonconforming output handling (clause 8.7). These are operational concerns, not business model elements.

---

## 1. Scope

**ISO 9001 mapping:** Clause 4.3 — Determining the scope of the management system

**What it is:** What the business covers and what it explicitly does not. Products, markets, geographies, customer segments that are in, and those that are deliberately out. Without scope, every other element floats without boundaries.

**Structure:** A description of what is included, a description of what is excluded, and the rationale for each exclusion.

**Relates to:** Scope bounds everything that follows. _Signals_ and _Expectations_ are only relevant if they fall within scope. _Products & Services_, _Capabilities_, and _Objectives_ must stay within scope or the scope must be revised.

---

## 2. Signals

**ISO 9001 mapping:** Clause 4.1 — Understanding the organization and its context

**What it is:** An observable external or internal condition that may affect the business. Market shifts, technology trends, regulatory changes, competitive moves, macro-economic developments. Signals are impersonal — they exist whether or not anyone is watching.

**Structure:** Each signal has a name, a source (`external` or `internal`), and a description of the observed condition.

**Relates to:** Each signal may give rise to one or more _Risks_ or _Opportunities_.

---

## 3. Expectations

**ISO 9001 mapping:** Clause 4.2 — Understanding the needs and expectations of interested parties

**What it is:** A need, requirement, or demand from a party that has a stake in the business. Customers, regulators, employees, partners, shareholders. Expectations are personal — they come from identifiable actors who can respond if expectations are not met.

**Structure:** Each expectation has a named interested party, a description of what they expect, and an indication of whether the expectation is mandatory (regulatory, contractual) or desired.

**Relates to:** Each expectation may give rise to one or more _Risks_ or _Opportunities_.

---

## 4. Risks

**ISO 9001 mapping:** Clause 6.1 — Actions to address risks and opportunities

**What it is:** Something that could prevent the business from achieving its objectives, reduce customer satisfaction, or cause harm. A risk is always an interpretation of one or more _Signals_ or _Expectations_ — the same signal can be a risk for one business and irrelevant to another.

**Structure:** Each risk has a name, a description, a reference to the signal(s) or expectation(s) it arises from, and an assessment of its potential impact.

**Relates to:** Each risk should be addressed by at least one _Objective_. May affect one or more _Capabilities_ or _Products & Services_.

---

## 5. Opportunities

**ISO 9001 mapping:** Clause 6.1 — Actions to address risks and opportunities

**What it is:** Something the business could capitalize on to improve outcomes, gain advantage, or grow. Like a risk, an opportunity is an interpretation of one or more _Signals_ or _Expectations_.

**Structure:** Each opportunity has a name, a description, a reference to the signal(s) or expectation(s) it arises from, and an assessment of its potential value.

**Relates to:** Each opportunity should be addressed by at least one _Objective_. May require one or more _Capabilities_ and result in new or changed _Products & Services_.

---

## 6. Objectives

**ISO 9001 mapping:** Clause 6.2 — Quality objectives and planning to achieve them

**What it is:** A measurable, time-bound commitment the business makes in response to its risks and opportunities. ISO 9001 requires each objective to have an owner, a target, a timeframe, allocated resources, and a method of evaluation.

**Structure:** Each objective has a name, a measurable target, a deadline, an _Owner_, and a reference to the risk(s) or opportunity/opportunities it addresses.

**Relates to:** Each objective has at least one _Measure_. Achievement of objectives may require one or more _Capabilities_. Each objective is assigned to exactly one _Owner_.

---

## 7. Measures

**ISO 9001 mapping:** Clause 9.1 — Monitoring, measurement, analysis and evaluation

**What it is:** How the business knows whether an objective is being achieved. A measure defines what is monitored, how, when, and what constitutes success or failure.

**Structure:** Each measure has a name, the method of measurement, the frequency of evaluation, and success/failure criteria. Each measure references the _Objective_ it evaluates.

**Relates to:** Measures feed into _Evaluation_ (section 11). A measure without an objective is orphaned; an objective without a measure is unverifiable.

---

## 8. Owners

**ISO 9001 mapping:** Clause 5 — Leadership (5.1 commitment, 5.3 organizational roles, responsibilities and authorities)

**What it is:** A person or role accountable for achieving an objective, maintaining a capability, or delivering a product or service. Ownership means accountability for outcomes, authority to act, and responsibility to report.

**Structure:** Each owner has a name or role title, a description of their accountability, and references to the _Objectives_, _Capabilities_, or _Products & Services_ they are accountable for.

**Relates to:** Every _Objective_ must have an _Owner_. _Capabilities_ and _Products & Services_ should have an _Owner_. An owner without any assigned element has no purpose in the model.

---

## 9. Capabilities

**ISO 9001 mapping:** Clause 7 — Support (resources, competence, infrastructure, organizational knowledge)

**What it is:** Something the business can do — an ability it possesses or needs to acquire. Capabilities are abstract and shared: multiple products may draw on the same capability, and a single capability may serve multiple objectives.

**Structure:** Each capability has a name, a description, a status (existing, planned, or gap), an _Owner_, and a list of the _Products & Services_ it enables.

**Relates to:** Capabilities enable _Products & Services_. Objectives may require specific capabilities. A gap between required and existing capabilities is a strategic finding.

---

## 10. Products & Services

**ISO 9001 mapping:** Clause 8 — Operation (what is offered; not how it is produced)

**What it is:** What the business offers to its customers. The tangible output that meets _Expectations_, delivers on _Objectives_, and draws on _Capabilities_.

**Structure:** Each product or service has a name, a description, an _Owner_, and references to the _Expectations_ it fulfills.

**Relates to:** Products & Services fulfill _Expectations_. They draw on _Capabilities_. They are shaped by _Objectives_.

---

## 11. Evaluation

**ISO 9001 mapping:** Clause 9 — Performance evaluation

**What it is:** The practice of reviewing _Measures_ to determine whether _Objectives_ are being met, whether _Risks_ are under control, and whether _Opportunities_ are being realized.

**Structure:** Not a list of entities but a described practice: what is reviewed, how often, and by whom. References the _Measures_ it evaluates via the `evaluates` field.

**Relates to:** Evaluation findings feed into _Improvements_.

---

## 12. Improvements

**ISO 9001 mapping:** Clause 10 — Improvement (nonconformity, corrective action, continual improvement)

**What it is:** What the business changes when evaluation reveals a gap, a failure, or a better way. Includes corrective actions (fixing what went wrong) and continual improvement (making things better even when they're not broken).

**Structure:** Each improvement has a `type` (`corrective`, `preventive`, or `innovative`), a description, a reference to the _Evaluation_ that triggered it (`triggered-by`), and a target (`addresses`) pointing to the _Capability_, _Product/Service_, or _Objective_ being changed.

**Relates to:** Improvements may create new _Signals_ (internal), modify _Capabilities_, change _Products & Services_, or revise _Objectives_. This closes the loop back to the top of the model.

---

## Relationship Summary

```
Scope (bounds everything below)
  │
  ├─ Signals ──────────┐
  │                     ├──→ Risks ──────────┐
  ├─ Expectations ─────┘     Opportunities ──┼──→ Objectives ──→ Measures
                                             │      │    │            │
                                             │   Owner   │            │
                                             │           ▼            │
                                             │      Capabilities      │
                                             │        │  │            │
                                             │     Owner │            │
                                             │           ▼            │
                                             └──→ Products &          │
                                                  Services            │
                                                     │                │
                                                  Owner               │
                                                                      │
                                                Evaluation ◄──────────┘
                                                     │
                                                     ▼
                                                Improvements ──→ (back to top)
```

## ISO 9001:2015 Coverage

| Model Element     | ISO Clause | Covered |
| ----------------- | ---------- | ------- |
| Scope             | 4.3        | ✓       |
| Signals           | 4.1        | ✓       |
| Expectations      | 4.2        | ✓       |
| Risks             | 6.1        | ✓       |
| Opportunities     | 6.1        | ✓       |
| Objectives        | 6.2        | ✓       |
| Measures          | 9.1        | ✓       |
| Owners            | 5.1, 5.3   | ✓       |
| Capabilities      | 7.1–7.2    | ✓       |
| Products/Services | 8.1        | ✓       |
| Evaluation        | 9          | ✓       |
| Improvements      | 10         | ✓       |

| Excluded                      | ISO Clause | Reason                |
| ----------------------------- | ---------- | --------------------- |
| Processes                     | 4.4, 8.x   | Implementation detail |
| Quality policy                | 5.2        | Governance detail     |
| Awareness & communication     | 7.3, 7.4   | Operational practice  |
| Documented information        | 7.5        | Operational practice  |
| Change planning               | 6.3        | Meta-level concern    |
| Design/development procedures | 8.3        | Implementation detail |
| External provider management  | 8.4        | Implementation detail |
| Nonconforming output handling | 8.7        | Implementation detail |
