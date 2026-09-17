import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
    "examples/**/*.biz42.md": "node scripts/validate-examples.mjs",
  },
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      "no-unused-vars": "error",
    },
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    cache: true,
  },
  test: {
    // Exclude Playwright test files — they run via `playwright test`, not vitest.
    exclude: ["**/node_modules/**", "**/dist/**", "**/packages/web/tests/**"],
  },
});
