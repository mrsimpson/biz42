# Measures

## Works Council Approval

Binary: the Betriebsvereinbarung for location-based alerting is signed or it is not.
Everything else is blocked until this is done.

Method: signed document exists — yes/no.
Success: signed by month 3.

```biz42
:::measure
id: measure-works-council-approval
title: Works Council Approval (Betriebsvereinbarung Signed)
target: Signed by month 3
:::
```

## Site Coverage

Percentage of static sites where the alert service is live and operational.

Method: count of live sites / total sites in scope.
Success: ≥90% of sites live within 12 months.

```biz42
:::measure
id: measure-site-coverage
title: Site Coverage — Percentage of Sites Deployed
target: ≥90% of sites live within 12 months
:::
```

## Adoption Rate

Percentage of employees at a deployed site who have installed and activated the
alerting app, measured 3 months after site go-live.

Method: active participants / total employees at site.
Success: ≥60% within 3 months of site launch.

```biz42
:::measure
id: measure-adoption-rate
title: Adoption Rate — Active Participants Per Site
target: ≥60% within 3 months of site launch
:::
```

## Routing Accuracy

Percentage of alerts where the first notified responder is in the same
building zone as the person who triggered the alert.

Method: alert log analysis — alerter zone vs. first responder zone.
Success: ≥80% same-zone accuracy.

```biz42
:::measure
id: measure-routing-accuracy
title: Routing Accuracy — First Responder Same Zone as Alerter
target: ≥80% same-zone accuracy
:::
```

## Moving-Asset Coverage

Number of moving-asset types where alerting is functional and tested.

Method: count of asset types with end-to-end tested alert delivery.
Success: ≥3 asset types by month 9.

```biz42
:::measure
id: measure-moving-asset-coverage
title: Moving-Asset Coverage — Asset Types With Live Alerting
target: ≥3 asset types by month 9
:::
```

## Offline Delivery

Verified ability to deliver alerts between nearby devices when network
connectivity is unavailable.

Method: controlled test in representative offline environments.
Success: alert delivered within 30 seconds in offline conditions.

```biz42
:::measure
id: measure-offline-delivery
title: Offline Alert Delivery — Confirmed in Connectivity-Challenged Environments
target: Alert delivered within 30 seconds in offline conditions
:::
```

## Sensor Integrations

Number of sensor types with working, production-deployed integrations to
the alerting service.

Method: count of sensor types passing end-to-end test in production.
Success: ≥2 sensor types integrated by month 10.

```biz42
:::measure
id: measure-sensor-integrations
title: Sensor Integrations — Production-Deployed Sensor Types
target: ≥2 sensor types integrated by month 10
:::
```
