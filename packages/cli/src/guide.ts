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
      return `biz42 explain — explain block types, fields, and diagram notations

Usage:
  biz42 explain [<block-type>] [options]
  biz42 explain diagram [<notation>] [options]

Arguments:
  <block-type>     One of: ${BLOCK_TYPES.join(", ")}
                   Omit to list all block types
  diagram          Explain diagram notations instead of block types
  <notation>       One of: bmc, sipoc, turtle, strategy-map, architecture,
                   sequence, flowchart, class, auto
                   Omit to list all diagram notations

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

The model will be inconsistent for most of the build. That is expected.
Forward references (risks that have no objective yet, objectives with no
measure yet) will appear as warnings as you write them. Note them and keep
going. Consistency is only required at the end.

## Step 0 — Scaffold the workspace

  biz42 init template --dir ./docs/biz42

This creates all 12 chapter files with starter templates. Then run:

  biz42 validate

You should see no errors on an empty scaffold. Note the baseline.

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

For each chapter, get authoring instructions:

  biz42 guide chapter 1   # Scope
  biz42 guide chapter 2   # Signals
  ...
  biz42 guide chapter 12  # Improvements

After writing each chapter, validate and note what is outstanding:

  biz42 validate

Expected pattern as you progress:
  - Ch 1 (Scope):        0 errors, 0 warnings — self-contained
  - Ch 2 (Signals):      warnings: H001 surfaces empty — expected, resolves in ch 4–5
  - Ch 3 (Expectations): warnings: H002 surfaces empty — expected, resolves in ch 4–5
  - Ch 4 (Risks):        warnings: W001 no addressing objective — expected, resolves in ch 6
  - Ch 5 (Opportunities):warnings: W008 no addressing objective — expected, resolves in ch 6
  - Ch 6 (Objectives):   warnings: W002 no measure, W003 no owner — expected, resolves in ch 7–8
                         errors:   E002 unresolved refs if measure/owner ids don't exist yet
  - Ch 7 (Measures):     W002 clears; W004 orphaned measure if not yet in objective
  - Ch 8 (Owners):       W003 clears; W005 unassigned owner resolves as objectives reference them
  - Ch 9 (Capabilities): H003/H007 may appear — resolves in ch 10 or when objectives use requires
  - Ch 10 (Products):    H004 may appear if fulfills is empty
  - Ch 11 (Evaluation):  W012 if evaluates is empty
  - Ch 12 (Improvements):W013/H006 until addresses and triggered-by are filled

Errors (E) mean a block is broken and will be excluded from the model. Fix
E-errors immediately — they indicate a missing id reference or parse error.

Warnings (W) and hints (H) during the build are expected forward references.
Keep a list of open warnings as you go and resolve them in later chapters.

## Step 3 — Close the loop

After all 12 chapters are written, work through the outstanding warnings:

  biz42 validate

Go back and fill in the fields that close the cross-references:
  - signals/expectations: add surfaces entries pointing to the risks/opps you wrote
  - risks/opportunities: confirm they are addressed by objectives
  - objectives: confirm measured-by, owner, and requires are all filled
  - products: add fulfills entries pointing to expectations

Repeat until:

  biz42 validate --strict

exits with code 0 — no errors, no warnings, no hints.

## Step 4 — Inspect and understand

  biz42 get                          # summary of all elements
  biz42 get --type objective         # list all objectives
  biz42 get obj-my-objective         # inspect one element and its links
  biz42 rules                        # all validation rules with explanations
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

The model is consistent when biz42 validate --strict exits 0.
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
