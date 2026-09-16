# Signals

## Political Pressure After Workplace Incidents

Several high-profile workplace incidents in the DACH transportation sector have
drawn media and political scrutiny. Political and public pressure is pushing large
employers toward demonstrable, systematic alerting capabilities.

```biz42
:::signal
id: signal-political-pressure
title: Political Pressure After Workplace Incidents
source: external
surfaces: risk-reputational, opp-internal-mandate
:::
```

## Existing Enterprise Notification Systems Are Overbuilt for Local Alerting

The organization currently uses an enterprise notification system designed for
crisis management. It works for organization-wide alerts but is too expensive
per seat, too slow to customize, and not designed for "someone nearby needs help
right now, who is closest?"

```biz42
:::signal
id: signal-enterprise-systems-overbuilt
title: Existing Enterprise Notification Systems Are Overbuilt for Local Alerting
source: internal
surfaces: opp-cost-effective-alerting, risk-incumbent-response
:::
```

## Employees Are Reachable on Personal Devices

Virtually all employees carry a personal device capable of receiving
notifications. This makes a device-based alerting channel feasible without
requiring dedicated hardware at every workstation.

```biz42
:::signal
id: signal-personal-devices
title: Employees Are Reachable on Personal Devices
source: internal
surfaces: opp-device-based-alerting, risk-adoption
:::
```

## Unreliable Network Coverage Across Operational Sites

The organization operates across railway tunnels, underground stations,
basements, and rural track sections where network connectivity is
intermittent or absent. Any system relying on continuous connectivity
will fail in exactly the environments where emergencies are most likely.

```biz42
:::signal
id: signal-connectivity-gaps
title: Unreliable Network Coverage Across Operational Sites
source: internal
surfaces: risk-connectivity
:::
```

## IoT Sensor Networks Expanding Across Sites

Industrial sites and buildings within the organization are increasingly equipped
with sensors. These sensors generate events but most lack a direct path to human alerting.

```biz42
:::signal
id: signal-iot-expanding
title: IoT Sensor Networks Expanding Across Sites
source: internal
surfaces: opp-sensor-bridge
:::
```

## Positioning Technology Is Mature Enough for Proximity Routing

Indoor positioning and asset tracking have reached a maturity level where it is
feasible to answer "who is near this incident?" at reasonable cost.

```biz42
:::signal
id: signal-positioning-mature
title: Positioning Technology Is Mature Enough for Proximity Routing
source: external
surfaces: opp-location-routing, opp-moving-asset-alerting
:::
```

## Works Council Sensitivity to Employee Tracking

Employee location tracking is a highly sensitive topic under German labor law.
Works councils have co-determination rights on any system that monitors employee
behavior or location.

```biz42
:::signal
id: signal-works-council-sensitivity
title: Works Council Sensitivity to Employee Tracking
source: internal
surfaces: risk-works-council
:::
```
