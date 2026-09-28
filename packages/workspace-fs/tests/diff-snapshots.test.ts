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
  test("compares the working tree with the index by default", () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    write(root, FILE, risks("Customers may leave.", "low"));
    git(root, "add", FILE);
    write(root, FILE, risks("Customers are leaving.", "low"));

    const snapshots = loadDiffSnapshots(join(root, "business"));
    expect(snapshots.base.label).toBe("index");
    expect(snapshots.head.label).toBe("working tree");
    expect(churnSeverity(snapshots.base.payload)).toBe("low");
    expect(snapshots.acceptanceBase).toBeUndefined();

    const diff = diffWorkspaces(snapshots.base.payload, snapshots.head.payload);
    expect(diff.elements).toMatchObject([{ id: "churn", status: "unchanged", proseChanged: true }]);
  });

  test("compares the index with HEAD when staged, ignoring the working tree", () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    const head = git(root, "rev-parse", "HEAD").trim();
    write(root, FILE, risks("Customers may leave.", "low"));
    git(root, "add", FILE);
    write(root, FILE, risks("Unstaged prose.", "medium"));

    const snapshots = loadDiffSnapshots(root, { staged: true });
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

  test("compares a reference with the working tree", () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    const first = git(root, "rev-parse", "HEAD").trim();
    write(root, FILE, risks("Customers may leave.", "low"));
    commit(root, "lower the severity");
    write(root, FILE, risks("Customers may leave.", "medium"));

    const snapshots = loadDiffSnapshots(root, { reference: first });
    expect(snapshots.base.label).toBe(first);
    expect(churnSeverity(snapshots.base.payload)).toBe("high");
    expect(churnSeverity(snapshots.head.payload)).toBe("medium");
  });

  test("compares two commits and the merge base of a symmetric range", () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    const main = git(root, "rev-parse", "--abbrev-ref", "HEAD").trim();
    const forkPoint = git(root, "rev-parse", "HEAD").trim();
    git(root, "checkout", "-qb", "feature");
    write(root, FILE, risks("Customers may leave.", "low"));
    const feature = commit(root, "feature change");
    git(root, "checkout", "-q", main);
    write(root, "business/01-scope.biz42.md", "# Scope\n\nSells software.\n");
    commit(root, "unrelated main change");

    const twoDot = loadDiffSnapshots(root, { reference: `${main}..feature` });
    expect(twoDot.head.label).toBe(feature);
    const twoDotDiff = diffWorkspaces(twoDot.base.payload, twoDot.head.payload);
    expect(twoDotDiff.proseSections).toMatchObject([{ status: "removed" }]);

    const threeDot = loadDiffSnapshots(root, { reference: `${main}...feature` });
    expect(threeDot.baseCommit).toBe(forkPoint);
    const threeDotDiff = diffWorkspaces(threeDot.base.payload, threeDot.head.payload);
    expect(threeDotDiff.proseSections).toEqual([]);
    expect(threeDotDiff.elements).toMatchObject([{ id: "churn", status: "modified" }]);
  });
});

describe("loadDiffSnapshots — single commit", () => {
  test("compares a commit with its first parent", () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    const first = git(root, "rev-parse", "HEAD").trim();
    write(root, FILE, risks("Customers may leave.", "low"));
    const second = commit(root, "lower");
    write(root, FILE, risks("Customers may leave.", "medium"));
    commit(root, "raise");

    const snapshots = loadDiffSnapshots(root, { commit: second });
    expect(snapshots.base.label).toBe(first);
    expect(snapshots.head.label).toBe(second);
    expect(churnSeverity(snapshots.base.payload)).toBe("high");
    expect(churnSeverity(snapshots.head.payload)).toBe("low");
  });

  test("compares a root commit with the empty tree", () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    const snapshots = loadDiffSnapshots(root, { commit: "HEAD" });
    expect(snapshots.base.label).toBe("empty");
    expect(snapshots.baseCommit).toBe(EMPTY_TREE);
    expect(snapshots.acceptanceBase).toBeUndefined();
    expect(snapshots.base.payload.documents).toEqual([]);
    expect(diffWorkspaces(snapshots.base.payload, snapshots.head.payload).elements).toMatchObject([
      { id: "churn", status: "added" },
    ]);
  });

  test("refuses the boundary commit of a shallow clone", () => {
    const origin = repository({ [FILE]: risks("Customers may leave.") });
    write(origin, FILE, risks("Customers may leave.", "low"));
    commit(origin, "lower");
    const clone = mkdtempSync(join(tmpdir(), "biz42-diff-snapshots-shallow-"));
    createdDirs.push(clone);
    execFileSync("git", ["clone", "-q", "--depth", "1", `file://${origin}`, clone]);
    expect(() => loadDiffSnapshots(clone, { commit: "HEAD" })).toThrow(
      /not available in this shallow clone/,
    );
  });

  test("reads business documents larger than a mebibyte", () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    const longProse = `${"Customers may leave. ".repeat(40)}\n\n`.repeat(1500);
    write(root, FILE, risks(longProse));
    const large = commit(root, "long prose");
    const snapshots = loadDiffSnapshots(root, { commit: large });
    expect(diffWorkspaces(snapshots.base.payload, snapshots.head.payload).elements).toMatchObject([
      { id: "churn", status: "unchanged", proseChanged: true },
    ]);
  });

  test("rejects a commit combined with a reference", () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    expect(() => loadDiffSnapshots(root, { commit: "HEAD", reference: "HEAD" })).toThrow(
      /single commit cannot be combined/,
    );
  });
});

describe("loadDiffSnapshots — workspace content", () => {
  test("limits documents to the workspace directory and uses repository-relative paths", () => {
    const root = repository({
      [FILE]: risks("Customers may leave."),
      "other/01-scope.biz42.md": "# Scope\n\nElsewhere.\n",
      "README.md": "# Readme\n",
    });
    const snapshots = loadDiffSnapshots(join(root, "business"));
    expect(snapshots.head.payload.documents.map((document) => document.filePath)).toEqual([FILE]);
    expect(snapshots.root).toBe(git(root, "rev-parse", "--show-toplevel").trim());
  });

  test("treats a document deleted from the working tree as removed", () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    unlinkSync(join(root, FILE));

    const snapshots = loadDiffSnapshots(root);
    expect(snapshots.head.payload.documents).toEqual([]);
    expect(diffWorkspaces(snapshots.base.payload, snapshots.head.payload).elements).toMatchObject([
      { id: "churn", status: "removed", proseChanged: true },
    ]);
  });
});

describe("loadDiffPayload", () => {
  test("lints the change and builds its render-ready view", () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    write(root, FILE, risks("Customers may leave.", "low"));

    const { payload, result } = loadDiffPayload(root, {});
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
  test("outside a Git repository", () => {
    const dir = mkdtempSync(join(tmpdir(), "biz42-not-git-"));
    createdDirs.push(dir);
    expect(() => loadDiffSnapshots(dir)).toThrow(/Git command failed/);
  });

  test("for an unknown reference", () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    expect(() => loadDiffSnapshots(root, { reference: "does-not-exist" })).toThrow(
      /Git command failed: git rev-parse --verify does-not-exist\^\{commit\}/,
    );
  });

  test("for a range combined with staged", () => {
    const root = repository({ [FILE]: risks("Customers may leave.") });
    expect(() => loadDiffSnapshots(root, { reference: "HEAD..HEAD", staged: true })).toThrow(
      /cannot be combined with --staged/,
    );
  });
});
