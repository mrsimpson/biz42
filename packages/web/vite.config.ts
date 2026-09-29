import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { asciidoctorBrowserPaths } from "@cli42/lib/vite";

export default defineConfig({
  plugins: [react(), asciidoctorBrowserPaths()],
  root: resolve(import.meta.dirname),
  // Relative asset URLs: a site built by `biz42 build` works under any subpath,
  // including the lazily loaded chunks (Mermaid) that index.html does not list.
  base: "./",
  build: {
    outDir: resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    proxy: {
      "/api": "http://localhost:3142",
    },
  },
});
