#!/usr/bin/env node
import { parseArgs } from "node:util";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  createReadStream,
  watch,
} from "node:fs";
import { join, dirname, extname } from "node:path";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { discoverBiz42Dir } from "./discover.ts";
import { fileURLToPath } from "node:url";
import {
  builtinRules,
  explainElement,
  formatExplainText,
  formatExplainListText,
  explainDiagram,
  formatExplainDiagramText,
  formatExplainDiagramListText,
  ELEMENT_KIND_ORDER,
} from "@biz42/core";
import { builtinGetRenderers, rendererById } from "./renderer/index.ts";
import type { BlockType, Diagnostic } from "@biz42/core";
import { getElements, loadWorkspace, validateWorkspace } from "@biz42/workspace-fs";
import { commandHelp, rootHelp, guideText } from "./guide.ts";
import { CHAPTERS, filename } from "./chapters.ts";

// Directory of the running CLI file — used to locate bundled assets
const __dirname = dirname(fileURLToPath(import.meta.url));

// Read version from the bundled package.json
const { version: VERSION } = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf8"),
) as { version: string };

const BLOCK_TYPES: readonly BlockType[] = ELEMENT_KIND_ORDER;

function isBlockType(s: string): s is BlockType {
  return (BLOCK_TYPES as readonly string[]).includes(s);
}

// ---------------------------------------------------------------------------
// Global flag parsing
// Resolution order: --dir flag > BIZ42_DIR env > auto-discover > cwd
// ---------------------------------------------------------------------------

function resolveDir(flagDir: string | undefined): string {
  if (flagDir) return flagDir;
  if (process.env["BIZ42_DIR"]) return process.env["BIZ42_DIR"];
  const discovered = discoverBiz42Dir(process.cwd());
  if (discovered) return discovered;
  return process.cwd();
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main() {
  const argv = process.argv.slice(2);

  const { values: globalValues, positionals } = parseArgs({
    args: argv,
    options: {
      dir: { type: "string" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
    allowPositionals: true,
    strict: false,
  });

  if (globalValues["version"]) {
    console.log(`biz42 v${VERSION}`);
    process.exit(0);
  }

  const command = positionals[0];
  const commandArgs = argv.slice(argv.indexOf(command ?? "") + (command ? 1 : 0));

  if (!command) {
    console.log(rootHelp());
    process.exit(0);
  }

  if (globalValues["help"] || commandArgs.includes("--help") || commandArgs.includes("-h")) {
    const help = commandHelp(command, commandArgs[0], BLOCK_TYPES);
    if (help) {
      console.log(help);
      process.exit(0);
    }
  }

  if (command === "guide") {
    runGuide(commandArgs);
  }

  const dir = resolveDir(globalValues["dir"] as string | undefined);

  if (command === "validate") {
    await runValidate(dir, commandArgs);
  } else if (command === "get") {
    await runGet(dir, commandArgs);
  } else if (command === "rules") {
    runRules(commandArgs);
  } else if (command === "explain") {
    runExplain(commandArgs);
  } else if (command === "init") {
    runInit(commandArgs);
  } else if (command === "serve") {
    await runServe(dir, commandArgs);
  } else if (command === "build") {
    await runBuild(dir, commandArgs);
  } else {
    console.error(`Unknown command: ${command}`);
    console.log(rootHelp());
    process.exit(2);
  }
}

// ---------------------------------------------------------------------------
// validate
// ---------------------------------------------------------------------------

async function runValidate(dir: string, args: string[]) {
  const { values } = parseArgs({
    args,
    options: {
      format: { type: "string", default: "text" },
      quiet: { type: "boolean", default: false },
      strict: { type: "boolean", default: false },
    },
  });

  const format = values["format"] as string;
  const quiet = values["quiet"] as boolean;
  const strict = values["strict"] as boolean;

  try {
    const result = await validateWorkspace(dir);

    if (format === "json") {
      console.log(JSON.stringify(result, null, 2));
    } else {
      if (!quiet || !result.valid) {
        for (const d of result.diagnostics) {
          if (quiet && d.severity !== "error") continue;
          console.log(`${d.severity} ${d.code}  ${d.file}:${d.line}  ${d.message}`);
        }
      }
      if (!quiet) {
        const errors = result.diagnostics.filter((d: Diagnostic) => d.severity === "error").length;
        const warnings = result.diagnostics.filter(
          (d: Diagnostic) => d.severity === "warning",
        ).length;
        const hints = result.diagnostics.filter((d: Diagnostic) => d.severity === "hint").length;
        console.log(`\n${errors} errors, ${warnings} warnings, ${hints} hints`);
      }
    }

    const hasHints = result.diagnostics.some((d) => d.severity === "hint");
    process.exit(!result.valid || (strict && hasHints) ? 1 : 0);
  } catch (err) {
    console.error(`Error: ${String(err)}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// get
// ---------------------------------------------------------------------------

async function runGet(dir: string, args: string[]) {
  const { values, positionals } = parseArgs({
    args,
    options: {
      type: { type: "string" },
      format: { type: "string", default: "text" },
    },
    allowPositionals: true,
  });

  const id = positionals[0];
  const typeFlag = values["type"] as string | undefined;
  const format = values["format"] as string;

  if (typeFlag && !isBlockType(typeFlag)) {
    console.error(`Invalid --type '${typeFlag}'. Must be one of: ${BLOCK_TYPES.join(", ")}`);
    process.exit(2);
  }

  const renderer = rendererById.get(format);
  if (!renderer) {
    console.error(
      `Unknown --format '${format}'. Available: ${builtinGetRenderers.map((r) => r.meta.id).join(", ")}`,
    );
    process.exit(2);
  }

  try {
    const result = await getElements({
      dir,
      query: id
        ? { kind: "element", id }
        : { kind: "workspace", typeFilter: typeFlag as BlockType | undefined },
    });

    if (result === null) {
      console.error(`Element '${id}' not found`);
      process.exit(1);
    }

    console.log(renderer.render(result));
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${String(err)}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// rules
// ---------------------------------------------------------------------------

function runRules(args: string[]) {
  const { values } = parseArgs({
    args,
    options: {
      chapter: { type: "string" },
      format: { type: "string", default: "text" },
    },
  });

  const chapterFilter = values["chapter"] ? Number(values["chapter"]) : null;
  const format = values["format"] as string;

  let rules = [...builtinRules];
  if (chapterFilter !== null) {
    rules = rules.filter((r) => r.meta.docs.biz42Chapter === chapterFilter);
  }

  if (format === "json") {
    console.log(
      JSON.stringify(
        rules.map((r) => r.meta),
        null,
        2,
      ),
    );
    process.exit(0);
  }

  // Text: group by chapter
  const byChapter = new Map<number, typeof rules>();
  for (const rule of rules) {
    const ch = rule.meta.docs.biz42Chapter;
    const group = byChapter.get(ch) ?? [];
    group.push(rule);
    byChapter.set(ch, group);
  }

  const CHAPTER_NAMES: Record<number, string> = {
    0: "Cross-cutting",
    1: "Scope",
    2: "Signals",
    3: "Expectations",
    4: "Risks",
    5: "Opportunities",
    6: "Objectives",
    7: "Measures",
    8: "Owners",
    9: "Capabilities",
    10: "Products and Services",
    11: "Evaluation",
    12: "Improvements",
  };

  for (const [chapter, chRules] of [...byChapter.entries()].sort(([a], [b]) => a - b)) {
    console.log(`\n## Chapter ${chapter} — ${CHAPTER_NAMES[chapter] ?? "Other"}\n`);
    for (const rule of chRules) {
      const { code, severity, type, docs } = rule.meta;
      console.log(`  ${code}  [${severity}/${type}]  ${docs.description}`);
      console.log(`         ${docs.rationale}`);
    }
  }
  process.exit(0);
}

// ---------------------------------------------------------------------------
// explain
// ---------------------------------------------------------------------------

function runExplain(args: string[]) {
  const { values, positionals } = parseArgs({
    args,
    options: {
      format: { type: "string", default: "text" },
    },
    allowPositionals: true,
  });

  const format = values["format"] as string;
  const firstArg = positionals[0];

  // Sub-command: biz42 explain diagram [<notation>]
  if (firstArg === "diagram") {
    const notation = positionals[1];
    if (notation !== undefined) {
      const result = explainDiagram(notation);
      if (!result) {
        console.error(
          `Unknown diagram notation '${notation}'. Run \`biz42 explain diagram\` to list notations.`,
        );
        process.exit(2);
      }
      if (format === "json") {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(formatExplainDiagramText(result));
      }
    } else {
      if (format === "json") {
        // emit all entries in display order
        const all = [
          "bmc",
          "sipoc",
          "turtle",
          "strategy-map",
          "architecture",
          "sequence",
          "flowchart",
          "class",
          "auto",
        ]
          .map((n) => explainDiagram(n))
          .filter(Boolean);
        console.log(JSON.stringify(all, null, 2));
      } else {
        console.log(formatExplainDiagramListText());
      }
    }
    process.exit(0);
  }

  // Default: block type explain
  const blockTypeArg = firstArg;

  if (blockTypeArg !== undefined && !isBlockType(blockTypeArg)) {
    console.error(
      `Unknown block type '${blockTypeArg}'. Run \`biz42 explain\` to list block types.\n` +
        `To explain a diagram notation, use: biz42 explain diagram [<notation>]`,
    );
    process.exit(2);
  }

  if (blockTypeArg) {
    const result = explainElement(blockTypeArg as BlockType);
    if (format === "json") {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatExplainText(result));
    }
  } else {
    if (format === "json") {
      const all = BLOCK_TYPES.map((t) => explainElement(t));
      console.log(JSON.stringify(all, null, 2));
    } else {
      console.log(formatExplainListText());
    }
  }
  process.exit(0);
}

// ---------------------------------------------------------------------------
// init
// ---------------------------------------------------------------------------

function runInit(args: string[]) {
  const subcommand = args[0];

  if (subcommand === "skill") {
    runInitSkill(args.slice(1));
  } else if (subcommand === "template") {
    runInitTemplate(args.slice(1));
  } else {
    console.error(
      `Usage:\n  biz42 init skill [--path <dest>]\n  biz42 init template [--dir <path>]`,
    );
    process.exit(2);
  }
}

function runInitSkill(args: string[]) {
  const { values } = parseArgs({
    args,
    options: { path: { type: "string" } },
  });

  const dest =
    (values["path"] as string | undefined) ?? join(process.cwd(), ".agents/skills/biz42/SKILL.md");
  const src = join(__dirname, "skill/SKILL.md");

  if (!existsSync(src)) {
    console.error(`Bundled skill file not found at ${src}`);
    process.exit(1);
  }

  if (existsSync(dest)) {
    console.error(`File already exists: ${dest}\nUse --path to specify a different destination.`);
    process.exit(1);
  }

  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  console.log(`Skill installed: ${dest}`);
  process.exit(0);
}

function runInitTemplate(args: string[]) {
  const { values } = parseArgs({
    args,
    options: { dir: { type: "string" } },
  });

  const destDir = (values["dir"] as string | undefined) ?? process.cwd();
  mkdirSync(destDir, { recursive: true });

  let copied = 0;
  let skipped = 0;

  for (const chapter of CHAPTERS) {
    const file = filename(chapter);
    const dest = join(destDir, file);
    if (existsSync(dest)) {
      console.warn(`Skipping (already exists): ${dest}`);
      skipped++;
    } else {
      writeFileSync(dest, chapter.template, "utf8");
      copied++;
    }
  }

  console.log(
    `Templates copied: ${copied} file(s) to ${destDir}${skipped > 0 ? ` (${skipped} skipped)` : ""}`,
  );
  process.exit(0);
}

// ---------------------------------------------------------------------------
// guide
// ---------------------------------------------------------------------------

function runGuide(args: string[]) {
  const { positionals } = parseArgs({
    args,
    options: {},
    allowPositionals: true,
  });

  const subcommand = positionals[0] ?? "new";
  const argument = positionals[1];
  try {
    console.log(guideText(subcommand, argument));
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(2);
  }
}

// ---------------------------------------------------------------------------
// serve
// ---------------------------------------------------------------------------

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".png": "image/png",
};

async function runServe(dir: string, args: string[]) {
  const { values } = parseArgs({
    args,
    options: {
      port: { type: "string", default: "3142" },
      open: { type: "boolean", default: false },
    },
    strict: false,
  });

  const port = parseInt(values["port"] as string, 10);
  const openBrowser = values["open"] as boolean;
  const webDir = join(__dirname, "web");

  if (!existsSync(webDir)) {
    console.error(`Web assets not found at ${webDir}. Run 'pnpm build:web' first.`);
    process.exit(1);
  }

  let workspaceJson: string;
  try {
    const payload = await loadWorkspace(dir);
    workspaceJson = JSON.stringify(payload);
  } catch (err) {
    console.error(`Failed to load workspace from ${dir}: ${String(err)}`);
    process.exit(1);
  }

  const eventClients = new Set<import("node:http").ServerResponse>();
  let reloadTimer: NodeJS.Timeout | undefined;
  let watcher: import("node:fs").FSWatcher | undefined;

  const reloadWorkspace = () => {
    void loadWorkspace(dir)
      .then((payload) => {
        workspaceJson = JSON.stringify(payload);
        for (const client of eventClients) client.write("event: workspace\ndata: changed\n\n");
      })
      .catch((err: unknown) => {
        console.error(`Failed to reload workspace from ${dir}: ${String(err)}`);
      });
  };

  try {
    watcher = watch(dir, { recursive: true }, (_event, changedFile) => {
      const changed = changedFile?.toString() ?? "";
      if (changed && !changed.endsWith(".biz42.md")) return;
      if (reloadTimer) clearTimeout(reloadTimer);
      reloadTimer = setTimeout(reloadWorkspace, 100);
    });
    watcher.on("error", (err) => {
      console.error(`Failed to watch workspace ${dir}: ${String(err)}`);
    });
  } catch (err) {
    console.error(`Failed to watch workspace ${dir}: ${String(err)}`);
  }

  const server = createServer((req, res) => {
    const url = req.url ?? "/";

    if (url === "/api/workspace" || url === "/api/workspace/") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(workspaceJson);
      return;
    }

    if (url === "/api/workspace/events" || url === "/api/workspace/events/") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      res.write(": connected\n\n");
      eventClients.add(res);
      req.on("close", () => eventClients.delete(res));
      return;
    }

    let filePath = url === "/" ? join(webDir, "index.html") : join(webDir, url.split("?")[0]!);

    if (!filePath.startsWith(webDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    if (!existsSync(filePath)) {
      filePath = join(webDir, "index.html");
    }

    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    const stream = createReadStream(filePath);
    stream.on("error", () => {
      res.writeHead(500);
      res.end("Internal Server Error");
    });
    stream.pipe(res);
  });

  server.listen(port, "127.0.0.1", () => {
    const url = `http://localhost:${port}`;
    console.log(`biz42 serve  →  ${url}`);
    console.log(`  workspace: ${dir}`);
    console.log(`  Press Ctrl+C to stop.`);

    if (openBrowser) {
      const cmd =
        process.platform === "darwin"
          ? "open"
          : process.platform === "win32"
            ? "start"
            : "xdg-open";
      spawn(cmd, [url], { detached: true, stdio: "ignore" }).unref();
    }
  });

  await new Promise<void>((_, reject) => {
    server.on("error", reject);
    process.on("SIGINT", () => {
      if (reloadTimer) clearTimeout(reloadTimer);
      watcher?.close();
      for (const client of eventClients) client.end();
      server.close();
      process.exit(0);
    });
  });
}

// ---------------------------------------------------------------------------
// build
// ---------------------------------------------------------------------------

async function runBuild(dir: string, args: string[]) {
  const { values } = parseArgs({
    args,
    options: {
      out: { type: "string" },
      base: { type: "string", default: "./" },
    },
    strict: false,
  });

  const outDir = values["out"] as string | undefined;
  const base = (values["base"] as string) || "./";

  if (!outDir) {
    console.error("biz42 build: --out <dir> is required");
    console.log(commandHelp("build", undefined, BLOCK_TYPES));
    process.exit(2);
  }

  const webDir = join(__dirname, "web");
  if (!existsSync(webDir)) {
    console.error(`Web assets not found at ${webDir}. Run 'pnpm build:web' first.`);
    process.exit(1);
  }

  let workspaceJson: string;
  try {
    const payload = await loadWorkspace(dir);
    workspaceJson = JSON.stringify(payload);
  } catch (err) {
    console.error(`Failed to load workspace from ${dir}: ${String(err)}`);
    process.exit(1);
  }

  mkdirSync(outDir, { recursive: true });
  cpSync(webDir, outDir, { recursive: true });

  const indexPath = join(outDir, "index.html");
  if (!existsSync(indexPath)) {
    console.error(`index.html not found in output directory ${outDir}`);
    process.exit(1);
  }

  let html = readFileSync(indexPath, "utf8");

  if (base !== "./" && base !== "/") {
    html = html.replace(/src="\/assets\//g, `src="${base}assets/`);
    html = html.replace(/href="\/assets\//g, `href="${base}assets/`);
    html = html.replace(/ href="\/assets\//g, ` href="${base}assets/`);
  }

  const injection = `<script>window.__WORKSPACE__=${workspaceJson};</script>`;
  html = html.replace("</head>", `${injection}\n</head>`);

  writeFileSync(indexPath, html, "utf8");

  const countFiles = (d: string): number => {
    let n = 0;
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      n += entry.isDirectory() ? countFiles(join(d, entry.name)) : 1;
    }
    return n;
  };

  const fileCount = countFiles(outDir);
  console.log(`biz42 build  →  ${outDir}  (${fileCount} files)`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  const code = (err as { code?: string } | null)?.code;
  process.exit(code?.startsWith("ERR_PARSE_ARGS_") ? 2 : 1);
});
