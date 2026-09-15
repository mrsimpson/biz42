import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  root: resolve(import.meta.dirname),
  // In CI the VITE_BASE env var is set to the GitHub Pages subpath (e.g. /biz42/)
  base: process.env["VITE_BASE"] ?? "/",
  build: {
    outDir: resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: 5175,
  },
});
