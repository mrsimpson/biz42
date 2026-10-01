import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  OPPORTUNITIES,
  createDiffRepository,
  expect,
  runCli,
  serveStatic,
  startDiffServer,
  test,
  type Page,
} from "./diff-fixtures.ts";

// Black-box UI tests of the business model diff view (serve --diff / build --diff).

function segment(page: Page, name: string) {
  return page.getByRole("region", { name });
}

test.describe("Changes summary", () => {
  test("opens by default and summarizes the difference", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/#changes$/);
    await expect(page.getByTestId("changes-view")).toBeVisible();
    await expect(page.getByTestId("changes-range").locator("code")).toHaveText([
      "index",
      "working tree",
    ]);
    await expect(page.getByTestId("sidebar-changes-link")).toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("sidebar-changes-link")).toContainText("+1~2−1");
  });

  test("lists warnings that link to their element in the chapter", async ({ page }) => {
    await page.goto("/#changes");
    const findings = page.getByTestId("diff-finding");
    await expect(findings).toHaveCount(2);
    await findings.filter({ hasText: "risk-commoditisation" }).getByRole("link").click();
    await expect(page).toHaveURL(/#04-risks\.biz42\.md:el-risk-commoditisation$/);
    await expect(page.locator("#el-risk-commoditisation")).toBeVisible();
  });

  test("indexes the changed chapters and elements", async ({ page }) => {
    await page.goto("/#changes");
    const documents = page.getByTestId("diff-index-document");
    await expect(documents).toHaveCount(2);
    await expect(documents.nth(1).getByTestId("diff-index-item")).toHaveText([
      "opp-compliance-differentiator",
      "opp-word-of-mouth",
      "opp-partner-channel",
    ]);
    await expect(
      documents.nth(1).locator('[data-testid="diff-index-item"][data-status="added"]'),
    ).toHaveText("opp-partner-channel");
  });
});

test.describe("Changes inline in the chapters", () => {
  test("renders a changed chapter in full with its changes in place", async ({ page }) => {
    await page.goto(`/#${OPPORTUNITIES}`);
    await expect(page.getByTestId("chapter-diff")).toBeVisible();
    await expect(
      segment(page, "removed: Compliance differentiator vs US-hosted competitors"),
    ).toBeVisible();
    await expect(segment(page, "added: Partner channel via system integrators")).toBeVisible();
    // Unchanged sections are rendered as usual, between the changed ones.
    await expect(
      page.getByTestId("unchanged-section").filter({ hasText: "Market timing" }),
    ).toBeVisible();
    await expect(page.getByTestId("doc-change-badge")).toHaveCount(2);
  });

  test("marks changed words and switches between the versions", async ({ page }) => {
    await page.goto(`/#${OPPORTUNITIES}`);
    const changed = segment(page, "modified: Word-of-mouth from early adopter teams");
    await expect(changed.locator("ins")).toHaveText(["far", ", helped by sig-gdpr-pressure"]);
    await changed.getByRole("button", { name: "Previous" }).click();
    await expect(changed.getByTestId("segment-base")).toContainText("was a lower-cost growth path");
    await changed.getByRole("button", { name: "Current" }).click();
    await expect(changed.getByTestId("segment-head")).toContainText("was a far lower-cost");
    await expect(changed.locator("ins")).toHaveCount(0);
  });

  test("shows attribute changes as a before/after table", async ({ page }) => {
    await page.goto("/#04-risks.biz42.md");
    const change = page.getByTestId("attribute-change");
    await expect(change.locator("th")).toHaveText("severity");
    await expect(change.getByTestId("value-removed")).toHaveText("high");
    await expect(change.getByTestId("value-added")).toHaveText("medium");
  });

  test("shows unchanged chapters as usual", async ({ page }) => {
    await page.goto("/#01-scope.biz42.md");
    await expect(page.getByTestId("chapter-diff")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1, name: "Scope" })).toBeVisible();
  });
});

test.describe("Changes view — live updates", () => {
  test("follows edits, reports an empty difference and surfaces errors", async ({ page }) => {
    const root = createDiffRepository();
    const server = await startDiffServer(root, 3392);
    try {
      await page.goto(`${server.url}/`);
      await expect(page.getByTestId("diff-index-item")).toHaveCount(4);

      // A new document is not part of the comparison until Git tracks it.
      writeFileSync(join(root, "14-partners.biz42.md"), "# Partners\n\nNot added yet.\n");
      await expect(page.getByTestId("diff-untracked")).toContainText("14-partners.biz42.md", {
        timeout: 10000,
      });

      spawnSync("git", ["-C", root, "add", "-A"]);
      await expect(page.getByTestId("changes-empty")).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId("diff-untracked")).toHaveCount(0);

      // A duplicate id makes the working tree impossible to diff.
      const opportunities = join(root, OPPORTUNITIES);
      writeFileSync(
        opportunities,
        `${readFileSync(opportunities, "utf8")}\n### Copy\n\nA copy.\n\n\`\`\`biz42\n:::opportunity\nid: opp-market-timing\ntitle: Copy\n:::\n\`\`\`\n`,
      );
      await expect(page.getByTestId("diff-error")).toContainText(
        "Duplicate id 'opp-market-timing'",
        {
          timeout: 10000,
        },
      );
    } finally {
      await server.stop();
      rmSync(root, { recursive: true, force: true });
    }
  });
});

test.describe("Changes view — static build", () => {
  test("renders the difference frozen into build --diff", async ({ page, diffRepository }) => {
    const out = mkdtempSync(join(tmpdir(), "biz42-e2e-diff-site-"));
    runCli("--dir", diffRepository, "build", "--out", out, "--diff");
    const site = await serveStatic(out, 3393);
    try {
      await page.goto(`${site.url}/`);
      await expect(page.getByTestId("changes-view")).toBeVisible();
      await expect(page.getByTestId("diff-index-item")).toHaveCount(4);
      await page.getByTestId("diff-index-document-link").nth(1).click();
      await expect(segment(page, "added: Partner channel via system integrators")).toBeVisible();
    } finally {
      await site.stop();
      rmSync(out, { recursive: true, force: true });
    }
  });
});
