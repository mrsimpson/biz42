import { test, expect, type Page } from "./fixtures.ts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getHash(page: Page): Promise<string> {
  return page.evaluate(() => window.location.hash);
}

// ─── API ──────────────────────────────────────────────────────────────────────

test.describe("API", () => {
  test("GET /api/workspace returns valid workspace JSON", async ({ request }) => {
    const resp = await request.get("/api/workspace");
    expect(resp.ok()).toBe(true);
    const body = await resp.json();
    expect(Array.isArray(body.elements)).toBe(true);
    expect(Array.isArray(body.edges)).toBe(true);
    expect(Array.isArray(body.diagrams)).toBe(true);
    expect(Array.isArray(body.documents)).toBe(true);
    expect(body.documents.length).toBeGreaterThan(0);
    expect(body.elements.length).toBeGreaterThan(0);
  });
});

// ─── Document navigation ──────────────────────────────────────────────────────

test.describe("Document navigation", () => {
  test("loads first document on root URL", async ({ page }) => {
    await page.goto("/");
    // App sets the hash to the first doc on load
    await expect(page.locator("main article, main [class]").first()).toBeVisible();
    // Sidebar shows "biz42" heading
    await expect(page.locator("nav").first()).toBeVisible();
  });

  test("clicking a sidebar button changes the URL hash and renders content", async ({ page }) => {
    await page.goto("/");
    // Wait for sidebar to populate
    const riskBtn = page.locator("nav button").filter({ hasText: "Risks" });
    await expect(riskBtn.first()).toBeVisible({ timeout: 5000 });
    await riskBtn.first().click();

    const hash = await getHash(page);
    expect(hash).toContain("04-risks");
  });

  test("direct navigation via hash renders the correct document", async ({ page }) => {
    await page.goto("/#04-risks.biz42.md");
    // Should stay on that hash
    const hash = await getHash(page);
    expect(hash).toContain("04-risks");
  });

  test("reloading preserves the active document", async ({ page }) => {
    await page.goto("/#06-objectives.biz42.md");
    await page.waitForLoadState("networkidle");
    const hashBefore = await getHash(page);

    await page.reload();
    await page.waitForLoadState("networkidle");
    expect(await getHash(page)).toBe(hashBefore);
  });
});

// ─── Element card ─────────────────────────────────────────────────────────────

test.describe("Element card", () => {
  test("clicking a prose stripe opens the element card", async ({ page }) => {
    await page.goto("/#04-risks.biz42.md");
    const firstStripe = page.getByTestId("prose-stripe").first();
    await expect(firstStripe).toBeVisible({ timeout: 5000 });

    await expect(page.getByTestId("element-card")).not.toBeVisible();
    await firstStripe.click();
    await expect(page.getByTestId("element-card").first()).toBeVisible();
  });

  test("clicking the dismiss stripe restores the prose view", async ({ page }) => {
    await page.goto("/#04-risks.biz42.md");
    const firstStripe = page.getByTestId("prose-stripe").first();
    await expect(firstStripe).toBeVisible({ timeout: 5000 });
    await firstStripe.click();
    await expect(page.getByTestId("element-card").first()).toBeVisible();

    const dismiss = page.getByTestId("card-dismiss-stripe").first();
    await dismiss.click();
    await expect(page.getByTestId("prose-view").first()).toBeVisible();
  });
});

// ─── Human / Agent view toggle ────────────────────────────────────────────────

test.describe("Human / Agent view toggle", () => {
  test("human view shows prose stripes", async ({ page }) => {
    await page.goto("/#04-risks.biz42.md");
    await expect(page.getByTestId("prose-stripe").first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("agent-block").first()).not.toBeVisible();
  });

  test("switching to agent view hides stripes and shows raw blocks", async ({ page }) => {
    await page.goto("/#04-risks.biz42.md");
    await expect(page.getByTestId("prose-stripe").first()).toBeVisible({ timeout: 5000 });

    await page.getByRole("button", { name: "Agent" }).click();
    await expect(page.getByTestId("agent-block").first()).toBeVisible();
    await expect(page.getByTestId("prose-stripe").first()).not.toBeVisible();
  });

  test("switching back to human view restores stripes", async ({ page }) => {
    await page.goto("/#04-risks.biz42.md");
    await page.getByRole("button", { name: "Agent" }).click();
    await expect(page.getByTestId("agent-block").first()).toBeVisible({ timeout: 5000 });

    await page.getByRole("button", { name: "Human" }).click();
    await expect(page.getByTestId("prose-stripe").first()).toBeVisible();
    await expect(page.getByTestId("agent-block").first()).not.toBeVisible();
  });
});
