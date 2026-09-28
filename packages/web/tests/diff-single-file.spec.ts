import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { OPPORTUNITIES, expect, runCli, test, type Page } from "./diff-fixtures.ts";

// Black-box tests of `biz42 build --single-file`: one HTML file, opened from disk.

function build(root: string, ...args: string[]): string {
  const out = mkdtempSync(join(tmpdir(), "biz42-e2e-single-file-"));
  runCli("--dir", root, "build", "--out", out, "--single-file", ...args);
  return out;
}

/** Open the page from disk and record every request that is not the page itself. */
async function openFromDisk(page: Page, out: string, hash = ""): Promise<string[]> {
  const pageUrl = pathToFileURL(join(out, "index.html")).href;
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().split("#")[0] !== pageUrl) requests.push(request.url());
  });
  await page.goto(`${pageUrl}${hash}`);
  return requests;
}

test.describe("biz42 build --single-file", () => {
  test("writes one self-contained page that renders the workspace", async ({
    page,
    diffRepository,
  }) => {
    const out = build(diffRepository);
    try {
      expect(readdirSync(out)).toEqual(["index.html"]);
      const html = readFileSync(join(out, "index.html"), "utf8");
      expect(html).not.toMatch(/src="\/assets\/|href="\/assets\//);
      // Browsers honour the charset only within the first 1024 bytes; a page opened
      // from disk has no charset header to fall back on.
      const charset = Buffer.from(html).indexOf('<meta charset="UTF-8"');
      expect(charset).toBeGreaterThanOrEqual(0);
      expect(charset).toBeLessThan(1024);

      const requests = await openFromDisk(page, out);
      await expect(page.getByRole("heading", { level: 1, name: "Scope" })).toBeVisible();
      expect(requests).toEqual([]);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });

  test("includes a difference", async ({ page, diffRepository }) => {
    const out = build(diffRepository, "--diff");
    try {
      await openFromDisk(page, out);
      await expect(page.getByTestId("changes-view")).toBeVisible();
      await expect(page.getByTestId("diff-index-item")).toHaveCount(4);
      await openFromDisk(page, out, `#${OPPORTUNITIES}`);
      await expect(page.getByTestId("chapter-diff")).toBeVisible();
      await expect(page.getByTestId("diff-segment")).toHaveCount(3);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });
});
