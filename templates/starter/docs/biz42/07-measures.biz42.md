# Measures

<!--
biz42 chapter 7. Documents how the business knows whether its objectives are being
achieved. Each measure defines what is monitored, how, how often, and what
constitutes success or failure.

ISO 9001:2015 mapping: Clause 9.1 — Monitoring, measurement, analysis and evaluation.

A measure is not a KPI dashboard — it is a defined evaluation method tied to a
specific objective. Dashboards may display measures, but the measure itself is the
definition of what to look at and what it means.

For each measure, write a ## section describing what is measured and why it matters,
then state the method, frequency, and success/failure criteria clearly.

Each measure should reference:
- The objective it evaluates (chapter 6)

A measure without an objective is orphaned — it monitors something nobody committed to.
An objective without a measure (chapter 6) is unverifiable — the business cannot
tell whether it succeeded.

Example:

## AI Act Coverage

Tracks the percentage of ML-based features that have completed conformity
assessment and documentation. This is the primary indicator for objective
obj-ai-act-readiness.

Method: count of conformity-assessed features / total qualifying features.
Frequency: monthly review, reported at leadership sync.
Success: 100% by June 2026.
Failure: below 50% by March 2026 triggers escalation.
Evaluates: objective obj-ai-act-readiness.

## Customer Acquisition Cost

Blended CAC across all channels, calculated as total sales and marketing spend
divided by new customers acquired in the period.

Method: finance report, validated against CRM closed-won count.
Frequency: monthly.
Success: CAC ≤ 75% of current baseline by Q4 2026.
Failure: CAC flat or increasing for two consecutive months triggers review.
Evaluates: objective obj-unit-economics.

## Net Revenue Retention

Measures expansion, contraction, and churn within the existing customer base.
A guardrail to ensure CAC reduction efforts don't sacrifice retention.

Method: (starting MRR + expansion − contraction − churn) / starting MRR.
Frequency: monthly, trailing 12-month calculation.
Success: NRR ≥ 110%.
Failure: NRR below 100% for any single month triggers immediate review.
Evaluates: objective obj-unit-economics.
-->
