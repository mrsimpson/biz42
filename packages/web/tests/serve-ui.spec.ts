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

    // Toggle button shows current mode; click "Human" to switch to agent view
    await page.getByRole("button", { name: "Human" }).click();
    await expect(page.getByTestId("agent-block").first()).toBeVisible();
    await expect(page.getByTestId("prose-stripe").first()).not.toBeVisible();
  });

  test("switching back to human view restores stripes", async ({ page }) => {
    await page.goto("/#04-risks.biz42.md");
    // Switch to agent view first
    await page.getByRole("button", { name: "Human" }).click();
    await expect(page.getByTestId("agent-block").first()).toBeVisible({ timeout: 5000 });

    // Now toggle back — button now shows "Agent", click it to return to human view
    await page.getByRole("button", { name: "Agent" }).click();
    await expect(page.getByTestId("prose-stripe").first()).toBeVisible();
    await expect(page.getByTestId("agent-block").first()).not.toBeVisible();
  });
});

// ─── BMC diagram ──────────────────────────────────────────────────────────────

test.describe("BMC diagram", () => {
  test("renders the BMC diagram with block headings", async ({ page }) => {
    await page.goto("/#13-cashflow.biz42.md");
    await expect(page.getByTestId("bmc-diagram")).toBeVisible({ timeout: 8000 });
    await expect(page.getByTestId("bmc-diagram").getByText("Revenue Streams")).toBeVisible();
    await expect(page.getByTestId("bmc-diagram").getByText("Cost Structure")).toBeVisible();
    await expect(page.getByTestId("bmc-diagram").getByText("Value Propositions")).toBeVisible();
  });

  test("BMC diagram links resolve to model element titles", async ({ page }) => {
    await page.goto("/#13-cashflow.biz42.md");
    await expect(page.getByTestId("bmc-diagram")).toBeVisible({ timeout: 8000 });
    // Alert Service product should appear as a link in value-propositions
    await expect(
      page.getByTestId("bmc-diagram").getByRole("link", { name: "Alert Service" }),
    ).toBeVisible();
  });
});

// ─── Dark mode toggle ─────────────────────────────────────────────────────────

test.describe("Dark mode toggle", () => {
  test("theme toggle button is visible in sidebar header", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: /Switch to dark mode|Switch to light mode/ }),
    ).toBeVisible({ timeout: 5000 });
  });

  test("clicking theme toggle sets data-theme attribute on html element", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /Switch to dark mode/ })).toBeVisible({
      timeout: 5000,
    });

    // Start in light mode (no dark system preference in headless), click to go dark
    await page.getByRole("button", { name: /Switch to dark mode/ }).click();
    const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(theme).toBe("dark");
  });

  test("theme persists in localStorage after toggle", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /Switch to dark mode/ })).toBeVisible({
      timeout: 5000,
    });
    await page.getByRole("button", { name: /Switch to dark mode/ }).click();

    const stored = await page.evaluate(() => localStorage.getItem("theme"));
    expect(stored).toBe("dark");
  });

  test("toggling back to light removes data-theme", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /Switch to dark mode/ })).toBeVisible({
      timeout: 5000,
    });

    // Go dark
    await page.getByRole("button", { name: /Switch to dark mode/ }).click();
    await expect(page.getByRole("button", { name: /Switch to light mode/ })).toBeVisible();

    // Go back to light
    await page.getByRole("button", { name: /Switch to light mode/ }).click();
    const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    // When matching system preference, the override is removed (null) or set to "light"
    expect(["light", null]).toContain(theme);
  });
});

// ─── Mobile sidebar ───────────────────────────────────────────────────────────

test.describe("Mobile sidebar", () => {
  test("hamburger menu button is visible at 375px width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const menuBtn = page.getByRole("button", { name: "Open document navigation" });
    await expect(menuBtn).toBeVisible({ timeout: 5000 });
  });

  test("sidebar is hidden by default on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Sidebar nav should exist but be off-screen (translateX(-105%))
    const nav = page.locator("nav[aria-label='Document navigation']");
    await expect(nav).toBeAttached();
    const box = await nav.boundingBox();
    // Should be off-screen to the left (x + width <= 0) or have no visible box
    if (box) {
      expect(box.x + box.width).toBeLessThanOrEqual(10);
    }
  });

  test("clicking hamburger opens the sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Open document navigation" }).click();

    // Wait for CSS transition (180ms) then confirm sidebar is on-screen
    await page.waitForTimeout(300);
    const nav = page.locator("nav[aria-label='Document navigation']");
    const box = await nav.boundingBox();
    expect(box).not.toBeNull();
    // x should be >= 0 (on-screen) after the transition
    expect(box!.x + box!.width).toBeGreaterThan(0);
    expect(box!.x).toBeGreaterThanOrEqual(-5); // allow 5px rounding tolerance
  });

  test("close button in sidebar closes the sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Open document navigation" }).click();

    await page.getByRole("button", { name: "Close document navigation" }).first().click();
    const nav = page.locator("nav[aria-label='Document navigation']");
    const box = await nav.boundingBox();
    if (box) {
      expect(box.x + box.width).toBeLessThanOrEqual(10);
    }
  });

  test("selecting a doc on mobile closes the sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Open document navigation" }).click();

    // Pick any doc button inside the nav
    await page.locator("nav[aria-label='Document navigation'] ul button").first().click();

    // Sidebar should close
    const nav = page.locator("nav[aria-label='Document navigation']");
    // Wait for CSS transition (180ms)
    await page.waitForTimeout(300);
    const box = await nav.boundingBox();
    if (box) {
      expect(box.x + box.width).toBeLessThanOrEqual(10);
    }
  });
});

// ─── Mermaid diagram zoom ─────────────────────────────────────────────────────

test.describe("Mermaid diagram zoom", () => {
  test("mermaid diagram renders with zoom toolbar", async ({ page }) => {
    await page.goto("/#01-scope.biz42.md");
    const zoomIn = page.getByRole("button", { name: "Zoom in" }).first();
    await expect(zoomIn).toBeVisible({ timeout: 10000 });
  });

  test("zoom in button increases the displayed scale percentage", async ({ page }) => {
    await page.goto("/#01-scope.biz42.md");
    const zoomIn = page.getByRole("button", { name: "Zoom in" }).first();
    await expect(zoomIn).toBeVisible({ timeout: 10000 });

    const zoomLabel = page.locator("figure span").filter({ hasText: /\d+%/ }).first();
    const before = await zoomLabel.textContent();
    await zoomIn.click();
    const after = await zoomLabel.textContent();
    expect(after).not.toBe(before);
  });

  test("zoom out button decreases the scale", async ({ page }) => {
    await page.goto("/#01-scope.biz42.md");
    const zoomIn = page.getByRole("button", { name: "Zoom in" }).first();
    await expect(zoomIn).toBeVisible({ timeout: 10000 });

    // Zoom in first so there's room to zoom out
    await zoomIn.click();
    const zoomLabel = page.locator("figure span").filter({ hasText: /\d+%/ }).first();
    const before = await zoomLabel.textContent();

    await page.getByRole("button", { name: "Zoom out" }).first().click();
    const after = await zoomLabel.textContent();
    expect(after).not.toBe(before);
  });

  test("fullscreen button opens diagram fullscreen and Escape closes it", async ({ page }) => {
    await page.goto("/#01-scope.biz42.md");
    const fsBtn = page.getByRole("button", { name: "Open diagram fullscreen" }).first();
    await expect(fsBtn).toBeVisible({ timeout: 10000 });

    await fsBtn.click();
    await expect(page.getByRole("button", { name: "Close fullscreen diagram" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Open diagram fullscreen" }).first(),
    ).toBeVisible();
  });
});
