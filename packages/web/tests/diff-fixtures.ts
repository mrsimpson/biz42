/// <reference types="node" />

// Fixtures for business-model-diff e2e tests: a temporary Git repository with a
// copy of the assistify example, committed, plus known uncommitted edits.

import { test as base, expect, type Page } from "@playwright/test";
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const exampleDir = resolve(__dirname, "../../../examples/assistify");
export const cliPath = resolve(__dirname, "../../cli/dist/cli.mjs");

function git(root: string, ...args: string[]): string {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
}

function edit(root: string, file: string, from: string | RegExp, to: string) {
  const path = join(root, file);
  const content = readFileSync(path, "utf8");
  // A replacer function keeps "$&" and friends in `to` literal.
  const next = content.replace(from, () => to);
  if (next === content) throw new Error(`Fixture edit did not apply to ${file}: ${String(from)}`);
  writeFileSync(path, next);
}

export const RISKS = "04-risks.biz42.md";
export const OPPORTUNITIES = "05-opportunities.biz42.md";

/**
 * Create a repository whose working tree differs from HEAD by:
 * - risk-commoditisation: severity changed without prose change (lint warning)
 * - opp-word-of-mouth: prose changed without block change (lint warning)
 * - "Compliance differentiator" section removed (element + section removed)
 * - "Partner channel" opportunity added in a new section, its prose containing
 *   a literal "</script>" and "$&"
 */
export function createDiffRepository(): string {
  const root = mkdtempSync(join(tmpdir(), "biz42-e2e-diff-"));
  cpSync(exampleDir, root, { recursive: true });
  git(root, "init", "-q");
  git(root, "config", "user.email", "test@example.com");
  git(root, "config", "user.name", "biz42 e2e");
  git(root, "add", ".");
  git(root, "commit", "-qm", "initial business model");

  edit(
    root,
    RISKS,
    "id: risk-commoditisation\ntitle: Commoditisation by dominant chat platforms (Slack, Teams)\nseverity: high",
    "id: risk-commoditisation\ntitle: Commoditisation by dominant chat platforms (Slack, Teams)\nseverity: medium",
  );
  edit(
    root,
    OPPORTUNITIES,
    "was a lower-cost growth path than direct sales.",
    "was a far lower-cost growth path than direct sales.",
  );
  edit(
    root,
    OPPORTUNITIES,
    /### Compliance differentiator vs US-hosted competitors\n[\s\S]*?```\n\n/,
    "",
  );
  writeFileSync(
    join(root, OPPORTUNITIES),
    `${readFileSync(join(root, OPPORTUNITIES), "utf8").trimEnd()}\n\n### Partner channel via system integrators\n\nIntegrators bundle a compliant chat layer, never \`</script>\` tags or \`$&\` patterns.\n\n\`\`\`biz42\n:::opportunity\nid: opp-partner-channel\ntitle: Reach enterprise buyers through system-integrator partners\n:::\n\`\`\`\n`,
  );
  return root;
}

/** Serve a directory of static files, like a static host serving a `biz42 build` output. */
export async function serveStatic(
  root: string,
  port: number,
): Promise<{ url: string; stop: () => Promise<void> }> {
  const types: Record<string, string> = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".svg": "image/svg+xml",
  };
  const server = createServer((req, res) => {
    const path = join(root, (req.url ?? "/").split("?")[0] === "/" ? "index.html" : req.url!);
    if (!existsSync(path)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "Content-Type": types[extname(path)] ?? "application/octet-stream" });
    res.end(readFileSync(path));
  });
  await new Promise<void>((resolve) => server.listen(port, "127.0.0.1", resolve));
  return {
    url: `http://127.0.0.1:${port}`,
    stop: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

export function runCli(...args: string[]): string {
  return execFileSync("node", [cliPath, ...args], { encoding: "utf8" });
}

async function waitForServer(url: string, timeoutMs = 15000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

async function stopServer(server: ChildProcess): Promise<void> {
  if (server.exitCode !== null || server.signalCode !== null) return;
  const exited = new Promise<void>((resolve) => server.once("exit", () => resolve()));
  server.kill("SIGTERM");
  await Promise.race([exited, new Promise<void>((resolve) => setTimeout(resolve, 2000))]);
  if (server.exitCode === null && server.signalCode === null) {
    server.kill("SIGKILL");
    await exited;
  }
}

/** Start `biz42 serve --diff [...args]` for a repository and wait until it answers. */
export async function startDiffServer(
  root: string,
  port: number,
  ...args: string[]
): Promise<{ url: string; stop: () => Promise<void> }> {
  const url = `http://localhost:${port}`;
  const server = spawn(
    "node",
    [cliPath, "--dir", root, "serve", "--diff", ...args, "--port", String(port)],
    { stdio: "ignore" },
  );
  await waitForServer(`${url}/api/workspace`);
  return { url, stop: () => stopServer(server) };
}

type WorkerFixtures = { diffRepository: string; diffServerURL: string };

export const test = base.extend<object, WorkerFixtures>({
  diffRepository: [
    async ({ playwright }, use) => {
      void playwright;
      const root = createDiffRepository();
      try {
        await use(root);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    },
    { scope: "worker" },
  ],

  diffServerURL: [
    async ({ diffRepository }, use, workerInfo) => {
      const server = await startDiffServer(diffRepository, 3300 + workerInfo.workerIndex);
      try {
        await use(server.url);
      } finally {
        await server.stop();
      }
    },
    { scope: "worker" },
  ],

  page: async ({ browser, diffServerURL }, use) => {
    const context = await browser.newContext({ baseURL: diffServerURL });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  request: async ({ playwright, diffServerURL }, use) => {
    const context = await playwright.request.newContext({ baseURL: diffServerURL });
    await use(context);
    await context.dispose();
  },
});

export { expect, type Page };
