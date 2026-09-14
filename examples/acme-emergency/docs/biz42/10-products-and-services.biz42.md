# Products & Services

## Alert Service

The core product. An alerting service that enables employees to request help
and routes the alert to the nearest person who can assist — whether that's a
trained first aider, a safety officer, or the closest colleague.

Alerts can be triggered by people (via personal devices or physical alert
triggers at the workplace) and by machines (via the sensor bridge). The
service covers static sites and moving assets.

The service complements (does not replace) the existing enterprise notification
system. Local, fast, proximity-based alerts flow through ACME Emergency.
Organization-wide crisis communication flows through the existing system.

Fulfills: expectation "Employees — Fast Help When It Matters",
expectation "Safety Officers — Compliance and Audit Trail",
expectation "Management — Cost-Effective Alternative",
expectation "IT Operations — Fit Into Existing Infrastructure".
Requires: capability-alert-delivery, capability-location-routing,
capability-platform-integration, capability-asset-integration.
Owner: owner-product-lead (product direction), owner-tech-lead (technical).
Architecture: ../arc42/alert-service/01-introduction-and-goals.arc42.md

## Sensor Bridge

An extension that connects IoT sensors and building management systems to
the alert service, enabling machine-triggered alerts without human
intervention. A gas detector breach or a fall sensor activation triggers an
alert routed to the nearest person — even at 3 AM when nobody is watching.

Not a standalone product — requires the alert service as its delivery backend.

Fulfills: expectation "Sensor and Building Systems — Easy Integration",
expectation "Safety Officers — Compliance and Audit Trail".
Requires: capability-sensor-ingestion (gap), capability-alert-delivery.
Owner: owner-tech-lead.
Architecture: ../arc42/sensor-bridge/01-introduction-and-goals.arc42.md
