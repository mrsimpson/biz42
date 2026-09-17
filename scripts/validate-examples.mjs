#!/usr/bin/env node
// Validates all example workspaces. Called from the vite-plus staged hook and
// validate:examples npm script. Ignores any positional arguments passed by the
// staged hook runner (matched file paths) — always validates the full dirs.

import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(root, "packages/cli/dist/cli.mjs");

const examples = ["examples/acme-emergency", "examples/assistify"];

for (const dir of examples) {
  console.log(`\n→ validating ${dir}`);
  execSync(`node "${cli}" --dir "${join(root, dir)}" validate --strict`, {
    stdio: "inherit",
    cwd: root,
  });
}
