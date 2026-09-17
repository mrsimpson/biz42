# Measures

## Platform uptime

Enterprise customers expected near-continuous availability. Monthly uptime tracked against the SLA committed to in enterprise contracts was the primary reliability measure, monitored via the Rocket.Chat hosted infrastructure.

```biz42
:::measure
id: measure-uptime
title: Platform uptime as reported by Rocket.Chat hosted infrastructure
target: >= 99.5% monthly uptime across all customer instances
:::
```

## Enterprise customer acquisition

The number of signed enterprise contracts was the primary revenue indicator and validated whether the go-to-market approach was working.

```biz42
:::measure
id: measure-enterprise-contracts
title: Number of signed enterprise contracts
target: 5 enterprise contracts within 12 months of product launch
:::
```

## Active daily users within customer teams

Daily active users within a customer team validated that end-user adoption was real, not just procurement approval. Low DAU was an early warning of churn risk.

```biz42
:::measure
id: measure-dau
title: Daily active users within deployed customer teams
target: > 60% of licensed seats active daily within 90 days of onboarding
:::
```

## Sales cycle duration

The average duration from first contact to signed contract tracked whether go-to-market improvements were reducing procurement friction.

```biz42
:::measure
id: measure-sales-cycle
title: Average sales cycle duration (first contact to signed contract)
target: < 6 months average sales cycle
:::
```

## Compliance qualification rate

The proportion of enterprise prospects that passed GDPR/compliance qualification without additional remediation work tracked the compliance differentiator in practice.

```biz42
:::measure
id: measure-compliance-rate
title: Proportion of prospects qualifying on GDPR/compliance without remediation
target: > 80% of DACH enterprise prospects qualify without additional legal remediation
:::
```

## Knowledge discovery activation rate

The proportion of users who experienced an implicit knowledge discovery result within their first week measured whether the core AI value proposition was delivering.

```biz42
:::measure
id: measure-discovery-activation
title: Knowledge discovery activation rate (first-week implicit result surfaced)
target: > 70% of new users receive an implicit knowledge result within their first 5 sessions
:::
```

## Net Promoter Score from early adopter teams

NPS from early adopter teams measured whether word-of-mouth growth was plausible and whether the product was creating genuine advocates.

```biz42
:::measure
id: measure-nps
title: Net Promoter Score from deployed teams
target: NPS > 40 among active users in deployed teams
:::
```
