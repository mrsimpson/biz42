# Capabilities

## Alert Delivery

The ability to deliver alerts from any source (human or machine) to nearby
recipients within seconds, across multiple channels. Must remain functional
under peak load and in environments with degraded or no network connectivity.

Connectivity in challenging environments (tunnels, basements, shielded areas)
is the highest-risk technical unknown.

Status: planned.
Owner: owner-tech-lead.
Supports: obj-time-to-deployment, obj-offline-resilience.
Enables: product-alert-service.

## Location Routing

The ability to determine which people are nearest to an alert source and
route the alert to them rather than broadcasting to a list. Covers both
static locations (buildings, floors, zones) and moving assets (vehicles,
rolling stock).

The critical constraint is privacy: location must be processed only during
active alert situations, never stored for tracking purposes. The privacy
model must be auditable enough to convince the works council.

Status: gap.
Owner: owner-tech-lead.
Supports: obj-location-routing, obj-privacy-architecture, obj-moving-assets.
Enables: product-alert-service.

## Asset Integration

The ability to resolve "which people are on this moving asset right now?"
by combining voluntary check-in with the organization's existing asset
tracking systems.

Status: gap — depends on access to existing asset tracking data, which
varies by asset type and operating division.
Owner: owner-tech-lead.
Supports: obj-moving-assets.
Enables: product-alert-service (moving-asset extension).

## Sensor Ingestion

The ability to receive events from heterogeneous IoT sensor and building
management systems and convert them into alert triggers — without a human
in the loop. Must accommodate the variety of sensor types across the
organization without requiring changes on the sensor side.

Status: gap.
Owner: owner-tech-lead.
Supports: obj-sensor-bridge.
Enables: product-sensor-bridge.

## Platform Integration

The ability to work within the organization's existing IT landscape:
identity management, device management, corporate network, and the existing
enterprise notification system (for escalation handoff).

Status: existing (partially) — integration patterns are known from other
internal projects. Escalation handoff to the enterprise notification system
needs to be defined.
Owner: owner-project-lead.
Supports: obj-time-to-deployment, obj-adoption-rate.
Enables: product-alert-service.
