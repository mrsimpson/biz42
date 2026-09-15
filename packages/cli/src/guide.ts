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
  init            Initialize templates or install agent skill
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
      return `biz42 explain — explain block types and fields

Usage:
  biz42 explain [<block-type>] [options]

Arguments:
  <block-type>     One of: ${BLOCK_TYPES.join(", ")}
                   Omit to list all block types

Options:
  --format text|json   Output format (default: text)
  --help           Show this help
`;

    case "init":
      return `biz42 init — initialize templates or install agent skill

Usage:
  biz42 init template [--dir <path>]
  biz42 init skill [--path <dest>]

Subcommands:
  template         Create starter .biz42.md template files
  skill            Install the biz42 SKILL.md for agent use

Options:
  --dir <path>     Destination directory for templates (default: cwd)
  --path <dest>    Destination path for SKILL.md
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
  chapter <n>      Guidance for a specific chapter (1–12)
  migration        How to migrate from prose to DSL format
`;

    default:
      return rootHelp();
  }
}

const NEW_WORKSPACE_GUIDE = `# Building a biz42 Workspace from Scratch

biz42 models a business outside-in: you start with the world the organisation
operates in and work inward to what it does. Follow the sequence below.
Each chapter builds on the previous one — do not skip ahead.

## Step 0 — Scaffold the workspace

  biz42 init template --dir ./docs/biz42

This creates all 12 chapter files with starter templates. Open them in your
editor or share them with your agent.

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

## Step 2 — Work chapter by chapter

For each chapter, get authoring instructions and a template:

  biz42 guide chapter 1   # Scope
  biz42 guide chapter 2   # Signals
  ...
  biz42 guide chapter 12  # Improvements

After filling in each chapter, validate immediately:

  biz42 validate

Fix all errors (E) before moving on. Warnings (W) are planning gaps — address
them before the model is complete. Hints (H) are suggestions.

## Step 3 — Check what you have

At any point, inspect the workspace:

  biz42 get                          # summary of all elements
  biz42 get --type objective         # list all objectives
  biz42 get obj-my-objective         # inspect one element and its links
  biz42 validate                     # check consistency

## Step 4 — Understand the rules

  biz42 rules                        # all validation rules with explanations
  biz42 rules --chapter 6            # rules for Objectives only
  biz42 explain objective            # field reference for a block type

## Step 5 — View the model

  biz42 serve                        # open the SPA viewer in your browser

## Traceability chain

Every element must connect upward and downward:

  signal / expectation
    └─ surfaces → risk / opportunity
                     └─ addresses ← objective → measured-by → measure
                                              └─ owner
                                              └─ requires → capability
                                                               └─ enables ← product
  evaluation
    └─ evaluates → measure
         └─ triggered-by ← improvement → addresses → objective / risk / measure

A model is consistent when:
  - Every signal and expectation surfaces at least one risk or opportunity
  - Every risk and opportunity is addressed by at least one objective
  - Every objective has a measure, an owner, and addresses something
  - Every measure is referenced by an objective
  - Every capability is required by an objective or enabled by a product

Run \`biz42 validate\` to check. Run \`biz42 rules\` to understand each rule.
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
      throw new Error(`Unknown chapter '${argument ?? ""}'. Use a number 1–12.`);
    }
    return `# Chapter ${chapter.number}: ${chapter.title}\n\n${chapter.guide}`;
  }

  throw new Error(`Unknown guide topic '${topic}'. Try: (no topic), chapter <n>, migration`);
}
