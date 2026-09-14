# Risks

## Works Council Rejection

The works council may block deployment if they conclude the system enables
employee surveillance. German co-determination law (BetrVG §87) gives the
works council veto power over systems that monitor employee behavior. Location-
aware alerting is inherently close to this boundary. If the privacy architecture
doesn't convince the works council, the project is dead regardless of technical
merit.

Arises from: signal "Works Council Sensitivity to Employee Tracking",
expectation "Works Council — Privacy Safeguards".
Impact: critical (complete project stop).
Status: open.
Addressed by: objective obj-privacy-architecture.
Affects: capability-location-routing, product-alert-service.

## Adoption Failure

If employees don't install the app or don't trust the system, it doesn't
matter how well it works technically. Adoption risk is twofold: practical
(people won't install a work app on their personal phone) and cultural
(people won't use a system they suspect tracks them). Both must be addressed
simultaneously.

Arises from: expectation "Employees — Fast Help When It Matters",
expectation "IT Operations — Integration With Existing Infrastructure".
Impact: high (product becomes irrelevant without users).
Status: open.
Addressed by: objective obj-adoption-rate.
Affects: product-alert-service.

## Connectivity Gaps

The organization operates in environments with unreliable or no network
connectivity: railway tunnels, underground stations, basements, rural track
sections, and industrial areas with electromagnetic interference. An alerting
system that fails when you're in a tunnel is failing in exactly the places
where emergencies are most dangerous.

Arises from: (implicit — operational reality of transportation/industrial
environments).
Impact: high (service unreliable in highest-risk locations).
Status: open.
Addressed by: objective obj-offline-resilience.
Affects: capability-alert-delivery, capability-location-routing.

## Incumbent Response

The provider of the existing enterprise notification system could respond to
this initiative by offering a lower-cost tier or adding location-based alerting
features. Given their existing relationship with the organization and
established procurement channel, they could pre-empt ACME Emergency before
it launches.

Arises from: signal "Existing Enterprise Notification Systems Are Overbuilt
for Local Alerting".
Impact: medium (project loses justification if incumbent closes the gap).
Status: open — monitoring incumbent's product roadmap.
Addressed by: objective obj-time-to-deployment.
Affects: product-alert-service.

## Reputational Risk From Inaction

If another workplace incident occurs before a systematic alerting solution is
in place, the organization faces renewed media and political criticism. The
existence of an unfunded or stalled alerting initiative would make this worse,
not better.

Arises from: signal "Political Pressure After Workplace Incidents".
Impact: high (reputational, political).
Status: open — mitigated by fast rollout timeline.
Addressed by: objective obj-time-to-deployment.

## Rollout Timeline

Company-wide rollout within 12 months is ambitious. If the rollout stalls at
pilot stage, management confidence erodes, budget gets reallocated, and the
incumbent has time to respond. The 12-month window is a constraint, not a wish.

Arises from: expectation "Management — Cost-Effective Alternative".
Impact: high (project viability).
Status: open.
Addressed by: objective obj-time-to-deployment.
