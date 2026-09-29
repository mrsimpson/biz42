import { useEffect, useState } from "react";
import { loadWorkspaceFromFiles } from "@biz42/core";
import { snapshotBlobFile, snapshotTreeFile } from "./history-format.ts";
import type { SnapshotTree } from "./history-format.ts";
import type { WorkspacePayload } from "./types.ts";
import { readHistoryFile } from "./useHistory.ts";
import type { HistorySource } from "./useHistory.ts";

export type SnapshotState =
  | { status: "loading" }
  | { status: "error"; reason: string }
  | { status: "ready"; payload: WorkspacePayload };

// Commits and blobs never change: each is loaded once per history source.
const blobCache = new WeakMap<HistorySource, Map<string, Promise<string>>>();
const snapshotCache = new WeakMap<HistorySource, Map<string, Promise<WorkspacePayload>>>();

function cached<T>(
  cache: WeakMap<HistorySource, Map<string, Promise<T>>>,
  source: HistorySource,
  key: string,
  load: () => Promise<T>,
): Promise<T> {
  let entries = cache.get(source);
  if (!entries) cache.set(source, (entries = new Map()));
  let entry = entries.get(key);
  if (!entry) {
    entry = load();
    // A failed load is not kept: the next attempt reads again.
    entry.catch(() => entries.delete(key));
    entries.set(key, entry);
  }
  return entry;
}

/**
 * Build the workspace of one commit in the browser: its document list, its
 * documents, then the Core Library's "files in, model out" (prose rendered).
 */
export function loadSnapshot(source: HistorySource, commit: string): Promise<WorkspacePayload> {
  return cached(snapshotCache, source, commit, async () => {
    const tree = JSON.parse(
      await readHistoryFile(source, snapshotTreeFile(commit)),
    ) as SnapshotTree;
    const files = await Promise.all(
      Object.entries(tree.files)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(async ([path, id]) => ({
          path,
          content: await cached(blobCache, source, id, () =>
            readHistoryFile(source, snapshotBlobFile(id)),
          ),
        })),
    );
    return loadWorkspaceFromFiles(files);
  });
}

/**
 * The workspace of `commit` (null: none requested), loaded from the history.
 * `source` is undefined while it is not known yet whether there is a history.
 */
export function useSnapshot(
  source: HistorySource | null | undefined,
  commit: string | null,
): SnapshotState {
  // Tagged with its commit, so a switch never shows the previous version as ready.
  const [state, setState] = useState<{ commit: string | null; state: SnapshotState }>({
    commit: null,
    state: { status: "loading" },
  });
  useEffect(() => {
    if (!commit || source === undefined) return;
    if (source === null) {
      setState({
        commit,
        state: { status: "error", reason: "This site has no business model history." },
      });
      return;
    }
    let active = true;
    loadSnapshot(source, commit)
      .then((payload) => active && setState({ commit, state: { status: "ready", payload } }))
      .catch(
        (error: unknown) =>
          active &&
          setState({
            commit,
            state: { status: "error", reason: String(error).replace(/^Error: /, "") },
          }),
      );
    return () => {
      active = false;
    };
  }, [source, commit]);
  return state.commit === commit ? state.state : { status: "loading" };
}
