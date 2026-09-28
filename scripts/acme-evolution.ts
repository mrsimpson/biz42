/**
 * ACME Emergency grows beyond its own organisation: the business development
 * story told by the live "business model evolution" page of the site and the
 * showcase pull request of the business model review.
 *
 * Starting from examples/acme-emergency (tagged v1.0 in a story repository),
 * a business development plan in five commits and a final change:
 * 1. evidence: peer operators ask for our alerting — a signal and an expectation,
 *    recorded before anything is decided
 * 2. opportunity: offer ACME to peer operators — the evidence surfaces an
 *    opportunity, and a risk that comes with it
 * 3. style: rewrap the signals chapter — formatting only, no model change
 * 4. objective: win three operator pilots — a new objective with its measure and
 *    a new owner (the organisation changes); the existing rollout objective now
 *    also guards against the new risk; the strategy map grows
 * 5. capability: multi-tenant operations — the capability gap the objective
 *    requires, and the service it enables
 * 6. The incumbent vendor risk is raised without the model saying why — the
 *    reason lives in a commit message, not in the prose (a lint warning); left
 *    uncommitted in a story repository, committed in the showcase PR.
 *
 * Usage (Node 24):
 *   node --experimental-strip-types scripts/acme-evolution.ts repo <dir>
 *     Create a Git repository at <dir> telling the whole story.
 *   node --experimental-strip-types scripts/acme-evolution.ts commit <workspace>
 *     Apply the story to an acme-emergency workspace of the current repository,
 *     one commit per step (the last step included).
 */

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ACME_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../examples/acme-emergency",
);

const DOCS = "docs/biz42";
const SIGNALS = `${DOCS}/02-signals.biz42.md`;
const EXPECTATIONS = `${DOCS}/03-expectations.biz42.md`;
const RISKS = `${DOCS}/04-risks.biz42.md`;
const OPPORTUNITIES = `${DOCS}/05-opportunities.biz42.md`;
const OBJECTIVES = `${DOCS}/06-objectives.biz42.md`;
const MEASURES = `${DOCS}/07-measures.biz42.md`;
const OWNERS = `${DOCS}/08-owners.biz42.md`;
const CAPABILITIES = `${DOCS}/09-capabilities.biz42.md`;
const PRODUCTS = `${DOCS}/10-products-and-services.biz42.md`;

export interface EvolutionStep {
  /** Commit message: subject, then body paragraphs. */
  message: string[];
  apply(workspace: string): void;
}

function git(root: string, ...args: string[]): string {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
}

function edit(workspace: string, file: string, from: string | RegExp, to: string) {
  const path = join(workspace, file);
  const content = readFileSync(path, "utf8");
  // A replacer function keeps "$&" and friends in `to` literal.
  const next = content.replace(from, () => to);
  if (next === content) throw new Error(`Story edit did not apply to ${file}: ${String(from)}`);
  writeFileSync(path, next);
}

function append(workspace: string, file: string, section: string) {
  const path = join(workspace, file);
  writeFileSync(path, `${readFileSync(path, "utf8").trimEnd()}\n\n${section.trim()}\n`);
}

function block(type: string, attributes: Record<string, string>): string {
  const lines = Object.entries(attributes).map(([key, value]) => `${key}: ${value}`);
  return ["```biz42", `:::${type}`, ...lines, ":::", "```"].join("\n");
}

/** The five commits of the plan on top of v1.0, oldest first. */
export const EVOLUTION: EvolutionStep[] = [
  {
    message: [
      "evidence: peer operators ask for our alerting",
      "After the pilot sites went live, **three regional transport operators** asked whether they could use ACME for their own staff. Nothing is decided yet: this records what we heard, and what they expect.",
    ],
    apply(workspace) {
      append(
        workspace,
        SIGNALS,
        `## Peer Operators Ask to Use the Service

Since the first sites went live, three regional transport operators have asked
whether they could use ACME for their own staff. They face the same regulations
and the same "who is closest?" problem, and none of them can justify building
it alone.

${block("signal", {
  id: "signal-peer-operator-requests",
  title: "Peer Operators Ask to Use the Service",
  source: "external",
})}`,
      );
      append(
        workspace,
        EXPECTATIONS,
        `## Peer Operators — A Hosted Service With a Service Level

The operators who asked do not want to run software. They expect a hosted
service, their data kept apart from every other customer's, and a service
level they can put in front of their own works council and safety officers.

${block("expectation", {
  id: "exp-operators-hosted-service",
  title: "Peer Operators — Hosted, Separated, With a Service Level",
  source: "regional transport operators",
})}`,
      );
    },
  },
  {
    message: [
      "opportunity: offer ACME to peer operators",
      "The requests are not a one-off: they come from operators with the same regulation, the same sites and the same problem. That makes them an **opportunity** — and serving outside customers is a **risk** to the internal rollout we owe our own organisation first.",
    ],
    apply(workspace) {
      edit(
        workspace,
        SIGNALS,
        "title: Peer Operators Ask to Use the Service\nsource: external",
        "title: Peer Operators Ask to Use the Service\nsource: external\nsurfaces: opp-operator-offering",
      );
      edit(
        workspace,
        SIGNALS,
        'and the same "who is closest?" problem, and none of them can justify building\nit alone.',
        'and the same "who is closest?" problem, and none of them can justify building\nit alone. Three independent requests within a quarter are a market, not a favour.',
      );
      edit(
        workspace,
        EXPECTATIONS,
        "source: regional transport operators",
        "source: regional transport operators\nsurfaces: opp-operator-offering, risk-focus-dilution",
      );
      edit(
        workspace,
        EXPECTATIONS,
        "level they can put in front of their own works council and safety officers.",
        "level they can put in front of their own works council and safety officers.\nMeeting that is a business of its own — and it competes with our own rollout.",
      );
      append(
        workspace,
        OPPORTUNITIES,
        `## Offer ACME to Peer Operators

Regional transport operators share our regulation, our kind of sites and our
problem. Offering ACME as a hosted service turns what we build for ourselves
into a second source of funding — and the first step of the spin-out the scope
already anticipates.

${block("opportunity", {
  id: "opp-operator-offering",
  title: "Offer ACME as a Hosted Service to Peer Operators",
})}`,
      );
      append(
        workspace,
        RISKS,
        `## Focus Dilution

Every hour spent on outside customers is an hour not spent on our own rollout,
which has a fixed 12-month window and a political deadline behind it.

${block("risk", {
  id: "risk-focus-dilution",
  title: "External Customers Dilute Focus on the Internal Rollout",
  severity: "high",
  mitigation: "Pilots only after the rollout milestones; a separate owner for the offering",
})}`,
      );
    },
  },
  {
    message: ["style: rewrap the signals chapter"],
    apply(workspace) {
      edit(
        workspace,
        SIGNALS,
        "Several high-profile workplace incidents in the DACH transportation sector have\ndrawn media and political scrutiny.",
        "Several high-profile workplace incidents in the DACH transportation\nsector have drawn media and political scrutiny.",
      );
    },
  },
  {
    message: [
      "objective: win three operator pilots",
      "None of our objectives covers outside customers, so the opportunity gets **its own objective**, measure and owner: a new **Head of Business Development** role. The rollout objective now also addresses the focus risk — pilots never take precedence over our own sites.",
    ],
    apply(workspace) {
      edit(
        workspace,
        OBJECTIVES,
        "addresses: risk-rollout-timeline, risk-incumbent-response, risk-reputational, opp-internal-mandate, opp-cost-effective-alerting",
        "addresses: risk-rollout-timeline, risk-incumbent-response, risk-reputational, risk-focus-dilution, opp-internal-mandate, opp-cost-effective-alerting",
      );
      edit(
        workspace,
        OBJECTIVES,
        "stations, workshops, depots) within 12 months. The 12-month window is a\nconstraint, not a wish.",
        "stations, workshops, depots) within 12 months. The 12-month window is a\nconstraint, not a wish — and it takes precedence over any outside customer.",
      );
      append(
        workspace,
        OBJECTIVES,
        `## Operator Pilots

Win three regional transport operators as paying pilot customers of a hosted
ACME service, without taking people off the internal rollout. A pilot counts
when the operator's works council has approved it and staff are live.

Target: 3 paying operator pilots live.
Deadline: month 15.

${block("objective", {
  id: "obj-operator-pilots",
  title: "Three Paying Operator Pilots Live",
  addresses: "opp-operator-offering",
  "measured-by": "measure-operator-pilots",
  owner: "owner-business-development",
})}`,
      );
      edit(
        workspace,
        OBJECTIVES,
        '        opp-sensor-bridge(["Sensor Bridge Opp."])',
        '        opp-sensor-bridge(["Sensor Bridge Opp."])\n        opp-operator-offering(["Operator Offering Opp."])\n        risk-focus-dilution(["Focus Risk"])',
      );
      edit(
        workspace,
        OBJECTIVES,
        '        obj-sensor-bridge["Sensor Bridge"]',
        '        obj-sensor-bridge["Sensor Bridge"]\n        obj-operator-pilots["Operator Pilots"]',
      );
      edit(
        workspace,
        OBJECTIVES,
        '        measure-sensor-integrations["Sensor Integrations"]',
        '        measure-sensor-integrations["Sensor Integrations"]\n        measure-operator-pilots["Operator Pilots"]',
      );
      edit(
        workspace,
        OBJECTIVES,
        "    opp-sensor-bridge --> obj-sensor-bridge\n",
        "    opp-sensor-bridge --> obj-sensor-bridge\n    opp-operator-offering --> obj-operator-pilots\n    risk-focus-dilution --> obj-time-to-deployment\n",
      );
      edit(
        workspace,
        OBJECTIVES,
        "    obj-sensor-bridge --> measure-sensor-integrations\n",
        "    obj-sensor-bridge --> measure-sensor-integrations\n    obj-operator-pilots --> measure-operator-pilots\n",
      );
      append(
        workspace,
        MEASURES,
        `## Operator Pilots

Number of regional transport operators with a signed pilot agreement, works
council approval and staff live on the hosted service.

Method: contract register and tenant activity.
Success: 3 operators live.

${block("measure", {
  id: "measure-operator-pilots",
  title: "Operator Pilots Live",
  target: "3 operators live by month 15",
})}`,
      );
      append(
        workspace,
        OWNERS,
        `## Head of Business Development

A new role. Accountable for the operator offering: finding and signing pilot
customers, their contracts and service levels, and the case for spinning ACME
out. Kept apart from the project and product leads so that the internal
rollout keeps its people.

${block("owner", {
  id: "owner-business-development",
  title: "Head of Business Development",
  role: "Head of Business Development",
})}`,
      );
    },
  },
  {
    message: [
      "capability: multi-tenant operations",
      "Pilots need what we never needed for ourselves: running ACME for several organisations, their data kept apart, under a service level. That is a **capability gap**, and it enables a **new service**: ACME for Operators.",
    ],
    apply(workspace) {
      edit(
        workspace,
        OBJECTIVES,
        "  owner: owner-business-development\n".trimStart(),
        "owner: owner-business-development\nrequires: capability-multi-tenant-operations\n",
      );
      edit(
        workspace,
        OBJECTIVES,
        "council has approved it and staff are live.",
        "council has approved it and staff are live. Pilots require running ACME for\nseveral organisations at once — something we do not do today.",
      );
      append(
        workspace,
        CAPABILITIES,
        `## Multi-Tenant Operations

The ability to run ACME for several organisations at once: each tenant's
people, sites and alert data kept apart, onboarding without code changes, and
operations that meet a contractual service level. Today we run one instance
for one organisation, so this is a gap.

${block("capability", {
  id: "capability-multi-tenant-operations",
  title: "Multi-Tenant Operations",
  status: "gap",
  enables: "product-operator-service",
  owner: "owner-tech-lead",
})}`,
      );
      append(
        workspace,
        PRODUCTS,
        `## ACME for Operators

The alert service, hosted for other transport operators: their own tenant,
their own works council agreement, and a service level they can rely on.

${block("product", {
  id: "product-operator-service",
  title: "ACME for Operators — Hosted Alert Service",
  fulfills: "exp-operators-hosted-service",
  owner: "owner-business-development",
})}`,
      );
    },
  },
];

/** The last change: a risk is raised, but nobody wrote down why. */
export const LATEST: EvolutionStep = {
  message: [
    "chore: raise the incumbent response risk",
    "Selling to other operators puts us in the incumbent vendor's market.",
  ],
  apply(workspace) {
    edit(
      workspace,
      RISKS,
      "title: Incumbent Response From Enterprise Notification Vendor\nseverity: medium",
      "title: Incumbent Response From Enterprise Notification Vendor\nseverity: high",
    );
  },
};

function commitAll(root: string, message: string[], paths: string[] = ["-A"]) {
  git(root, "add", ...paths);
  git(root, "commit", "-q", ...message.flatMap((paragraph) => ["-m", paragraph]));
}

/**
 * Create a Git repository at `root` with the acme-emergency example as its
 * first commit, tagged `v1.0` — the starting point of the story.
 */
export function createAcmeRepository(root: string): void {
  cpSync(ACME_DIR, root, { recursive: true });
  git(root, "init", "-q");
  git(root, "config", "user.email", "strategy@example.com");
  git(root, "config", "user.name", "ACME Strategy");
  commitAll(root, ["docs: ACME Emergency business model"]);
  git(root, "tag", "v1.0");
}

/** Create a repository at `root` telling the whole story; the latest change stays uncommitted. */
export function createEvolutionRepository(root: string): void {
  createAcmeRepository(root);
  for (const step of EVOLUTION) {
    step.apply(root);
    commitAll(root, step.message);
  }
  LATEST.apply(root);
}

/** Apply the whole story to `workspace` inside its repository, one commit per step. */
export function commitEvolution(workspace: string): void {
  for (const step of [...EVOLUTION, LATEST]) {
    step.apply(workspace);
    commitAll(workspace, step.message, ["--", "."]);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command, target] = process.argv.slice(2);
  if (command === "repo" && target) {
    if (existsSync(target)) throw new Error(`${target} already exists`);
    createEvolutionRepository(resolve(target));
  } else if (command === "commit" && target) {
    commitEvolution(resolve(target));
  } else {
    console.error("Usage: acme-evolution.ts repo <dir> | commit <workspace>");
    process.exit(2);
  }
}
