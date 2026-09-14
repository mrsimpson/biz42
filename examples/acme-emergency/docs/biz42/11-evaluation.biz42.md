# Evaluation

## 11.1 Review Cadence

Bi-weekly project review during the first 6 months (build phase). Monthly
after initial deployment stabilizes. All seven measures from chapter 7 are
reviewed at every cycle.

Ad-hoc review is triggered when:
- The works council negotiation stalls or escalates.
- Any real incident uses the system (every real alert is a learning event).
- Adoption at any newly launched site falls below 30% after 2 months.
- A connectivity failure prevents alert delivery in a real situation.

## 11.2 Review Participants

Build phase (bi-weekly): product lead, tech lead, project lead.
Post-deployment (monthly): above plus safety officer representative and
IT operations liaison.

Works council negotiation status is reviewed at every cycle during the
negotiation phase, with legal counsel present.

## 11.3 Escalation Criteria

- **Works council approval** not obtained by month 4: escalate to senior
  management sponsor. Prepare fallback plan (non-location-based alerting
  as interim). This is the single highest-priority escalation — it blocks
  everything.
- **Site coverage** below 50% at month 9: escalate to project steering
  committee. Options: accelerate rollout with additional resources, reduce
  scope to high-priority sites only, or accept timeline slip.
- **Adoption** below 30% at any site 2 months after launch: investigate
  root cause (UX, trust, communication, technical barriers). If systemic,
  escalate to product lead for product-level intervention.
- **Routing accuracy** below 60%: escalate to tech lead for positioning
  system review.
- **Offline delivery** fails in any tested scenario: escalate to tech lead
  for architecture review. This directly affects life safety in the
  highest-risk environments.
