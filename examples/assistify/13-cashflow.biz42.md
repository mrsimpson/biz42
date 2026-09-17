# Cashflow

## Revenue streams

### Team and department license fees

Assistify's primary revenue was a flat license fee charged per team or department, billed on a recurring basis. This model suited enterprise buyers who preferred predictable, budget-line costs over per-seat metering, and avoided the friction of counting individual users during procurement. At closing, the business had reached the €500k–€2M ARR range.

```biz42
:::cashflow
id: cf-team-license
title: Flat team / department license fee
type: revenue
category: subscription
recurrence: recurring
linked-to: prod-group-chat-platform
:::
```

## Cost items

### Team and personnel costs

The dominant cost item was the founding team's own compensation and any contractors engaged for product development, sales support, or AI work. For a small startup, personnel costs represented the majority of the cost base.

```biz42
:::cashflow
id: cf-personnel
title: Founding team and contractor personnel costs
type: cost
category: personnel
recurrence: recurring
linked-to: cap-product-engineering
:::
```

## Business Model Canvas

```biz42
:::diagram
id: diagram-bmc
title: Assistify Business Model Canvas
notation: bmc
:::
```

```yaml
key-partners:
  - "Rocket.Chat (open-source platform and dedicated hosting provider)"
  - "Deutsche Bahn Group (anchor customer and reference)"
key-resources:
  - cap-ai-knowledge-discovery
  - cap-gdpr-infrastructure
  - cap-rocketchat-hosting
key-activities:
  - cap-product-engineering
  - cap-enterprise-sales
  - cap-onboarding
value-propositions:
  - prod-group-chat-platform
  - prod-livechat
  - prod-translation
  - prod-chatops
  - prod-knowledge-management
customer-relationships:
  - "Direct enterprise sales with compliance-led pitch"
  - "Dedicated onboarding to first value"
  - "Reference customer programme (DB Group case studies)"
channels:
  - cap-enterprise-sales
customer-segments:
  - "Knowledge worker teams in IT and large enterprise sub-teams (DACH)"
  - "DB Group business units requiring live chat and ChatOps"
  - "Cross-border rail operators needing multilingual communication"
cost-structure:
  - cf-personnel
revenue-streams:
  - cf-team-license
```
