import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  createStoryRepository,
  expect,
  runCli,
  serveStatic,
  startServer,
  test,
  type Page,
} from "./diff-fixtures.ts";

// Black-box UI tests of the business model history (pearl chain) in serve and build.

const SUBJECTS = [
  "Uncommitted changes",
  "capability: multi-tenant operations",
  "objective: win three operator pilots",
  "style: rewrap the signals chapter",
  "opportunity: offer ACME to peer operators",
  "evidence: peer operators ask for our alerting",
  "docs: ACME Emergency business model",
];

function pearl(page: Page, subject: string) {
  return page.getByTestId("history-pearl").filter({ hasText: subject });
}

async function expectPearlChain(page: Page) {
  const pearls = page.getByTestId("history-pearl");
  await expect(pearls).toHaveCount(SUBJECTS.length);
  for (const [index, subject] of SUBJECTS.entries()) {
    await expect(pearls.nth(index)).toContainText(subject);
  }
  await expect(pearl(page, SUBJECTS[2]!)).toHaveAttribute("data-state", "semantic");
  await expect(pearl(page, SUBJECTS[3]!)).toHaveAttribute("data-state", "empty");
  await expect(pearl(page, SUBJECTS[3]!)).toContainText("no model change");
}

/** Open the objective commit: its message, its change, and links within it. */
async function expectObjectiveCommit(page: Page) {
  await pearl(page, SUBJECTS[2]!).getByTestId("pearl-select").click();
  await expect(page).toHaveURL(/#history:[0-9a-f]{40}$/);
  await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(SUBJECTS[2]!);
  const toggle = page.getByTestId("commit-message-toggle");
  await expect(page.getByTestId("commit-message")).toHaveCount(0);
  await toggle.click();
  await expect(page).toHaveURL(/#history:[0-9a-f]{40}:message$/);
  await expect(page.getByTestId("commit-message").locator("strong")).toHaveText([
    "its own objective",
    "Head of Business Development",
  ]);
  await toggle.click();
  await expect(page.getByTestId("commit-message")).toHaveCount(0);
  // Without the full documents, unchanged sections are headings with a skeleton.
  await expect(page.getByTestId("chapter-diff")).toHaveCount(3);
  expect(await page.getByTestId("section-skeleton").count()).toBeGreaterThan(0);
  await page
    .getByTestId("diff-index-item")
    .filter({ hasText: "owner-business-development" })
    .getByRole("link")
    .click();
  await expect(page.locator("#el-owner-business-development")).toBeVisible();
}

/** Browse v1.0 as a whole: the opportunity the plan added does not exist yet. */
async function expectBrowsedRootVersion(page: Page) {
  await pearl(page, SUBJECTS[6]!).getByTestId("pearl-select").click();
  await page.getByTestId("browse-version").click();
  await expect(page).toHaveURL(/\?version=[0-9a-f]{40}$/);
  const banner = page.getByTestId("version-banner");
  await expect(banner).toContainText(SUBJECTS[6]!);
  await page.getByTestId("sidebar-doc-link").filter({ hasText: "Opportunities" }).click();
  await expect(page).toHaveURL(/\?version=[0-9a-f]{40}#05-opportunities\.biz42\.md$/);
  await expect(page.getByRole("heading", { name: "Moving-Asset Alerting" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Offer ACME to Peer Operators" })).toHaveCount(0);
  await expect(banner).toBeVisible();
}

async function expectCurrentVersion(page: Page) {
  await expect(page.getByTestId("version-banner")).toHaveCount(0);
  await page.getByTestId("sidebar-doc-link").filter({ hasText: "Opportunities" }).click();
  await expect(page.getByRole("heading", { name: "Offer ACME to Peer Operators" })).toBeVisible();
}

test.describe("History in biz42 serve", () => {
  let root: string;
  let server: { url: string; stop: () => Promise<void> };
  let port = 3410;

  test.beforeEach(async () => {
    root = createStoryRepository();
    server = await startServer(root, port++);
  });

  test.afterEach(async () => {
    await server.stop();
    rmSync(root, { recursive: true, force: true });
  });

  test("switches the sidebar to the pearl chain and opens the newest pearl", async ({ page }) => {
    await page.goto(`${server.url}/`);
    await page.getByTestId("sidebar-tab-history").click();
    await expectPearlChain(page);
    await expect(page).toHaveURL(/#history:worktree$/);
    await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(SUBJECTS[0]!);
    // The unexplained decision of the plan is flagged.
    await expect(page.getByTestId("diff-finding")).toContainText([
      "Block 'risk-incumbent-response' changed without changing its section prose.",
    ]);
    await expect(page.getByTestId("browse-version")).toHaveCount(0);
  });

  test("shows a commit's message and its change", async ({ page }) => {
    await page.goto(`${server.url}/#history`);
    await expectObjectiveCommit(page);
  });

  test("returns to the documents", async ({ page }) => {
    await page.goto(`${server.url}/#history`);
    await expectPearlChain(page);
    await page.getByTestId("sidebar-tab-documents").click();
    await expect(page.getByTestId("history-chain")).toHaveCount(0);
    await expect(page.getByTestId("sidebar-doc-link")).toHaveCount(13);
  });

  test("browses an earlier version as a whole and returns to the current one", async ({ page }) => {
    await page.goto(`${server.url}/#history`);
    await expectBrowsedRootVersion(page);
    await page.getByTestId("version-leave").click();
    await expect(page).toHaveURL(new RegExp(`^${server.url}/$`));
    await expectCurrentVersion(page);
  });
});

test.describe("History in biz42 build --with-history", () => {
  test("loads the pearl chain and versions from the files next to the page", async ({ page }) => {
    const root = createStoryRepository();
    const out = mkdtempSync(join(tmpdir(), "biz42-e2e-history-site-"));
    runCli("--dir", root, "build", "--out", out, "--with-history");
    const site = await serveStatic(out, 3420);
    try {
      await page.goto(`${site.url}/#history`);
      await expectPearlChain(page);
      await expectObjectiveCommit(page);
      await expectBrowsedRootVersion(page);
    } finally {
      await site.stop();
      rmSync(out, { recursive: true, force: true });
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("browses an earlier version from a single file", async ({ page }) => {
    const root = createStoryRepository();
    const out = mkdtempSync(join(tmpdir(), "biz42-e2e-history-single-"));
    runCli("--dir", root, "build", "--out", out, "--with-history", "--single-file");
    try {
      await page.goto(`${pathToFileURL(join(out, "index.html")).href}#history`);
      await expectPearlChain(page);
      await expectBrowsedRootVersion(page);
    } finally {
      rmSync(out, { recursive: true, force: true });
      rmSync(root, { recursive: true, force: true });
    }
  });
});
