# Cashflow

## Subscription Fee

The primary revenue stream. Organisations pay a recurring annual subscription per
site to access the alert service platform.

```biz42
:::cashflow
id: cashflow-subscription-fee
title: Subscription Fee
type: revenue
category: subscription
linked-to: product-alert-service
recurrence: recurring
:::
```

## Sensor Bridge Add-On

An optional recurring fee for organisations that activate the sensor bridge extension
to connect IoT infrastructure.

```biz42
:::cashflow
id: cashflow-sensor-bridge-addon
title: Sensor Bridge Add-On
type: revenue
category: subscription
linked-to: product-sensor-bridge
recurrence: recurring
:::
```

## Professional Services

One-time onboarding and integration fees charged at deployment. Covers site
configuration, API integration with existing enterprise systems, and staff training.

```biz42
:::cashflow
id: cashflow-professional-services
title: Professional Services
type: revenue
category: services
linked-to: product-alert-service
recurrence: one-time
:::
```

## Cloud Infrastructure

Costs for running the alert routing, location services, and sensor bridge backend
on cloud infrastructure. Scales with the number of connected sites and devices.

```biz42
:::cashflow
id: cashflow-cloud-infra
title: Cloud Infrastructure
type: cost
category: infrastructure
linked-to: capability-alert-delivery
recurrence: recurring
:::
```

## Platform Integration Engineering

Engineering effort to maintain and extend integrations with enterprise notification
systems, IoT platforms, and asset-tracking systems.

```biz42
:::cashflow
id: cashflow-integration-engineering
title: Platform Integration Engineering
type: cost
category: engineering
linked-to: capability-platform-integration
recurrence: recurring
:::
```

## Salaries and Team

Core team salaries covering product, engineering, and customer success.

```biz42
:::cashflow
id: cashflow-salaries
title: Salaries and Team
type: cost
category: personnel
recurrence: recurring
:::
```

## Business Model Canvas

The Business Model Canvas maps the acme-emergency business model across its nine
building blocks.

:::diagram
id: diagram-bmc
title: Business Model Canvas
notation: bmc
:::

```yaml
key-partners:
  - "Cloud infrastructure providers"
  - "IoT hardware vendors"
  - "System integrators"
key-resources:
  - capability-alert-delivery
  - capability-location-routing
  - capability-sensor-ingestion
key-activities:
  - capability-platform-integration
  - capability-asset-integration
value-propositions:
  - product-alert-service
  - product-sensor-bridge
customer-relationships:
  - "Self-service onboarding portal"
  - "Dedicated customer success"
channels:
  - capability-platform-integration
customer-segments:
  - "Large enterprises with distributed sites"
  - "Organisations with mobile workforce"
  - "Safety-regulated industries"
cost-structure:
  - cashflow-cloud-infra
  - cashflow-integration-engineering
  - cashflow-salaries
revenue-streams:
  - cashflow-subscription-fee
  - cashflow-sensor-bridge-addon
  - cashflow-professional-services
```
