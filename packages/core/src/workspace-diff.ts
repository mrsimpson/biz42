/**
 * Semantic diff between two workspace snapshots of a business model — the
 * generic workspace diff of `@cli42/lib`, typed with the biz42 model.
 */

import { diffWorkspaces as diffSnapshots } from "@cli42/lib/diff";
import type {
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

export function diffWorkspaces(base: WorkspacePayload, head: WorkspacePayload): BusinessModelDiff {
  return diffSnapshots(base, head);
}
