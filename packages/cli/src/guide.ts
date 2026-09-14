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
      return `biz42 guide — show authoring guides

Usage:
  biz42 guide [<topic>] [<chapter>]

Topics:
  migration        How to migrate from prose to DSL format
  chapter <n>      Guidance for a specific chapter (1–12)
`;

    default:
      return rootHelp();
  }
}

export function guideText(topic: string, argument?: string): string {
  if (topic === "migration") {
    return `# biz42 DSL Migration Guide

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
  }

  if (topic === "chapter") {
    const num = argument ? parseInt(argument, 10) : NaN;
    const chapter = CHAPTERS.find((ch) => ch.number === num);
    if (!chapter) {
      throw new Error(`Unknown chapter '${argument ?? ""}'. Use a number 1–12.`);
    }
    return `# Chapter ${chapter.number}: ${chapter.title}\n\n${chapter.template}`;
  }

  throw new Error(`Unknown guide topic '${topic}'. Try: migration, chapter <n>`);
}
