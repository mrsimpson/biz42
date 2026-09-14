# Products & Services

<!--
biz42 chapter 10. Documents what the business offers to its customers — the tangible
outputs that meet expectations, deliver on objectives, and draw on capabilities.

ISO 9001:2015 mapping: Clause 8 — Operation (what is offered; not how it is produced).

A product or service is what the customer sees, buys, and uses. Internal tooling is
not a product unless another organizational unit consumes it as a service (in which
case it appears as an expectation in their biz42 model and as a product in yours).

For each product or service, write a ## section describing what it is, who it serves,
and what makes it valuable.

Each product or service should reference:
- The expectation(s) it fulfills (chapter 3)
- The capability/capabilities it requires (chapter 9)
- The owner who delivers it (chapter 8)

A product that references a capability marked as "gap" has an unmet dependency.
A product that fulfills no expectation may be a candidate for retirement.
An expectation that no product fulfills is an unmet need.

When a product is a software product, its arc42 architecture documentation
(see https://arc42.org) is the next level of detail. The connection points are:
- biz42 expectations → arc42 quality goals and quality requirements
- biz42 objectives with measures → arc42 quality scenarios
- biz42 capabilities → arc42 system context (what the system provides vs. consumes)
- biz42 risks → arc42 risks and technical debt

Example:

## Workflow Platform

The core SaaS product. A browser-based platform for designing, executing, and
monitoring business workflows. Serves mid-market companies in the EU and UK.

Fulfills: expectation "Mid-Market Customers — Time to Value", expectation
  "GDPR — Data Processing Obligations".
Requires: capability-ml-decisioning, capability-data-processing,
  capability-product-led-growth (planned).
Owner: owner-head-of-platform.
Architecture: ./platform/01-introduction-and-goals.arc42.md

## Professional Services

Hands-on onboarding, workflow design consulting, and integration support for
customers who need guided implementation. Currently required for all mid-market
deals; objective obj-unit-economics aims to make this optional.

Fulfills: expectation "Mid-Market Customers — Time to Value".
Requires: capability-product-led-growth (gap — without it, professional services
  remains mandatory rather than optional).
Owner: owner-vp-growth.
-->
