# Capabilities

## Alert Delivery

The ability to deliver alerts from any source (human or machine) to nearby
recipients within seconds, across multiple channels. Must remain functional
under peak load and in environments with degraded or no network connectivity.

Connectivity in challenging environments (tunnels, basements, shielded areas)
is the highest-risk technical unknown.

```biz42
:::capability
id: capability-alert-delivery
title: Alert Delivery
status: planned
:::
```

## Location Routing

The ability to determine which people are nearest to an alert source and
route the alert to them. The critical constraint is privacy: location must
be processed only during active alert situations, never stored for tracking.

```biz42
:::capability
id: capability-location-routing
title: Location Routing
status: gap
:::
```

## Asset Integration

The ability to resolve "which people are on this moving asset right now?" by
combining voluntary check-in with existing asset tracking systems.

```biz42
:::capability
id: capability-asset-integration
title: Asset Integration
status: gap
:::
```

## Sensor Ingestion

The ability to receive events from heterogeneous IoT sensor and building
management systems and convert them into alert triggers — without a human
in the loop.

```biz42
:::capability
id: capability-sensor-ingestion
title: Sensor Ingestion
status: gap
:::
```

## Platform Integration

The ability to work within the organization's existing IT landscape: identity
management, device management, corporate network, and the existing enterprise
notification system.

```biz42
:::capability
id: capability-platform-integration
title: Platform Integration
status: exists
:::
```
