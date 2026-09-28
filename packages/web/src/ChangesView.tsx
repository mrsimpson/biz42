import React from "react";
import type { DiffPayload, DiffSegment } from "@biz42/core";
import { ChangeCounts, STATUS_CLASS, snapshotLabel } from "./DiffSegment.tsx";
import { ChapterDiff } from "./ChapterDiff.tsx";
import { filename } from "./utils.ts";
import docStyles from "./DocumentView.module.css";
import styles from "./ChangesView.module.css";

export { ChangeCounts, snapshotLabel } from "./DiffSegment.tsx";

/** Where a link in the summary leads: the chapter view or the chapters below the summary. */
export interface ChangeLink {
  href: string;
  onClick?: (event: React.MouseEvent) => void;
}

interface ChangesViewProps {
  diff: DiffPayload | null;
  /** Set when the difference could not be computed (serve --diff reload failure). */
  error: string | null;
  viewMode: "human" | "agent";
  /** Heading of the view (default "Changes"). */
  title?: string;
  /** Shown below the heading, e.g. commit metadata. */
  meta?: React.ReactNode;
  /** Link to an architecture element, if it can be shown. */
  elementLink: (elementId: string) => ChangeLink | null;
  /** Link to the changes of a document. */
  documentLink: (file: string) => ChangeLink;
  /**
   * Render the changed chapters below the summary (without the full documents,
   * unchanged sections are skeletons).
   */
  withChapters?: boolean;
  targetElementId?: string | null;
  onTargetConsumed?: () => void;
}

function Link({
  link,
  children,
  testId,
}: {
  link: ChangeLink | null;
  children: React.ReactNode;
  testId?: string;
}) {
  if (!link) return <>{children}</>;
  return (
    <a href={link.href} onClick={link.onClick} data-testid={testId}>
      {children}
    </a>
  );
}

/**
 * Review summary of one architecture difference: what needs attention first,
 * then a compact index of what changed — each item linking to the change.
 */
export function ChangesView({
  diff,
  error,
  viewMode,
  title = "Changes",
  meta,
  elementLink,
  documentLink,
  withChapters = false,
  targetElementId,
  onTargetConsumed,
}: ChangesViewProps) {
  return (
    <article className={styles.changes} data-testid="changes-view">
      <h1 className={[docStyles.heading, docStyles.heading1, docStyles.chapterTitle].join(" ")}>
        {title}
      </h1>
      {meta}
      {diff && (
        <p className={styles.range} data-testid="changes-range">
          <code>{snapshotLabel(diff.base.label)}</code>
          <span aria-hidden="true"> → </span>
          <span className={styles.visuallyHidden}> to </span>
          <code>{snapshotLabel(diff.head.label)}</code>
        </p>
      )}
      {error !== null && (
        <div className={styles.error} role="alert" data-testid="diff-error">
          <strong>The difference could not be computed.</strong>
          <pre>{error}</pre>
        </div>
      )}
      {diff && error === null && diff.view.documents.length === 0 && (
        <p className={styles.empty} data-testid="changes-empty">
          No business model changes.
        </p>
      )}
      {diff && error === null && (
        <>
          <Attention diff={diff} elementLink={elementLink} />
          <ChangeIndex diff={diff} elementLink={elementLink} documentLink={documentLink} />
          {withChapters &&
            diff.view.documents.map((document) => (
              <ChapterDiff
                key={document.file}
                diff={document}
                viewMode={viewMode}
                targetElementId={targetElementId}
                onTargetConsumed={onTargetConsumed}
              />
            ))}
        </>
      )}
    </article>
  );
}

/** Findings that need attention before the change is accepted. */
function Attention({
  diff,
  elementLink,
}: {
  diff: DiffPayload;
  elementLink: (elementId: string) => ChangeLink | null;
}) {
  if (diff.findings.length === 0) return null;
  return (
    <section className={styles.findings} aria-label="Warnings" data-testid="diff-warnings">
      <h2 className={styles.groupTitle}>Warnings</h2>
      <p className={styles.groupHint}>
        A block and the prose that explains it should change together.
      </p>
      <ul role="list">
        {diff.findings.map((finding, index) => (
          <li
            key={`${finding.kind}-${finding.file}-${finding.line}-${index}`}
            className={styles.warning}
            data-testid="diff-finding"
          >
            <Link link={elementLink(finding.elementId)}>{finding.message}</Link>
            <code className={styles.location}>
              {filename(finding.file)}
              {finding.line > 0 ? `:${finding.line}` : ""}
            </code>
          </li>
        ))}
      </ul>
    </section>
  );
}

function segmentItems(segment: DiffSegment) {
  const items = [
    ...segment.elements.map((change) => ({
      key: change.id,
      label: change.id,
      elementId: change.id as string | null,
      status: change.status === "unchanged" ? "modified" : change.status,
    })),
    ...segment.diagrams.map((change) => ({
      key: `diagram-${change.id}`,
      label: change.id,
      elementId: null,
      status: change.status,
    })),
  ];
  if (segment.prose) {
    items.push({
      key: `section-${segment.section.headingPath.join("/")}`,
      label: `§ ${segment.section.headingPath[segment.section.headingPath.length - 1] ?? "Preamble"}`,
      elementId: null,
      status: segment.prose.status,
    });
  }
  return items;
}

/** Compact index of what changed, per chapter. */
function ChangeIndex({
  diff,
  elementLink,
  documentLink,
}: {
  diff: DiffPayload;
  elementLink: (elementId: string) => ChangeLink | null;
  documentLink: (file: string) => ChangeLink;
}) {
  if (diff.view.documents.length === 0) return null;
  return (
    <section className={styles.index} aria-label="Changed chapters" data-testid="diff-index">
      <h2 className={styles.groupTitle}>Changed chapters</h2>
      <ul role="list">
        {diff.view.documents.map((document) => (
          <li key={document.file} data-testid="diff-index-document" data-file={document.file}>
            <span className={styles.indexTitle}>
              <Link link={documentLink(document.file)} testId="diff-index-document-link">
                {document.title}
              </Link>
              <ChangeCounts {...document} />
            </span>
            <span className={styles.indexItems}>
              {document.segments.flatMap(segmentItems).map((item) => (
                <span
                  key={item.key}
                  className={[styles.chip, STATUS_CLASS[item.status]].join(" ")}
                  data-testid="diff-index-item"
                  data-status={item.status}
                >
                  <Link link={item.elementId ? elementLink(item.elementId) : null}>
                    {item.label}
                  </Link>
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
