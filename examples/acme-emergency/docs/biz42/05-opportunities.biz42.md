# Opportunities

## Internal Mandate From Safety Compliance

Workplace safety regulations (ArbSchG, DGUV Vorschrift 1) require employers
to ensure first aid capability. A systematic, auditable alerting system makes
compliance demonstrable rather than aspirational. Combined with political
pressure after recent incidents, this creates an internal mandate — the
organization needs to act, and budget exists.

Arises from: signal "Political Pressure After Workplace Incidents",
expectation "Safety Officers — Compliance and Audit Trail".
Potential value: high (internal mandate eliminates the "why should we do this" debate).
Addressed by: objective obj-time-to-deployment.
Requires: capability-alert-delivery.
Results in: product-alert-service.

## Cost-Effective Alternative to Enterprise Systems

The existing enterprise notification system costs significantly more per seat
than the use case warrants, and customization is slow. A purpose-built,
lightweight service for local alerting can cover the same use case at a
fraction of the cost — making company-wide rollout financially feasible where
the enterprise system would require painful budget negotiations per site.

Arises from: signal "Existing Enterprise Notification Systems Are Overbuilt
for Local Alerting", expectation "Management — Cost-Effective Alternative".
Potential value: high (unlocks company-wide rollout vs. per-site budgeting).
Addressed by: objective obj-time-to-deployment.
Requires: capability-alert-delivery, capability-platform-integration.
Results in: product-alert-service.

## Location-Based Alert Routing

No existing solution in the organization can answer "who is the nearest
person who can help?" Existing systems broadcast to lists. Proximity-based
routing fundamentally changes response time — instead of alerting 200 people
and hoping one is nearby, alert the 3 people who are actually on the same
floor.

Arises from: signal "Positioning Technology Is Mature Enough for Proximity
Routing", signal "Employees Are Reachable on Personal Devices".
Potential value: high (core differentiator, directly reduces response time).
Addressed by: objective obj-location-routing.
Requires: capability-location-routing (gap).
Results in: product-alert-service (core feature).

## Moving-Asset Alerting

Alerting on rolling stock and vehicles is a problem nobody else is solving
in this space. The ability to alert "the nearest first aider on this train"
doesn't exist today. This extends the service to environments that are
currently completely unserved.

Arises from: signal "Positioning Technology Is Mature Enough for Proximity
Routing".
Potential value: high (unique capability, extends addressable scope
significantly).
Addressed by: objective obj-moving-assets.
Requires: capability-location-routing (gap), capability-asset-integration.
Results in: product-alert-service (moving-asset extension).

## Sensor-Triggered Alerting

IoT sensors across the organization generate events that could trigger alerts
automatically — a gas leak at 3 AM, a fall sensor activated in an empty
workshop. Bridging the gap from sensor event to human alert eliminates
the dependency on someone being present and watching.

Arises from: signal "IoT Sensor Networks Expanding Across Sites",
expectation "Sensor and Building Systems — Easy Integration".
Potential value: medium (extends coverage to unmanned/off-hours scenarios).
Addressed by: objective obj-sensor-bridge.
Requires: capability-sensor-ingestion (gap).
Results in: product-sensor-bridge.

## Potential Spin-Out as External Product

If the internal solution proves itself, the same product has a market beyond
this organization: other transportation operators, industrial campuses,
hospital networks, large event venues. This is not a current objective but a
strategic option worth preserving in architecture decisions.

Arises from: (strategic — internal success creates external opportunity).
Potential value: high (long-term, if internal deployment succeeds).
Addressed by: (no current objective — consciously deferred).
Requires: product architecture that isn't hard-wired to a single organization.
