import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createCommittedDiffRepository, expect, test } from "./diff-fixtures.ts";

// Black-box tests of scripts/business-review.ts, the core of the pull request workflow.

const script = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../scripts/business-review.ts",
);

function review(root: string, base: string, out: string, env: Record<string, string> = {}) {
  return spawnSync(
    process.execPath,
    ["--experimental-strip-types", "--no-warnings", script, "--base", base, "--out", out, "."],
    { cwd: root, encoding: "utf8", env: { ...process.env, ...env } },
  );
}

test.describe("business model review script", () => {
  let root: string;
  let out: string;

  test.beforeEach(() => {
    root = createCommittedDiffRepository();
    out = mkdtempSync(join(tmpdir(), "biz42-e2e-review-"));
  });

  test.afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  });

  test("renders a review page and a comment for a business model change", async ({ page }) => {
    const githubOutput = join(out, "github-output");
    writeFileSync(githubOutput, "");
    const result = review(root, "HEAD~1", out, { GITHUB_OUTPUT: githubOutput });
    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(githubOutput, "utf8")).toBe('changed=true\npages=["workspace.html"]\n');

    const summary = JSON.parse(readFileSync(join(out, "result.json"), "utf8")) as {
      changed: boolean;
      reviews: Array<{ workspace: string; changed: boolean; warnings: number; page?: string }>;
    };
    expect(summary.changed).toBe(true);
    expect(summary.reviews).toMatchObject([
      { workspace: ".", changed: true, warnings: 2, page: "workspace.html" },
    ]);

    const comment = readFileSync(join(out, "summary.md"), "utf8");
    expect(comment.startsWith("<!-- biz42-business-model-review -->\n")).toBe(true);
    expect(comment).toContain(
      "**[Open the business model review of `.`]({{PAGE_URL:workspace.html}})**",
    );
    expect(comment).toContain("| `.` | 1 | 2 | 1 | 2 |");
    expect(comment).toContain("All review pages as a zip: [download]({{ARTIFACT_URL}})");
    expect(comment).toContain(
      "- `risk-commoditisation` (risk) — modified — severity: `high` → `medium`",
    );
    expect(comment).toContain("- `opp-compliance-differentiator` (opportunity) — removed");
    expect(comment).toContain(
      "- Block 'risk-commoditisation' changed without changing its section prose. (`04-risks.biz42.md:10`)",
    );

    // The review page is self-contained: open it from disk.
    await page.goto(pathToFileURL(join(out, "workspace.html")).href);
    await expect(page.getByTestId("changes-view")).toBeVisible();
    await expect(page.getByTestId("diff-index-item")).toHaveCount(4);
  });

  test("reports no change without a review page", () => {
    const githubOutput = join(out, "github-output");
    writeFileSync(githubOutput, "");
    const result = review(root, "HEAD", out, { GITHUB_OUTPUT: githubOutput });
    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(githubOutput, "utf8")).toBe("changed=false\npages=[]\n");
    expect(readFileSync(join(out, "summary.md"), "utf8")).toBe(
      "<!-- biz42-business-model-review -->\n### Business model review\n\nNo business model changes compared with `HEAD`.\n",
    );
    expect(existsSync(join(out, "workspace.html"))).toBe(false);
  });

  test("fails when the change cannot be computed", () => {
    const result = review(root, "no-such-branch", out);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("biz42 diff failed for .");
  });
});
