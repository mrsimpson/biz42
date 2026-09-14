# Risks

<!--
biz42 chapter 4. Documents things that could prevent the business from achieving its
objectives, reduce customer satisfaction, or cause harm. A risk is always an
interpretation of one or more signals or expectations — the same signal can be a
risk for one business and irrelevant to another.

ISO 9001:2015 mapping: Clause 6.1 — Actions to address risks and opportunities.

For each risk, write a ## section with a prose paragraph describing the risk, its
cause (which signals or expectations it arises from), its potential impact, and the
current status (open, mitigated, accepted).

Each risk should reference:
- The signal(s) or expectation(s) it arises from (chapters 2 and 3)
- The objective(s) that address it (chapter 6)
- The capabilities or products it may affect (chapters 9 and 10)

A risk without a link to at least one objective or a conscious "accepted" status
is unmanaged. An unmanaged risk is a finding.

Order risks by severity — highest impact first.

Example:

## AI Act Compliance Gap

Our ML-based decision support features likely qualify as high-risk AI under the
EU AI Act. We currently lack conformity assessment documentation, human oversight
mechanisms, and the required transparency disclosures. Non-compliance after
August 2026 could result in fines up to 3% of global turnover.

Arises from: signal "EU AI Act Enforcement Timeline", expectation "GDPR — Data
Processing Obligations".
Impact: high (regulatory, financial).
Status: open.
Addressed by: objective obj-ai-act-readiness.
Affects: capability-ml-decisioning, product-platform.

## Key-Person Dependency on Data Pipeline

A single engineer maintains the entire data pipeline. No documentation, no
knowledge transfer, no backup. If this person leaves, pipeline incident
resolution time increases from hours to weeks.

Arises from: signal "Rising Customer Acquisition Cost" (indirectly — pipeline
feeds attribution models), expectation "Engineering Team — Sustainable Pace".
Impact: high (operational).
Status: open.
Addressed by: objective obj-pipeline-resilience.
Affects: capability-data-processing.
-->
