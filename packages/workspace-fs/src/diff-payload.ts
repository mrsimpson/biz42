import { buildDiffView, lintBusinessModelDiff } from "@biz42/core";
import type { DiffPayload, DiffResult } from "@biz42/core";

import { loadDiffSnapshots } from "./diff-snapshots.ts";
import type { DiffSnapshots, DiffSpec } from "./diff-snapshots.ts";

export interface LoadedDiff {
  snapshots: DiffSnapshots;
  result: DiffResult;
  payload: DiffPayload;
}

/** Load both snapshots of a change, lint it and build its render-ready view. */
export function loadDiffPayload(dir: string, spec: DiffSpec): LoadedDiff {
  const snapshots = loadDiffSnapshots(dir, spec);
  const result = lintBusinessModelDiff(snapshots.base.payload, snapshots.head.payload);
  return {
    snapshots,
    result,
    payload: {
      base: { label: snapshots.base.label, commit: snapshots.baseCommit },
      head: { label: snapshots.head.label },
      findings: result.findings,
      view: buildDiffView(snapshots.base.payload, snapshots.head.payload, result.model),
    },
  };
}
