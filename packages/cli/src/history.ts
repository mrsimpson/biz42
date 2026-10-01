// Delivers the business model history: plain data from the filesystem
// workspace adapter, in the Web Renderer's history format.
import { snapshotBlobFile, snapshotTreeFile, toHistoryPearls } from "@cli42/lib/web";
import type { HistoryEntry as Entry, HistoryPearl, SnapshotTree } from "@cli42/lib/web";
import type { DiffPayload } from "@biz42/core";
import { renderMarkdown } from "@cli42/lib/markdown";
import { loadCommitChange, readBusinessModelBlob, readCommitFiles } from "@biz42/workspace-fs";
import type { BusinessModelCommit, BusinessModelHistory } from "@biz42/workspace-fs";

/** A pearl's entry, with biz42's difference. */
type HistoryEntry = Entry<DiffPayload>;

/** The pearls of a history, numbered into chunks. */
export function historyPearls(history: BusinessModelHistory): HistoryPearl[] {
  return toHistoryPearls(history.commits);
}

/** The entry of one pearl: its change and its commit message, rendered (Markdown). */
export async function loadHistoryEntry(
  dir: string,
  commit: BusinessModelCommit,
): Promise<HistoryEntry> {
  const messageHtml = commit.body ? renderMarkdown(commit.body) : "";
  return { ...(await loadCommitChange(dir, commit)), messageHtml };
}

/** The commits of one chunk, in pearl order. */
export function chunkCommits(
  history: BusinessModelHistory,
  pearls: readonly HistoryPearl[],
  chunk: number,
): BusinessModelCommit[] {
  return history.commits.filter((_, index) => pearls[index]!.chunk === chunk);
}

/** The ids of the history's commits; the uncommitted changes have none. */
export function historyCommitIds(history: BusinessModelHistory): string[] {
  return history.commits.flatMap((commit) => (commit.commit ? [commit.commit] : []));
}

/** The snapshot tree of one commit. */
export function snapshotTree(dir: string, commit: string): SnapshotTree {
  return { files: readCommitFiles(dir, commit) };
}

/**
 * Every snapshot file of a history, by file name: a tree per commit, and each
 * document once under its blob id.
 */
export function snapshotFiles(dir: string, history: BusinessModelHistory): Record<string, string> {
  const commits = historyCommitIds(history);
  const files: Record<string, string> = {};
  const blobs = new Set<string>();
  for (const commit of commits) {
    const tree = snapshotTree(dir, commit);
    files[snapshotTreeFile(commit)] = JSON.stringify(tree);
    for (const id of Object.values(tree.files)) blobs.add(id);
  }
  for (const id of blobs) files[snapshotBlobFile(id)] = readBusinessModelBlob(dir, commits, id);
  return files;
}
