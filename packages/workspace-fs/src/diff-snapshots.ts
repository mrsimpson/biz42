import { loadWorkspaceFromFiles } from "@biz42/core";
import type { WorkspacePayload } from "@biz42/core";
import { resolveComparison, untrackedDocuments, workspaceLocation } from "@cli42/lib/git";
import type { DiffSpec, SnapshotSource } from "@cli42/lib/git";

import { isBusinessModelDocument } from "./snapshot.ts";

export { EMPTY_TREE } from "@cli42/lib/git";
export type { DiffSpec } from "@cli42/lib/git";

export interface Snapshot {
  /** "working tree", "index", or the resolved commit id. */
  label: string;
  /** Full workspace model; document paths are repository-relative. */
  payload: WorkspacePayload;
}

export interface DiffSnapshots {
  /** Repository root. */
  root: string;
  base: Snapshot;
  head: Snapshot;
  /** Commit the comparison is anchored to; HEAD when the base is the index. */
  baseCommit: string;
  /**
   * Commit a `BIZ42_CONSISTENT` acceptance token must match. Undefined when the
   * base is an index that differs from HEAD, because no commit describes it.
   */
  acceptanceBase?: string;
  /**
   * Business model documents of the workspace that Git does not track yet. They
   * exist in the working tree but are not part of the comparison until added.
   * Empty unless the head is the working tree.
   */
  untracked: string[];
}

async function loadSnapshot(
  source: SnapshotSource,
  inWorkspace: (path: string) => boolean,
): Promise<Snapshot> {
  const files = source
    .paths()
    .filter((path) => isBusinessModelDocument(path) && inWorkspace(path))
    .sort((a, b) => a.localeCompare(b));
  const payload = await loadWorkspaceFromFiles(
    files.map((path) => ({ path, content: source.read(path) })),
  );
  return { label: source.label, payload };
}

/**
 * Load the base and head snapshots of the workspace in `dir` as full workspace
 * payloads with rendered prose. Document paths are repository-relative on both
 * sides, so sections can be matched across snapshots. Git failures (no
 * repository, unknown reference, unreadable blob) are raised, never skipped.
 */
export async function loadDiffSnapshots(dir: string, spec: DiffSpec = {}): Promise<DiffSnapshots> {
  const { root, inWorkspace } = workspaceLocation(dir);
  const comparison = resolveComparison(root, spec);
  const untracked = untrackedDocuments(
    root,
    comparison,
    (path) => isBusinessModelDocument(path) && inWorkspace(path),
  );
  return {
    root,
    base: await loadSnapshot(comparison.base, inWorkspace),
    head: await loadSnapshot(comparison.head, inWorkspace),
    baseCommit: comparison.baseCommit,
    acceptanceBase: comparison.acceptanceBase,
    untracked,
  };
}
