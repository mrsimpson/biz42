/**
 * Semantic diff between two workspace snapshots of a business model — the
 * generic workspace diff of `@cli42/lib`, typed with the biz42 model.
 *
 * A block must be placed under a heading (EG04), so a document preamble never
 * holds elements.
 */

import { diffWorkspaces as diffSnapshots } from "@cli42/lib/diff";
import type {
  DiffOptions,
  EdgeChange as GenericEdgeChange,
  ElementChange as GenericElementChange,
  WorkspaceDiff,
} from "@cli42/lib/diff";
import type { WorkspacePayload } from "./biz42.ts";

export type {
  AttributeChange,
  ChangeStatus,
  DiagramChange,
  DocumentChangeSummary,
  Location,
  ProseSectionChange,
  SectionRef,
} from "@cli42/lib/diff";

export type ElementChange = GenericElementChange<WorkspacePayload>;
export type EdgeChange = GenericEdgeChange<WorkspacePayload>;
export type BusinessModelDiff = WorkspaceDiff<WorkspacePayload>;

/** @internal Shared with the diff view. */
export const DIFF_OPTIONS: DiffOptions = { rejectPreambleBlocks: true };

export function diffWorkspaces(base: WorkspacePayload, head: WorkspacePayload): BusinessModelDiff {
  return diffSnapshots(base, head, DIFF_OPTIONS);
}
