# Measures

## Works Council Approval

Binary: the Betriebsvereinbarung (works agreement) for location-based alerting
is signed or it is not. Everything else is blocked until this is done.

Method: signed document exists — yes/no.
Frequency: weekly status check during negotiation phase.
Success: signed by month 3.
Failure: not signed by month 4 triggers project re-scoping (fall back to
non-location-based alerting as interim solution).
Evaluates: objective obj-privacy-architecture.

## Site Coverage

Percentage of static sites (offices, stations, workshops, depots) where the
alert service is live and operational.

Method: count of live sites / total sites in scope.
Frequency: monthly.
Success: ≥90% of sites live within 12 months.
Failure: <50% at month 9 triggers rollout acceleration or scope reduction.
Evaluates: objective obj-time-to-deployment.

## Adoption Rate

Percentage of employees at a deployed site who have installed and activated
the alerting app, measured 3 months after site go-live.

Method: active participants / total employees at site.
Frequency: monthly per site, aggregated quarterly.
Success: ≥60% within 3 months of site launch.
Failure: <30% at any site 2 months after launch triggers investigation
(UX problems? trust issues? communication gaps?).
Evaluates: objective obj-adoption-rate.

## Routing Accuracy

Percentage of alerts where the first notified responder is in the same
building zone (floor, wing, platform) as the person who triggered the alert.

Method: alert log analysis — alerter zone vs. first responder zone.
Frequency: per-alert, aggregated monthly.
Success: ≥80% same-zone accuracy.
Failure: <60% triggers positioning system review.
Evaluates: objective obj-location-routing.

## Moving-Asset Coverage

Number of moving-asset types where alerting is functional and tested
(e.g. long-distance trains, regional trains, maintenance vehicles).

Method: count of asset types with end-to-end tested alert delivery.
Frequency: monthly.
Success: ≥3 asset types by month 9.
Failure: <1 asset type by month 7 triggers scope review.
Evaluates: objective obj-moving-assets.

## Offline Delivery

Verified ability to deliver alerts between nearby devices when network
connectivity is unavailable. Tested in representative offline environments
(tunnel, basement, shielded industrial area).

Method: controlled test — alert triggered in offline environment, delivery
confirmed on recipient device.
Frequency: quarterly, plus after architecture changes.
Success: alert delivered within 30 seconds in offline conditions.
Failure: alert not delivered in any tested offline scenario triggers
architecture review.
Evaluates: objective obj-offline-resilience.

## Sensor Integrations

Number of sensor types with working, production-deployed integrations to
the alerting service.

Method: count of sensor types passing end-to-end test in production.
Frequency: monthly.
Success: ≥2 sensor types integrated by month 10.
Failure: zero integrations by month 8 triggers partner engagement review.
Evaluates: objective obj-sensor-bridge.
