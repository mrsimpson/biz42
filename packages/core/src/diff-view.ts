/**
 * Render-ready view of a business model diff: the changed sections
 * ("segments") of both snapshots with their AST nodes, the elements they
 * define or mention, the diagrams they define, and the edges between them —
 * the generic diff view of `@cli42/lib`, typed with the biz42 model.
 */

import { buildDiffView as buildView } from "@cli42/lib/diff";
import type {
  DiffDocument as GenericDiffDocument,
  DiffSegment as GenericDiffSegment,
  DiffView as GenericDiffView,
  SectionContent as GenericSectionContent,
} from "@cli42/lib/diff";
import type { WorkspacePayload } from "./biz42.ts";
import type { DiffFinding } from "./diff.ts";
import type { Diagram } from "./model/types.ts";
import { DIFF_OPTIONS, diffWorkspaces } from "./workspace-diff.ts";
import type { BusinessModelDiff } from "./workspace-diff.ts";

export type { OutlineEntry } from "@cli42/lib/diff";

export interface SectionContent extends GenericSectionContent<WorkspacePayload> {
  /** Diagrams the section defines, so they can be rendered on their own. */
  diagrams: Diagram[];
}

export interface DiffSegment extends Omit<GenericDiffSegment<WorkspacePayload>, "base" | "head"> {
  base?: SectionContent;
  head?: SectionContent;
}

export interface DiffDocument extends Omit<GenericDiffDocument<WorkspacePayload>, "segments"> {
  segments: DiffSegment[];
}

export interface DiffView extends Omit<GenericDiffView<WorkspacePayload>, "documents"> {
  documents: DiffDocument[];
}

export interface DiffPayload {
  base: { label: string; commit: string };
  head: { label: string };
  /**
   * Documents of the workspace that Git does not track yet: present in the
   * working tree, but not part of the comparison until added.
   */
  untracked?: string[];
  /** Lint findings, in the order `biz42 diff` prints them. */
  findings: DiffFinding[];
  view: DiffView;
}

/**
 * Build the render-ready view of the change from `base` to `head`. Pass the
 * `diff` when it was already computed for the same snapshots.
 */
export function buildDiffView(
  base: WorkspacePayload,
  head: WorkspacePayload,
  diff: BusinessModelDiff = diffWorkspaces(base, head),
): DiffView {
  // With section diagrams, every section content holds its diagrams.
  return buildView(base, head, diff, { ...DIFF_OPTIONS, sectionDiagrams: true }) as DiffView;
}
