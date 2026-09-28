import type { WorkspacePayload } from "./biz42.ts";
import { diffWorkspaces } from "./workspace-diff.ts";
import type { BusinessModelDiff, ElementChange } from "./workspace-diff.ts";

export interface DiffFinding {
  kind: "block-without-prose-change" | "prose-without-block-change";
  severity: "warning";
  file: string;
  line: number;
  message: string;
  elementId: string;
}

export interface DiffResult {
  /** The semantic diff the findings are derived from. */
  model: BusinessModelDiff;
  /** Consistency findings (block and prose not changed together), in document order. */
  findings: DiffFinding[];
  hasBlockingFindings: boolean;
}

function consistencyFinding(change: ElementChange): DiffFinding | undefined {
  if (change.status === "unchanged") {
    return {
      kind: "prose-without-block-change",
      severity: "warning",
      file: change.head!.file,
      line: change.head!.line,
      elementId: change.id,
      message: `Section prose changed without changing block '${change.id}'.`,
    };
  }
  if (change.proseChanged) return undefined;
  if (change.status === "removed") {
    return {
      kind: "block-without-prose-change",
      severity: "warning",
      file: change.base!.file,
      line: change.base!.line,
      elementId: change.id,
      message: `Block '${change.id}' was deleted without deleting its section prose.`,
    };
  }
  return {
    kind: "block-without-prose-change",
    severity: "warning",
    file: change.head!.file,
    line: change.head!.line,
    elementId: change.id,
    message: `Block '${change.id}' changed without changing its section prose.`,
  };
}

/**
 * Lint a change to the business model: derive consistency findings (block and
 * the prose that explains it changed together) from the semantic diff of both
 * snapshots.
 */
export function lintBusinessModelDiff(base: WorkspacePayload, head: WorkspacePayload): DiffResult {
  const model = diffWorkspaces(base, head);
  const findings = model.elements
    .map(consistencyFinding)
    .filter((finding): finding is DiffFinding => finding !== undefined)
    .sort(
      (a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.kind.localeCompare(b.kind),
    );
  return { model, findings, hasBlockingFindings: findings.length > 0 };
}
