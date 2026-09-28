import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  OPPORTUNITIES,
  RISKS,
  cliPath,
  createDiffRepository,
  expect,
  runCli,
  startDiffServer,
  test,
} from "./diff-fixtures.ts";

// Black-box tests of `biz42 diff`, `biz42 serve --diff` and `biz42 build --diff` (built CLI).

interface Segment {
  status: string;
  section: { headingPath: string[] };
  elements: Array<{ id: string; status: string }>;
}
interface Payload {
  base: { label: string; commit: string };
  head: { label: string };
  findings: Array<{ kind: string; elementId?: string }>;
  view: { documents: Array<{ file: string; segments: Segment[] }> };
}

function segmentsOf(payload: Payload, file: string): Array<[string | undefined, string]> {
  const document = payload.view.documents.find((candidate) => candidate.file === file);
  return (document?.segments ?? []).map((segment) => [
    segment.section.headingPath[segment.section.headingPath.length - 1],
    segment.status,
  ]);
}

const OPPORTUNITY_SEGMENTS = [
  ["Compliance differentiator vs US-hosted competitors", "removed"],
  ["Word-of-mouth from early adopter teams", "modified"],
  ["Partner channel via system integrators", "added"],
];

test.describe("biz42 diff", () => {
  test("reports consistency findings and how to accept them", ({ diffRepository }) => {
    const result = spawnSync("node", [cliPath, "--dir", diffRepository, "diff"], {
      encoding: "utf8",
    });
    expect(result.status).toBe(1);
    expect(result.stdout.trim().split("\n")).toEqual([
      `warning ${RISKS}:10  Block 'risk-commoditisation' changed without changing its section prose.`,
      `warning ${OPPORTUNITIES}:36  Section prose changed without changing block 'opp-word-of-mouth'.`,
    ]);
    const head = spawnSync("git", ["-C", diffRepository, "rev-parse", "HEAD"], {
      encoding: "utf8",
    }).stdout.trim();
    expect(result.stderr).toContain(`BIZ42_CONSISTENT=${head}`);

    const accepted = spawnSync("node", [cliPath, "--dir", diffRepository, "diff"], {
      encoding: "utf8",
      env: { ...process.env, BIZ42_CONSISTENT: head },
    });
    expect(accepted.status).toBe(0);
    expect(accepted.stdout).toContain("info These changes were accepted as intentional");
  });

  test("prints the semantic change set as JSON", ({ diffRepository }) => {
    const result = spawnSync(
      "node",
      [cliPath, "--dir", diffRepository, "diff", "--format", "json"],
      { encoding: "utf8" },
    );
    const json = JSON.parse(result.stdout) as {
      model: { elements: Array<{ id: string; status: string }> };
    };
    expect(json.model.elements.map((change) => [change.id, change.status])).toEqual([
      ["risk-commoditisation", "modified"],
      ["opp-compliance-differentiator", "removed"],
      ["opp-word-of-mouth", "unchanged"],
      ["opp-partner-channel", "added"],
    ]);
  });

  test("warns about documents Git does not track yet", () => {
    const root = createDiffRepository();
    try {
      writeFileSync(join(root, "14-partners.biz42.md"), "# Partners\n\nNot added yet.\n");
      const result = spawnSync("node", [cliPath, "--dir", root, "diff"], { encoding: "utf8" });
      expect(result.stderr).toContain(
        "warning 14-partners.biz42.md  untracked — not part of the comparison until you git add it",
      );
      const staged = spawnSync("node", [cliPath, "--dir", root, "diff", "--staged"], {
        encoding: "utf8",
      });
      expect(staged.stderr).not.toContain("untracked");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("shows help", () => {
    expect(runCli("diff", "--help")).toContain("biz42 diff — report business model changes");
  });
});

test.describe("biz42 serve --diff", () => {
  test("serves the difference between the index and the working tree", async ({ request }) => {
    const response = await request.get("/api/diff");
    expect(response.status()).toBe(200);
    const payload = (await response.json()) as Payload;

    expect(payload.base.label).toBe("index");
    expect(payload.head.label).toBe("working tree");
    expect(payload.findings.map((finding) => finding.elementId)).toEqual([
      "risk-commoditisation",
      "opp-word-of-mouth",
    ]);
    expect(payload.view.documents.map((document) => document.file)).toEqual([RISKS, OPPORTUNITIES]);
    expect(segmentsOf(payload, OPPORTUNITIES)).toEqual(OPPORTUNITY_SEGMENTS);
  });

  test("serves the head snapshot as the workspace", async ({ request }) => {
    const workspace = (await (await request.get("/api/workspace")).json()) as {
      elements: Array<{ id: string }>;
    };
    const ids = workspace.elements.map((element) => element.id);
    expect(ids).toContain("opp-partner-channel");
    expect(ids).not.toContain("opp-compliance-differentiator");
  });

  test("follows the working tree and the index", async () => {
    const root = createDiffRepository();
    const server = await startDiffServer(root, 3390);
    try {
      const diff = async () => (await fetch(`${server.url}/api/diff`)).json() as Promise<Payload>;
      expect((await diff()).view.documents).toHaveLength(2);
      // Staging everything makes the index equal to the working tree.
      spawnSync("git", ["-C", root, "add", "-A"]);
      await expect.poll(async () => (await diff()).view.documents, { timeout: 10000 }).toEqual([]);
    } finally {
      await server.stop();
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("fails outside a Git repository", () => {
    const dir = mkdtempSync(join(tmpdir(), "biz42-e2e-not-git-"));
    try {
      writeFileSync(join(dir, "01-scope.biz42.md"), "# Scope\n\nHello.\n");
      const result = spawnSync(
        "node",
        [cliPath, "--dir", dir, "serve", "--diff", "--port", "3391"],
        { encoding: "utf8", timeout: 15000 },
      );
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Git command failed");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

test.describe("biz42 build --diff", () => {
  test("injects the difference and escapes script terminators", ({ diffRepository }) => {
    const out = mkdtempSync(join(tmpdir(), "biz42-e2e-build-diff-"));
    try {
      runCli("--dir", diffRepository, "build", "--out", out, "--diff");
      const html = readFileSync(join(out, "index.html"), "utf8");
      const diffScript = /<script>window\.__DIFF__=(.*?);<\/script>/s.exec(html);
      expect(diffScript).not.toBeNull();
      const payload = JSON.parse(diffScript![1]!) as Payload;
      expect(payload.head.label).toBe("working tree");
      expect(segmentsOf(payload, OPPORTUNITIES)).toEqual(OPPORTUNITY_SEGMENTS);
      // The new prose contains a literal "</script>"; it must stay inside the JSON.
      expect(JSON.stringify(payload)).toContain("</script>");
      // String.replace patterns such as "$&" in the data must arrive verbatim.
      expect(JSON.stringify(payload)).toContain("`$&` patterns");
      expect(html).toContain("\\u003c/script>");
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });

  test("rejects a reference without --diff", ({ diffRepository }) => {
    const out = mkdtempSync(join(tmpdir(), "biz42-e2e-build-usage-"));
    try {
      const result = spawnSync(
        "node",
        [cliPath, "--dir", diffRepository, "build", "--out", out, "HEAD"],
        { encoding: "utf8" },
      );
      expect(result.status).toBe(2);
      expect(result.stderr).toContain("require --diff");
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });
});
