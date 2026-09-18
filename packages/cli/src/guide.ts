import { CHAPTERS } from "./chapters.ts";
import type { BlockType } from "@biz42/core";
import { ELEMENT_KIND_ORDER } from "@biz42/core";

const BLOCK_TYPES: readonly BlockType[] = ELEMENT_KIND_ORDER;

export function rootHelp(): string {
  return `biz42 — business model documentation DSL

Usage:
  biz42 [--dir <path>] <command> [options]

Global options:
  --dir <path>    Path to the biz42 workspace directory
                  (env: BIZ42_DIR, or auto-discovered)
  --version, -v   Print version and exit
  --help, -h      Show help for a command

Commands:
  validate        Validate a biz42 workspace
  get             Query elements from the workspace
  rules           List validation rules
  explain         Explain block types and fields
  serve           Serve the SPA on localhost
  build           Build a static SPA export
  guide           Show authoring guides
`;
}

export function commandHelp(
  command: string,
  _subcommand?: string,
  _blockTypes?: readonly BlockType[],
): string {
  switch (command) {
    case "validate":
      return `biz42 validate — validate a biz42 workspace

Usage:
  biz42 [--dir <path>] validate [options]

Options:
  --format text|json   Output format (default: text)
  --quiet              Only show errors
  --strict             Exit with code 1 if any hints are found
  --help               Show this help
`;

    case "get":
      return `biz42 get — query elements from the workspace

Usage:
  biz42 [--dir <path>] get [<id>] [options]

Arguments:
  <id>             Element id to look up (omit for workspace view)

Options:
  --type <type>    Filter by block type: ${BLOCK_TYPES.join(", ")}
                   Use --type ignore to list all ignore directives
  --format text|json|markdown   Output format (default: text)
  --help           Show this help
`;

    case "rules":
      return `biz42 rules — list validation rules

Usage:
  biz42 rules [options]

Options:
  --chapter <n>    Filter by biz42 chapter number
  --format text|json   Output format (default: text)
  --help           Show this help
`;

    case "explain":
      return `biz42 explain — explain block types, fields, and diagram notations

Usage:
  biz42 explain [<block-type>] [options]
  biz42 explain diagram [<notation>] [options]
  biz42 explain ignore [options]

Arguments:
  <block-type>     One of: ${BLOCK_TYPES.join(", ")}
                   Omit to list all block types
  diagram          Explain diagram notations instead of block types
  <notation>       One of: bmc, sipoc, turtle, strategy-map, architecture,
                   sequence, flowchart, class, auto
                   Omit to list all diagram notations
  ignore           Explain the :::ignore directive syntax and constraints

Options:
  --format text|json   Output format (default: text)
  --help           Show this help
`;

    case "serve":
      return `biz42 serve — serve the biz42 SPA on localhost

Usage:
  biz42 [--dir <path>] serve [options]

Options:
  --port <n>       Port to listen on (default: 3142)
  --open           Open the browser automatically
  --help           Show this help
`;

    case "build":
      return `biz42 build — build a static SPA export

Usage:
  biz42 [--dir <path>] build --out <dir> [options]

Options:
  --out <dir>      Output directory (required)
  --base <path>    Base path for asset URLs (default: ./)
  --help           Show this help
`;

    case "guide":
      return `biz42 guide — authoring guides for building a biz42 workspace

Usage:
  biz42 guide [<topic>] [<chapter>]

Topics:
  (no topic)       Start here — workflow for building a new workspace
  chapter <n>      Guidance for a specific chapter
  migration        How to migrate from prose to DSL format
`;

    default:
      return rootHelp();
  }
}

const NEW_WORKSPACE_GUIDE = `# Building a biz42 Workspace from Scratch

Your role is facilitator, not author. Business facts cannot be derived from a
repository — they come from the people who run the organisation. Never invent
context, never fill in placeholders with guesses. Ask before writing.

biz42 models a business outside-in: you start with the world the organisation
operates in and work inward to what it does. Follow the sequence below.
Each chapter builds on the previous one — do not skip ahead.

The model will be inconsistent for most of the build. That is expected.
Forward references (risks that have no objective yet, objectives with no
measure yet) will appear as warnings as you write them. Note them and keep
going. Consistency is only required at the end.

## Step 0 — Create chapter files as you go

Do not create all chapter files upfront. Create each \`.biz42.md\` file when you
reach that chapter in Step 2. Use \`biz42 guide chapter <n>\` to get authoring
instructions, then create the corresponding file with an empty block stub before
filling it in.

## Step 0.5 — Gather existing documents

Before asking questions, invite the human to share any existing documents
that describe the business: strategy decks, board papers, quality manuals,
planning wikis, slide exports, org charts, financial summaries.

Then create a \`business-evidence.md\` file in the workspace to track every
business fact you record. Use this table format:

  | Source | Derived fact | Used in (chapter/id) | Confidence | OPEN? |
  | ------ | ------------ | -------------------- | ---------- | ----- |

For every fact you write into a block:
  - Add a row citing the source document and section
  - Facts with no source: mark as \`agent inference\`, confidence \`low\`,
    and add an OPEN question for the human to confirm

For any hint suppressed with \`:::ignore\` (see Step 4), add a row to record
the decision:
  - Source: rule code (e.g. H005)
  - Derived fact: element id and reason accepted
  - OPEN?: \`accepted\`

## Step 1 — Ask the right questions first

Before writing any blocks, gather answers to these questions from the person
who knows the business:

  1. What does this organisation do, and what does it explicitly not do?
     (→ Scope)
  2. What is happening in the market, technology, or regulation that could
     affect this organisation? (→ Signals)
  3. Who has a stake in this organisation — customers, regulators, employees,
     partners? What do they need? (→ Expectations)
  4. Which of those signals and expectations represent a threat?
     (→ Risks)
  5. Which represent an opportunity to grow or improve?
     (→ Opportunities)
  6. What commitments is the organisation making in response?
     (→ Objectives)
  7. How will it know whether those commitments are met?
     (→ Measures)
  8. Who is accountable for each commitment?
     (→ Owners)
  9. What organisational abilities are needed to deliver on those commitments?
     (→ Capabilities)
  10. What products or services does the organisation offer to its customers?
     (→ Products & Services)
  11. How does the organisation review its own performance?
     (→ Evaluation)
  12. What is it actively changing or improving as a result?
     (→ Improvements)
  13. What are the organisation's revenue streams and cost items?
     (→ Cashflow — optional)

## Step 2 — Work chapter by chapter

For each chapter, get authoring instructions:

  biz42 guide chapter 1   # Scope
  biz42 guide chapter 2   # Signals
  ...
  biz42 guide chapter 12  # Improvements
  biz42 guide chapter 13  # Cashflow (optional)

After writing each chapter, validate and note what is outstanding:

  biz42 validate

Fix any E (error) results immediately — they mean a block is broken and will
be excluded from the model. W (warning) and H (hint) results during the build
are expected forward references. Note them and keep going; they resolve as
you complete later chapters. Run \`biz42 rules --chapter <n>\` to look up what
any specific rule code means.

## Step 3 — Human review gate

Before closing the loop, present all OPEN items and low-confidence rows from
\`business-evidence.md\` to the human. Do not run \`--strict\` until the human
has resolved or accepted each open item.

## Step 4 — Close the loop

After all chapters are written and evidence is reviewed, work through all
outstanding results from:

  biz42 validate

Go back and fill in the fields that close the cross-references:
  - signals/expectations: add surfaces entries pointing to the risks/opps you wrote
  - risks/opportunities: confirm they are addressed by objectives
  - objectives: confirm measured-by, owner, and requires are all filled
  - products: add fulfills entries pointing to expectations

**Errors (E) must be resolved** before finishing — a block with an error is
excluded from the model entirely.

**Warnings (W) must be resolved** — present each one to the human and update
the model until none remain.

**Hints (H) should be resolved** — work through them with the human. If a hint
genuinely cannot be resolved (e.g. a signal with no surfaced risk because the
risk is deliberately out of scope), suppress it with an ignore directive inside
the same \`\`\`biz42 fence, giving a reason:

  \`\`\`biz42
  :::ignore H001 risk is deliberately out of scope for this model
  :::
  \`\`\`

Only W (warning) and H (hint) codes can be ignored. Attempting to ignore an
E (error) code emits W020 — errors are structural and must be fixed.

An unused ignore directive produces W019 — so if the underlying issue is later
fixed, the suppress will remind you to remove it. After suppressing, record the
decision in \`business-evidence.md\` with the rule code, element id, and reason.

Use \`biz42 explain ignore\` for directive syntax details, and
\`biz42 get --type ignore\` to list all ignore directives in the workspace.

Only then proceed to:

  biz42 validate --strict

This must exit with code 0. If it does not, repeat the loop above.

## Step 5 — Inspect and understand

  biz42 get                          # summary of all elements
  biz42 get --type objective         # list all objectives
  biz42 get obj-my-objective         # inspect one element and its links
  biz42 rules                        # all validation rules with explanations
  biz42 explain objective            # field reference for a block type

## Step 6 — View the model

  biz42 serve                        # open the SPA viewer in your browser

## Traceability chain

Every element must connect upward and downward:

  signal / expectation
    └─ surfaces → risk / opportunity
                     └─ addresses ← objective → measured-by → measure
                                              └─ owner
                                              └─ requires → capability → enables → product → fulfills → expectation
  evaluation
    └─ evaluates → measure
         └─ triggered-by ← improvement → addresses → objective / risk / measure

  cashflow (optional)
    └─ linked-to → product (revenue) or capability (cost)

The model is consistent when biz42 validate --strict exits 0.

This guide applies equally to initial authoring and to updates when strategy
changes. When updating an existing model, run \`biz42 validate\` first to
understand the current state before editing.
`;

const MIGRATION_GUIDE = `# biz42 DSL Migration Guide

## From prose to DSL

Each biz42 block type maps to a fenced block using \`:::type ... :::\` syntax,
optionally wrapped in a \`\`\`biz42 fence for Markdown renderer compatibility.

## Example — objective

Before (prose):
  Objective: Privacy Architecture Approved by Works Council
  Addresses: risk-works-council
  Measured by: measure-works-council-approval
  Owner: owner-product-lead

After (DSL):
  \`\`\`biz42
  :::objective
  id: obj-privacy-architecture
  title: Privacy Architecture Approved by Works Council
  addresses: risk-works-council
  measured-by: measure-works-council-approval
  owner: owner-product-lead
  requires: capability-location-routing
  :::
  \`\`\`

## Block types

${BLOCK_TYPES.map((t) => `  ${t}`).join("\n")}

## Chapter files

${CHAPTERS.map((ch) => `  ${String(ch.number).padStart(2, "0")}  ${ch.title}`).join("\n")}
`;

const EXPLAIN_BANNER = `> This guide covers process only — what to ask and when you are done.
> For field definitions, validation rules, and authoring tips run:
>
>   biz42 explain <block-type>

`;

export function guideText(topic: string, argument?: string): string {
  if (!topic || topic === "new") {
    return NEW_WORKSPACE_GUIDE;
  }

  if (topic === "migration") {
    return MIGRATION_GUIDE;
  }

  if (topic === "chapter") {
    const num = argument ? parseInt(argument, 10) : NaN;
    const chapter = CHAPTERS.find((ch) => ch.number === num);
    if (!chapter) {
      throw new Error(`Unknown chapter '${argument ?? ""}'. Use a number 1–13.`);
    }
    return EXPLAIN_BANNER + chapter.guide;
  }

  throw new Error(`Unknown guide topic '${topic}'. Try: (no topic), chapter <n>, migration`);
}
