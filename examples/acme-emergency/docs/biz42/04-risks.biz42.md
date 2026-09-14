# Risks

## Works Council Rejection

The works council may block deployment if they conclude the system enables
employee surveillance. German co-determination law (BetrVG §87) gives the
works council veto power. If the privacy architecture doesn't convince them,
the project is dead regardless of technical merit.

```biz42
:::risk
id: risk-works-council
title: Works Council Rejection
severity: high
mitigation: Design privacy-first location architecture; obtain formal Betriebsvereinbarung before deployment
:::
```

## Adoption Failure

If employees don't install the app or don't trust the system, it doesn't
matter how well it works technically. Adoption risk is both practical (personal
devices) and cultural (surveillance concerns).

```biz42
:::risk
id: risk-adoption
title: Adoption Failure
severity: high
mitigation: Transparent privacy communication, voluntary participation design, UX simplicity
:::
```

## Connectivity Gaps

The organization operates in environments with unreliable or no network
connectivity: railway tunnels, underground stations, basements, rural track
sections. An alerting system that fails in a tunnel fails exactly where
emergencies are most dangerous.

```biz42
:::risk
id: risk-connectivity
title: Connectivity Gaps in High-Risk Environments
severity: high
mitigation: Device-to-device offline alert delivery; mesh networking fallback
:::
```

## Incumbent Response

The provider of the existing enterprise notification system could offer a
lower-cost tier or add location-based alerting before ACME Emergency launches.

```biz42
:::risk
id: risk-incumbent-response
title: Incumbent Response From Enterprise Notification Vendor
severity: medium
mitigation: Fast rollout; differentiate on proximity routing and cost
:::
```

## Reputational Risk From Inaction

If another workplace incident occurs before a systematic alerting solution is
in place, the organization faces renewed media and political criticism.

```biz42
:::risk
id: risk-reputational
title: Reputational Risk From Inaction
severity: high
mitigation: Fast 12-month rollout timeline; visible commitment to safety
:::
```

## Rollout Timeline

Company-wide rollout within 12 months is ambitious. If rollout stalls at
pilot stage, management confidence erodes and the incumbent has time to respond.

```biz42
:::risk
id: risk-rollout-timeline
title: Rollout Timeline Overrun
severity: high
mitigation: Phased site rollout with hard deadlines; dedicated project lead
:::
```
