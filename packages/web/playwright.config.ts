import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  // Several tests run a full `biz42 build` (CLI spawn + Vite bundle) which can
  // take 30–40 s on a loaded machine. 90 s gives enough headroom.
  timeout: 90000,
  use: {
    ...devices["Desktop Chrome"],
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: [
        "**/serve-ui.spec.ts",
        "**/diff-cli.spec.ts",
        "**/diff-ui.spec.ts",
        "**/diff-single-file.spec.ts",
        "**/diff-review-script.spec.ts",
        "**/history-cli.spec.ts",
        "**/history-ui.spec.ts",
      ],
    },
    {
      // Screenshots for the site, headless. Run explicitly: pnpm demo:evolution
      name: "demo",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["**/demo-evolution.spec.ts"],
      timeout: 120000,
    },
  ],
});
