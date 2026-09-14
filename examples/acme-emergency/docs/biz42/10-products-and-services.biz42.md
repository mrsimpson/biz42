# Products and Services

## Alert Service

The core product. An alerting service that enables employees to request help
and routes the alert to the nearest person who can assist. Covers static sites
and moving assets. Complements (does not replace) the existing enterprise
notification system.

```biz42
:::product
id: product-alert-service
title: Alert Service
enables: capability-alert-delivery, capability-location-routing, capability-platform-integration, capability-asset-integration
:::
```

## Sensor Bridge

An extension that connects IoT sensors and building management systems to
the alert service, enabling machine-triggered alerts without human intervention.
Requires the alert service as its delivery backend.

```biz42
:::product
id: product-sensor-bridge
title: Sensor Bridge
enables: capability-sensor-ingestion, capability-alert-delivery
:::
```
