# Objectives

## Privacy Architecture Approved by Works Council

Design a privacy model for location-based alerting that satisfies the works
council's requirements: no continuous tracking, location processed only during
active alert situations, transparent data lifecycle, genuinely voluntary
participation. Obtain formal works council approval before any deployment.

Target: works council approval (formal Betriebsvereinbarung signed).
Deadline: month 3 (blocks everything else).
Owner: owner-product-lead.
Resources: privacy architect, legal counsel, works council liaison.
Addresses: risk-works-council.
Measured by: measure-works-council-approval.
Requires: capability-location-routing.

## Time to Deployment

Deploy the alert service company-wide across all static sites (offices,
stations, workshops, depots) within 12 months. This is a constraint, not an
aspiration — the political and competitive window is finite.

Target: service live on ≥90% of static sites.
Deadline: 12 months from project start.
Owner: owner-project-lead.
Resources: development team, site rollout coordination, IT operations support.
Addresses: risk-rollout-timeline, risk-incumbent-response, risk-reputational,
opportunity-internal-mandate, opportunity-cost-effective-alerting.
Measured by: measure-site-coverage.
Requires: capability-alert-delivery, capability-platform-integration.

## Adoption Rate

Achieve ≥60% voluntary participation among employees at deployed sites
within 3 months of each site going live. Without adoption, the system can't
route alerts by proximity because it doesn't know where people are.

Target: ≥60% active participation per site within 3 months of site launch.
Deadline: rolling, per site.
Owner: owner-product-lead.
Resources: internal communications, onboarding support.
Addresses: risk-adoption.
Measured by: measure-adoption-rate.

## Location-Based Routing

Deliver alerts to the nearest available person rather than broadcasting to
a list. The first responder notified should be in the immediate vicinity of
the alerter in the vast majority of cases.

Target: ≥80% of alerts route to a responder in the same building zone as
the alerter.
Deadline: available at launch (core feature).
Owner: owner-tech-lead.
Addresses: opportunity-location-routing.
Measured by: measure-routing-accuracy.
Requires: capability-location-routing.

## Moving-Asset Alerting

Extend alerting to rolling stock and vehicles. An employee on a moving asset
can trigger an alert, and the system routes it to the nearest person on the
same asset.

Target: alerting functional on ≥3 moving-asset types.
Deadline: month 9 (after static sites are stable).
Owner: owner-tech-lead.
Addresses: opportunity-moving-asset-alerting.
Measured by: measure-moving-asset-coverage.
Requires: capability-location-routing, capability-asset-integration.

## Offline Resilience

The system must remain functional in environments without reliable network
connectivity. Alerts must still reach nearby people in tunnels, basements,
and shielded areas — the places where emergencies are most dangerous.

Target: alert delivery functional in offline/degraded network conditions.
Deadline: month 6 (covers highest-risk environments early).
Owner: owner-tech-lead.
Addresses: risk-connectivity.
Measured by: measure-offline-delivery.
Requires: capability-alert-delivery.

## Sensor Bridge

Enable IoT sensors and building management systems to trigger alerts
automatically. Priority: the sensor types with the highest life-safety
impact (gas detection, fire detection).

Target: ≥2 sensor types triggering alerts in production.
Deadline: month 10.
Owner: owner-tech-lead.
Addresses: opportunity-sensor-bridge.
Measured by: measure-sensor-integrations.
Requires: capability-sensor-ingestion (gap).
