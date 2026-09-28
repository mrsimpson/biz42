import { git, workspaceLocation } from "./git-diff.ts";

const COMMIT_ID = /^[0-9a-f]{40}$/;

// Commits never change: their files are read from git once per repository.
const commitFilesCache = new Map<string, Record<string, string>>();

/**
 * Read the business model documents of the workspace at one commit, as
 * repository-relative path → git blob id. Takes a full commit id only — never
 * a branch or other reference. Git failures are raised.
 */
export function readCommitFiles(dir: string, commit: string): Record<string, string> {
  if (!COMMIT_ID.test(commit)) throw new Error(`Not a full commit id: ${commit}`);
  const { root, inWorkspace } = workspaceLocation(dir);
  const key = `${root}\0${commit}`;
  const cached = commitFilesCache.get(key);
  if (cached) return cached;
  const files: Record<string, string> = {};
  // Each record: "<mode> <type> <id>\t<path>"; -z keeps unusual names unquoted.
  for (const record of git(root, ["ls-tree", "-r", "-z", "--full-tree", commit]).split("\0")) {
    if (record === "") continue;
    const tab = record.indexOf("\t");
    const [, type, id] = record.slice(0, tab).split(" ");
    const path = record.slice(tab + 1);
    if (type === "blob" && path.endsWith(".biz42.md") && inWorkspace(path)) files[path] = id!;
  }
  commitFilesCache.set(key, files);
  return files;
}

/**
 * Read one business model document by its blob id. Only a blob that is a
 * document of the workspace in one of `commits` is read; any other id — any
 * other file of the repository — is refused, so serving blobs never exposes
 * the rest of the repository.
 */
export function readBusinessModelBlob(dir: string, commits: readonly string[], id: string): string {
  const allowed = commits.some((commit) =>
    Object.values(readCommitFiles(dir, commit)).includes(id),
  );
  if (!allowed) throw new Error(`Not a business model document of this history: ${id}`);
  return git(workspaceLocation(dir).root, ["cat-file", "blob", id]);
}
