import { consistencyFindings } from "@cli42/lib/diff";
import type { ConsistencyFinding } from "@cli42/lib/diff";
import type { WorkspacePayload } from "./biz42.ts";
import { diffWorkspaces } from "./workspace-diff.ts";
import type { BusinessModelDiff } from "./workspace-diff.ts";

export type DiffFinding = ConsistencyFinding;

export interface DiffResult {
  /** The semantic diff the findings are derived from. */
  model: BusinessModelDiff;
  /** Consistency findings (block and prose not changed together), in document order. */
  findings: DiffFinding[];
  hasBlockingFindings: boolean;
}

/**
 * Lint a change to the business model: derive consistency findings (block and
 * the prose that explains it changed together) from the semantic diff of both
 * snapshots.
 */
export function lintBusinessModelDiff(base: WorkspacePayload, head: WorkspacePayload): DiffResult {
  const model = diffWorkspaces(base, head);
  const findings = consistencyFindings(model.elements);
  return { model, findings, hasBlockingFindings: findings.length > 0 };
}
