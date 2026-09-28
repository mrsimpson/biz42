import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: "src/cli.ts",
    dts: false,
    clean: ["dist/cli.mjs"],
    deps: {
      onlyBundle: false,
      alwaysBundle: ["@biz42/core", "@biz42/workspace-fs"],
    },
    copy: [
      {
        from: "../../packages/skill/SKILL.md",
        to: "dist/skill",
        flatten: true,
      },
      {
        from: "../../packages/web/dist/index.html",
        to: "dist/web",
        flatten: true,
      },
      {
        from: "../../packages/web/dist/assets/*",
        to: "dist/web/assets",
        flatten: true,
      },
      {
        from: "../../packages/web/dist-single/index.html",
        to: "dist/web-single",
        flatten: true,
      },
    ],
  },
  lint: {
    options: {
      typeAware: false,
      typeCheck: false,
    },
  },
  fmt: {},
});
