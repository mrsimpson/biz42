import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
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
  ],
});
