# Expectations

<!--
biz42 chapter 3. Documents the needs, requirements, and demands of parties that
have a stake in the business. Unlike signals, expectations are personal — they come
from identifiable actors who can respond if expectations are not met.

ISO 9001:2015 mapping: Clause 4.2 — Understanding the needs and expectations of
interested parties.

An interested party is anyone who affects or is affected by the organization's
activities: customers, regulators, employees, partners, shareholders, internal
teams that consume your products or capabilities.

For each expectation, write a ## section identifying the interested party, what
they expect, and whether the expectation is mandatory (regulatory, contractual)
or desired. Mandatory expectations are non-negotiable — failing to meet them
has legal or contractual consequences. Desired expectations are important but
can be prioritized against other demands.

When this model describes a sub-unit, expectations from other internal units
are first-class entries here. The platform team's SLA is an expectation on the
product team, just like a customer's uptime requirement.

Each expectation should reference the risks and/or opportunities it gives rise to
(see 04-risks.biz42.md and 05-opportunities.biz42.md), and the products & services
that fulfill it (see 10-products-and-services.biz42.md).

Example:

## Mid-Market Customers — Time to Value

Mid-market buyers (200–2000 employees) expect to see measurable workflow
improvements within 30 days of contract signing. Onboarding that takes longer
than 30 days correlates with 3x higher churn in the first year.

Interested party: customers (mid-market segment).
Type: desired.
Gives rise to: risk-slow-onboarding, opportunity-self-serve-onboarding.
Fulfilled by: product-platform, product-professional-services.

## GDPR — Data Processing Obligations

As a data processor for EU customers, we must maintain processing records,
support data subject access requests within 30 days, and report breaches
within 72 hours.

Interested party: EU regulators.
Type: mandatory (regulatory).
Gives rise to: risk-gdpr-breach.
Fulfilled by: capability-data-privacy.

## Engineering Team — Sustainable Pace

Engineering expects predictable sprint commitments, manageable on-call rotation,
and no more than 20% of capacity allocated to unplanned work. Current unplanned
work ratio is 35%.

Interested party: employees (engineering).
Type: desired.
Gives rise to: risk-attrition, opportunity-devex-investment.
-->
