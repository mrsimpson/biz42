# Risks

## Market and competitive risks

### Commoditisation by dominant chat platforms

Slack and later Microsoft Teams were rapidly becoming the de-facto standard for team communication in enterprises. Their network effects, ecosystem, and brand recognition threatened to commoditise the group chat layer, making it hard for Assistify to differentiate on communication features alone.

```biz42
:::risk
id: risk-commoditisation
title: Commoditisation by dominant chat platforms (Slack, Teams)
severity: high
mitigation: Differentiate on GDPR compliance and implicit AI knowledge discovery — features the US-hosted platforms could not offer to DACH enterprise buyers.
:::
```

### Enterprise procurement friction

Large enterprises in DACH had long, complex procurement approval cycles involving IT security reviews, legal assessments, and management sign-off. This slowed time-to-revenue significantly for a small team.

```biz42
:::risk
id: risk-enterprise-procurement
title: Long and complex enterprise procurement cycles
severity: high
mitigation: Lead with compliance advantages to reduce legal review friction; target innovation-friendly sub-teams within large organisations as initial landing zones.
:::
```

## Product and go-to-market risks

### Value communication failure

The core value — AI that implicitly surfaces knowledge without any user action — was abstract and difficult to demonstrate in a sales conversation or marketing material. Buyers expected a search box; Assistify offered something harder to see.

```biz42
:::risk
id: risk-value-communication
title: Inability to communicate implicit AI value to enterprise buyers
severity: high
mitigation: Use reference customer case studies and live demos with real team data to make the value tangible; train sales on buyer-language framing around compliance and productivity.
:::
```

### Low user adoption within customer teams

Even after procurement approval, individual team members might not adopt Assistify if the perceived benefit was not immediate and obvious, especially in teams already accustomed to email or other tools.

```biz42
:::risk
id: risk-user-adoption
title: Low end-user adoption within enterprise teams
severity: medium
mitigation: Ensure onboarding surfaces a knowledge discovery result within the first session; integrate with existing tools (wikis, SharePoint) to show value immediately.
:::
```

### Long sales cycles draining runway

The combination of the buyer-user split and enterprise procurement complexity meant sales cycles could stretch to many months — a critical risk for a capital-constrained startup.

```biz42
:::risk
id: risk-long-sales-cycles
title: Sales cycles too long for startup runway
severity: high
mitigation: Focus on DB Group sub-teams as a captive early market with shorter internal procurement paths; build referenceable customers to shorten future cycles.
:::
```

### Platform availability and reliability

Enterprise customers expected high availability and reliable uptime from any communication platform. A small founding team could not operate enterprise-grade infrastructure independently, so Assistify compensated by procuring dedicated hosting from Rocket.Chat. This resolved the technical reliability problem but introduced substantial administrative overhead — the vendor relationship required ongoing procurement effort, contract management, and coordination that consumed capacity the team could not easily spare.

```biz42
:::risk
id: risk-availability
title: Platform availability and reliability constrained by small team and vendor dependency
severity: high
mitigation: Procure dedicated hosting from Rocket.Chat to meet enterprise uptime expectations; absorb administrative overhead of vendor management as an acceptable trade-off against self-hosting risk.
:::
```

### Execution capacity constraints

With a small founding team, the bandwidth to simultaneously develop the product, close enterprise deals, and support existing customers was a constant constraint that could lead to quality issues or missed opportunities.

```biz42
:::risk
id: risk-execution-capacity
title: Execution capacity limited by small team size
severity: medium
mitigation: Prioritise ruthlessly — focus on the smallest set of features that close the next deal; delay non-critical development until revenue enables hiring.
:::
```
