// Black-box tests: real Git repositories, public package API only.
import { afterEach, describe, expect, test } from "vite-plus/test";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { diffWorkspaces } from "@biz42/core";
import { EMPTY_TREE, loadDiffPayload, loadDiffSnapshots } from "../src/index.ts";

const createdDirs: string[] = [];

function git(root: string, ...args: string[]): string {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
}

function write(root: string, path: string, content: string) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), content);
}

function commit(root: string, message: string): string {
  git(root, "add", "-A");
  git(root, "commit", "-qm", message);
  return git(root, "rev-parse", "HEAD").trim();
}

function repository(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "biz42-diff-snapshots-"));
  createdDirs.push(root);
  git(root, "init", "-q");
  git(root, "config", "user.email", "test@example.com");
  git(root, "config", "user.name", "biz42 test");
  for (const [path, content] of Object.entries(files)) write(root, path, content);
  commit(root, "initial");
  return root;
}

function risks(prose: string, severity = "high"): string {
  return `# Risks\n\n## Churn\n\n${prose}\n\n\`\`\`biz42\n:::risk\nid: churn\ntitle: Churn\nseverity: ${severity}\n:::\n\`\`\`\n`;
}

const FILE = "business/04-risks.biz42.md";

function churnSeverity(payload: { elements: Array<{ id: string }> }): unknown {
  return (payload.elements.find((element) => element.id === "churn") as { severity?: string })
    ?.severity;
}

afterEach(() => {
  for (const dir of createdDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("loadDiffSnapshots — comparison scopes", () => {
  test("compares the working tree with the index by default", async () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    write(root, FILE, risks("Customers may leave.", "low"));
    git(root, "add", FILE);
    write(root, FILE, risks("Customers are leaving.", "low"));

    const snapshots = await loadDiffSnapshots(join(root, "business"));
    expect(snapshots.base.label).toBe("index");
    expect(snapshots.head.label).toBe("working tree");
    expect(churnSeverity(snapshots.base.payload)).toBe("low");
    expect(snapshots.acceptanceBase).toBeUndefined();

    const diff = diffWorkspaces(snapshots.base.payload, snapshots.head.payload);
    expect(diff.elements).toMatchObject([{ id: "churn", status: "unchanged", proseChanged: true }]);
  });

  test("compares the index with HEAD when staged, ignoring the working tree", async () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    const head = git(root, "rev-parse", "HEAD").trim();
    write(root, FILE, risks("Customers may leave.", "low"));
    git(root, "add", FILE);
    write(root, FILE, risks("Unstaged prose.", "medium"));

    const snapshots = await loadDiffSnapshots(root, { staged: true });
    expect(snapshots.base.label).toBe(head);
    expect(snapshots.head.label).toBe("index");
    expect(snapshots.acceptanceBase).toBe(head);
    const diff = diffWorkspaces(snapshots.base.payload, snapshots.head.payload);
    expect(diff.elements).toMatchObject([
      {
        id: "churn",
        status: "modified",
        proseChanged: false,
        attributes: [{ name: "severity", before: "high", after: "low" }],
      },
    ]);
  });

  test("compares a reference with the working tree", async () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    const first = git(root, "rev-parse", "HEAD").trim();
    write(root, FILE, risks("Customers may leave.", "low"));
    commit(root, "lower the severity");
    write(root, FILE, risks("Customers may leave.", "medium"));

    const snapshots = await loadDiffSnapshots(root, { reference: first });
    expect(snapshots.base.label).toBe(first);
    expect(churnSeverity(snapshots.base.payload)).toBe("high");
    expect(churnSeverity(snapshots.head.payload)).toBe("medium");
  });

  test("compares two commits and the merge base of a symmetric range", async () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    const main = git(root, "rev-parse", "--abbrev-ref", "HEAD").trim();
    const forkPoint = git(root, "rev-parse", "HEAD").trim();
    git(root, "checkout", "-qb", "feature");
    write(root, FILE, risks("Customers may leave.", "low"));
    const feature = commit(root, "feature change");
    git(root, "checkout", "-q", main);
    write(root, "business/01-scope.biz42.md", "# Scope\n\nSells software.\n");
    commit(root, "unrelated main change");

    const twoDot = await loadDiffSnapshots(root, { reference: `${main}..feature` });
    expect(twoDot.head.label).toBe(feature);
    const twoDotDiff = diffWorkspaces(twoDot.base.payload, twoDot.head.payload);
    expect(twoDotDiff.proseSections).toMatchObject([{ status: "removed" }]);

    const threeDot = await loadDiffSnapshots(root, { reference: `${main}...feature` });
    expect(threeDot.baseCommit).toBe(forkPoint);
    const threeDotDiff = diffWorkspaces(threeDot.base.payload, threeDot.head.payload);
    expect(threeDotDiff.proseSections).toEqual([]);
    expect(threeDotDiff.elements).toMatchObject([{ id: "churn", status: "modified" }]);
  });
});

describe("loadDiffSnapshots — single commit", () => {
  test("compares a commit with its first parent", async () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    const first = git(root, "rev-parse", "HEAD").trim();
    write(root, FILE, risks("Customers may leave.", "low"));
    const second = commit(root, "lower");
    write(root, FILE, risks("Customers may leave.", "medium"));
    commit(root, "raise");

    const snapshots = await loadDiffSnapshots(root, { commit: second });
    expect(snapshots.base.label).toBe(first);
    expect(snapshots.head.label).toBe(second);
    expect(churnSeverity(snapshots.base.payload)).toBe("high");
    expect(churnSeverity(snapshots.head.payload)).toBe("low");
  });

  test("compares a root commit with the empty tree", async () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    const snapshots = await loadDiffSnapshots(root, { commit: "HEAD" });
    expect(snapshots.base.label).toBe("empty");
    expect(snapshots.baseCommit).toBe(EMPTY_TREE);
    expect(snapshots.acceptanceBase).toBeUndefined();
    expect(snapshots.base.payload.documents).toEqual([]);
    expect(diffWorkspaces(snapshots.base.payload, snapshots.head.payload).elements).toMatchObject([
      { id: "churn", status: "added" },
    ]);
  });

  test("refuses the boundary commit of a shallow clone", async () => {
    const origin = repository({ [FILE]: risks("Customers may leave.") });
    write(origin, FILE, risks("Customers may leave.", "low"));
    commit(origin, "lower");
    const clone = mkdtempSync(join(tmpdir(), "biz42-diff-snapshots-shallow-"));
    createdDirs.push(clone);
    execFileSync("git", ["clone", "-q", "--depth", "1", `file://${origin}`, clone]);
    await expect(loadDiffSnapshots(clone, { commit: "HEAD" })).rejects.toThrow(
      /not available in this shallow clone/,
    );
  });

  test("reads business documents larger than a mebibyte", async () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    const longProse = `${"Customers may leave. ".repeat(40)}\n\n`.repeat(1500);
    write(root, FILE, risks(longProse));
    const large = commit(root, "long prose");
    const snapshots = await loadDiffSnapshots(root, { commit: large });
    expect(diffWorkspaces(snapshots.base.payload, snapshots.head.payload).elements).toMatchObject([
      { id: "churn", status: "unchanged", proseChanged: true },
    ]);
  });

  test("rejects a commit combined with a reference", async () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    await expect(loadDiffSnapshots(root, { commit: "HEAD", reference: "HEAD" })).rejects.toThrow(
      /single commit cannot be combined/,
    );
  });
});

describe("loadDiffSnapshots — workspace content", () => {
  test("limits documents to the workspace directory and uses repository-relative paths", async () => {
    const root = repository({
      [FILE]: risks("Customers may leave."),
      "other/01-scope.biz42.md": "# Scope\n\nElsewhere.\n",
      "README.md": "# Readme\n",
    });
    const snapshots = await loadDiffSnapshots(join(root, "business"));
    expect(snapshots.head.payload.documents.map((document) => document.filePath)).toEqual([FILE]);
    expect(snapshots.root).toBe(git(root, "rev-parse", "--show-toplevel").trim());
  });

  test("treats a document deleted from the working tree as removed", async () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    unlinkSync(join(root, FILE));

    const snapshots = await loadDiffSnapshots(root);
    expect(snapshots.head.payload.documents).toEqual([]);
    expect(diffWorkspaces(snapshots.base.payload, snapshots.head.payload).elements).toMatchObject([
      { id: "churn", status: "removed", proseChanged: true },
    ]);
  });
});

describe("loadDiffSnapshots — untracked documents", () => {
  test("lists documents Git does not track yet when the head is the working tree", async () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    write(root, "business/05-opportunities.biz42.md", "# Opportunities\n");
    write(root, "business/notes.md", "# Notes\n");
    write(root, "elsewhere/01-scope.biz42.md", "# Scope\n");

    const snapshots = await loadDiffSnapshots(join(root, "business"));
    expect(snapshots.untracked).toEqual(["business/05-opportunities.biz42.md"]);
    expect(snapshots.head.payload.documents.map((document) => document.filePath)).toEqual([FILE]);
    expect((await loadDiffPayload(join(root, "business"), {})).payload.untracked).toEqual([
      "business/05-opportunities.biz42.md",
    ]);
  });

  test("leaves them out when the head is the index or a commit", async () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    write(root, "business/05-opportunities.biz42.md", "# Opportunities\n");
    expect((await loadDiffSnapshots(root, { staged: true })).untracked).toEqual([]);
    expect((await loadDiffSnapshots(root, { reference: "HEAD..HEAD" })).untracked).toEqual([]);
    expect((await loadDiffPayload(root, { staged: true })).payload.untracked).toBeUndefined();
  });
});

describe("loadDiffPayload", () => {
  test("lints the change and builds its render-ready view", async () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    write(root, FILE, risks("Customers may leave.", "low"));

    const { payload, result } = await loadDiffPayload(root, {});
    expect(result.hasBlockingFindings).toBe(true);
    expect(payload.base).toEqual({ label: "index", commit: git(root, "rev-parse", "HEAD").trim() });
    expect(payload.head).toEqual({ label: "working tree" });
    expect(payload.findings).toMatchObject([
      { kind: "block-without-prose-change", elementId: "churn", file: FILE },
    ]);
    expect(payload.view.documents).toMatchObject([
      { file: FILE, title: "Risks", modified: 1, segments: [{ status: "modified" }] },
    ]);
  });
});

describe("loadDiffSnapshots — failures are raised", () => {
  test("outside a Git repository", async () => {
    const dir = mkdtempSync(join(tmpdir(), "biz42-not-git-"));
    createdDirs.push(dir);
    await expect(loadDiffSnapshots(dir)).rejects.toThrow(/Git command failed/);
  });

  test("for an unknown reference", async () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    await expect(loadDiffSnapshots(root, { reference: "does-not-exist" })).rejects.toThrow(
      /Git command failed: git rev-parse --verify does-not-exist\^\{commit\}/,
    );
  });

  test("for a range combined with staged", async () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    await expect(
      loadDiffSnapshots(root, { reference: "HEAD..HEAD", staged: true }),
    ).rejects.toThrow(/cannot be combined with --staged/);
  });
});
