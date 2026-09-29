import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  cliPath,
  createStoryRepository,
  expect,
  runCli,
  startServer,
  test,
} from "./diff-fixtures.ts";

// Black-box tests of the business model history in `biz42 serve` and `biz42 build --with-history`.

interface Pearl {
  commit: string | null;
  subject: string;
  chunk: number;
}
interface Entry {
  commit: string | null;
  semantic: boolean;
  messageHtml: string;
  added: number;
  modified: number;
  removed: number;
  diff?: { view: { documents: unknown[] } };
  error?: string;
}
interface Tree {
  files: Record<string, string>;
}

const OPPORTUNITIES = "docs/biz42/05-opportunities.biz42.md";

const SUBJECTS = [
  "Uncommitted changes",
  "capability: multi-tenant operations",
  "objective: win three operator pilots",
  "style: rewrap the signals chapter",
  "opportunity: offer ACME to peer operators",
  "evidence: peer operators ask for our alerting",
  "docs: ACME Emergency business model",
];

function git(root: string, ...args: string[]): string {
  const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
  expect(result.status, result.stderr).toBe(0);
  return result.stdout;
}

function parseJsonLines<T>(text: string): T[] {
  expect(text.endsWith("\n")).toBe(true);
  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

function expectHistory(pearls: Pearl[], entries: Entry[]) {
  expect(pearls.map((pearl) => pearl.subject)).toEqual(SUBJECTS);
  expect(pearls.every((pearl) => pearl.chunk === 0)).toBe(true);
  expect(entries.map((entry) => entry.commit)).toEqual(pearls.map((pearl) => pearl.commit));
  const [working, capability, objective, style, opportunity, evidence, initial] = entries;
  expect(working).toMatchObject({ commit: null, semantic: true, added: 0, modified: 1 });
  expect(capability).toMatchObject({ semantic: true, added: 2, modified: 1, removed: 0 });
  expect(objective).toMatchObject({ semantic: true, added: 3, modified: 2, removed: 0 });
  expect(objective!.messageHtml).toContain("<strong>Head of Business Development</strong>");
  expect(style).toMatchObject({ semantic: false, added: 0, modified: 0, removed: 0 });
  expect(opportunity).toMatchObject({ semantic: true, added: 2, modified: 2 });
  expect(evidence).toMatchObject({ semantic: true, added: 2, modified: 0 });
  expect(initial!.semantic).toBe(true);
  expect(entries.every((entry) => entry.error === undefined)).toBe(true);
}

test.describe("biz42 serve — history API", () => {
  test("serves the pearl index and lazily computed chunks as JSONL", async () => {
    const root = createStoryRepository();
    const server = await startServer(root, 3394);
    try {
      const index = await fetch(`${server.url}/api/history/index.jsonl`);
      expect(index.status).toBe(200);
      expect(index.headers.get("content-type")).toContain("application/x-ndjson");
      const pearls = parseJsonLines<Pearl>(await index.text());
      const chunk = await fetch(`${server.url}/api/history/chunk-0.jsonl`);
      expect(chunk.status).toBe(200);
      expectHistory(pearls, parseJsonLines<Entry>(await chunk.text()));
      expect((await fetch(`${server.url}/api/history/chunk-7.jsonl`)).status).toBe(404);
    } finally {
      await server.stop();
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("serves a commit's tree and its documents, never other files", async () => {
    const root = createStoryRepository();
    writeFileSync(join(root, "secret.txt"), "not part of the business model\n");
    git(root, "add", "secret.txt");
    git(root, "commit", "-qm", "chore: add a secret");
    const secret = git(root, "rev-parse", "HEAD:secret.txt").trim();
    const server = await startServer(root, 3397);
    try {
      const pearls = parseJsonLines<Pearl>(
        await (await fetch(`${server.url}/api/history/index.jsonl`)).text(),
      );
      const initial = pearls.find((pearl) => pearl.subject === SUBJECTS[6])!.commit!;
      const tree = (await (
        await fetch(`${server.url}/api/history/tree/${initial}.json`)
      ).json()) as Tree;
      expect(Object.keys(tree.files)).toHaveLength(13);
      expect(tree.files[OPPORTUNITIES]).toBe(
        git(root, "rev-parse", `${initial}:${OPPORTUNITIES}`).trim(),
      );
      const blob = await fetch(`${server.url}/api/history/blob/${tree.files[OPPORTUNITIES]}`);
      expect(await blob.text()).toBe(git(root, "show", `${initial}:${OPPORTUNITIES}`));

      const other = await fetch(`${server.url}/api/history/blob/${secret}`);
      expect(other.status).toBe(404);
      expect(((await other.json()) as { error: string }).error).toContain(
        "Not a business model document of this history",
      );
      expect((await fetch(`${server.url}/api/history/tree/${"0".repeat(40)}.json`)).status).toBe(
        404,
      );
    } finally {
      await server.stop();
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("follows new commits", async () => {
    const root = createStoryRepository();
    const server = await startServer(root, 3395);
    try {
      git(root, "commit", "-qam", "chore: raise the incumbent response risk");
      const subjects = async () =>
        parseJsonLines<Pearl>(
          await (await fetch(`${server.url}/api/history/index.jsonl`)).text(),
        ).map((pearl) => pearl.subject);
      expect(await subjects()).toEqual([
        "chore: raise the incumbent response risk",
        ...SUBJECTS.slice(1),
      ]);
    } finally {
      await server.stop();
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("explains why there is no history outside a Git repository", async () => {
    const dir = mkdtempSync(join(tmpdir(), "biz42-e2e-history-not-git-"));
    writeFileSync(join(dir, "01-scope.biz42.md"), "# Scope\n\nHello.\n");
    const server = await startServer(dir, 3396);
    try {
      const response = await fetch(`${server.url}/api/history/index.jsonl`);
      expect(response.status).toBe(422);
      expect(((await response.json()) as { error: string }).error).toContain("Git command failed");
    } finally {
      await server.stop();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

test.describe("biz42 build --with-history", () => {
  test("writes the history next to the page and announces it", () => {
    const root = createStoryRepository();
    const out = mkdtempSync(join(tmpdir(), "biz42-e2e-history-site-"));
    try {
      runCli("--dir", root, "build", "--out", out, "--with-history");
      const history = join(out, "history");
      expect(readdirSync(history).sort()).toEqual(["blob", "chunk-0.jsonl", "index.jsonl", "tree"]);
      const pearls = parseJsonLines<Pearl>(readFileSync(join(history, "index.jsonl"), "utf8"));
      expectHistory(
        pearls,
        parseJsonLines<Entry>(readFileSync(join(history, "chunk-0.jsonl"), "utf8")),
      );
      const commits = pearls.flatMap((pearl) => (pearl.commit ? [pearl.commit] : []));
      expect(readdirSync(join(history, "tree")).sort()).toEqual(
        commits.map((commit) => `${commit}.json`).sort(),
      );
      // Each document version once.
      const ids = new Set(
        commits.flatMap((commit) =>
          Object.values(
            (JSON.parse(readFileSync(join(history, "tree", `${commit}.json`), "utf8")) as Tree)
              .files,
          ),
        ),
      );
      expect(readdirSync(join(history, "blob")).sort()).toEqual([...ids].sort());
      expect(readFileSync(join(out, "index.html"), "utf8")).toContain(
        '<script>window.__HISTORY__={"base":"history/"};</script>',
      );
    } finally {
      rmSync(out, { recursive: true, force: true });
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("writes no history without --with-history", () => {
    const root = createStoryRepository();
    const out = mkdtempSync(join(tmpdir(), "biz42-e2e-no-history-site-"));
    try {
      runCli("--dir", root, "build", "--out", out);
      expect(readdirSync(out)).not.toContain("history");
      expect(readFileSync(join(out, "index.html"), "utf8")).not.toContain("__HISTORY__");
    } finally {
      rmSync(out, { recursive: true, force: true });
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("fails outside a Git repository without writing a site", () => {
    const dir = mkdtempSync(join(tmpdir(), "biz42-e2e-history-build-not-git-"));
    const out = join(dir, "site");
    try {
      writeFileSync(join(dir, "01-scope.biz42.md"), "# Scope\n\nHello.\n");
      const result = spawnSync(
        "node",
        [cliPath, "--dir", dir, "build", "--out", out, "--with-history"],
        { encoding: "utf8" },
      );
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("biz42 build --with-history");
      expect(readdirSync(dir)).toEqual(["01-scope.biz42.md"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
