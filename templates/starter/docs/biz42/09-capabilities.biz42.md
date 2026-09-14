# Capabilities

<!--
biz42 chapter 9. Documents what the business can do — abilities it possesses or
needs to acquire. Capabilities are abstract and shared: multiple products may draw
on the same capability, and a single capability may serve multiple objectives.

ISO 9001:2015 mapping: Clause 7 — Support (7.1 resources, 7.2 competence).

A capability is NOT a team, a tool, or a process. "We have a Kubernetes cluster"
is infrastructure. "We can deploy and scale services independently" is a capability.
The distinction matters because capabilities survive reorganizations and technology
changes — they describe what the business can do, not how it currently does it.

For each capability, write a ## section describing the ability, its current status,
and why it matters. Status is one of:
- existing — we have it and it meets current needs
- planned — we've committed to building it (link to an objective)
- gap — we need it but haven't committed yet (this is a strategic finding)

Each capability should reference:
- The objective(s) it supports (chapter 6)
- The product(s) and service(s) it enables (chapter 10)
- The owner who maintains it (chapter 8)

A capability referenced by a product but marked as "gap" means that product has
an unmet dependency — this is a critical finding.

Example:

## ML-Based Decisioning

The ability to build, train, deploy, and monitor machine learning models that
support automated decision-making in customer workflows. Includes model
versioning, A/B testing, and explainability.

Status: existing (partial — models are deployed but explainability and conformity
  assessment tooling are missing).
Owner: owner-cto.
Supports: obj-ai-act-readiness.
Enables: product-platform (ML features).

## Product-Led Growth

The ability to acquire, onboard, and expand customers through the product itself
rather than through sales and professional services. Includes self-serve signup,
in-product onboarding flows, usage-based expansion triggers, and viral loops.

Status: gap — we have none of these today; all onboarding is services-led.
Owner: owner-vp-growth.
Supports: obj-unit-economics.
Enables: product-platform (onboarding experience).

## Data Processing

The ability to ingest, transform, and deliver data across the product suite
reliably and at scale. Includes ETL pipelines, data quality monitoring, and
event streaming.

Status: existing (fragile — single-person dependency, see risk-pipeline-dependency).
Owner: owner-cto.
Supports: obj-pipeline-resilience.
Enables: product-platform (reporting, analytics, ML features).
-->
