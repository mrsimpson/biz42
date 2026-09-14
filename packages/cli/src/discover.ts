import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const PREFERRED_NAMES = new Set(["docs", "biz42"]);
const MAX_DEPTH = 3;

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".vite",
  "__fixtures__",
  "__tests__",
]);

function hasBiz42Files(dir: string): boolean {
  try {
    return readdirSync(dir, { withFileTypes: true }).some(
      (e) => e.isFile() && e.name.includes(".biz42."),
    );
  } catch {
    return false;
  }
}

function isGitRoot(dir: string): boolean {
  return existsSync(join(dir, ".git"));
}

function biz42SubDirs(dir: string, maxDepth = MAX_DEPTH): string[] {
  if (maxDepth <= 0) return [];
  let entries: import("node:fs").Dirent[];
  try {
    entries = readdirSync(dir, { withFileTypes: true }) as import("node:fs").Dirent[];
  } catch {
    return [];
  }

  const subdirs = entries
    .filter((e) => e.isDirectory() && !SKIP_DIRS.has((e.name as string).toLowerCase()))
    .sort((a, b) => {
      const aP = PREFERRED_NAMES.has((a.name as string).toLowerCase());
      const bP = PREFERRED_NAMES.has((b.name as string).toLowerCase());
      if (aP && !bP) return -1;
      if (!aP && bP) return 1;
      return 0;
    })
    .map((e) => join(dir, e.name as string));

  const results: string[] = [];
  for (const sub of subdirs) {
    if (hasBiz42Files(sub)) {
      results.push(sub);
    }
    results.push(...biz42SubDirs(sub, maxDepth - 1));
  }
  return results;
}

export function discoverBiz42Dir(
  start: string,
  warn: (msg: string) => void = (msg) => process.stderr.write(msg + "\n"),
): string | undefined {
  let current = resolve(start);
  while (true) {
    if (hasBiz42Files(current)) return current;

    const matches = biz42SubDirs(current);
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) {
      warn(
        `warning: multiple directories with biz42 files found, using '${matches[0]}':\n` +
          matches.map((m) => `  ${m}`).join("\n") +
          "\n  Use --dir to suppress this warning.",
      );
      return matches[0];
    }

    if (isGitRoot(current)) return undefined;

    const parent = dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}
