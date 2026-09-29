import React, { useMemo, useState } from "react";
import { ELEMENT_CHAPTER } from "@biz42/core";
import type {
  AstNode,
  AttributeChange,
  BlockType,
  Diagram,
  DiffDocument,
  DiffSegment,
  Element,
  Edge,
  SectionContent,
  SectionRef,
} from "@biz42/core";
import { groupNodes } from "./DocumentView.tsx";
import { AstNodeRenderer, renderProse } from "./AstNodeRenderer.tsx";
import type { ProseRunNode } from "./AstNodeRenderer.tsx";
import { diffTokens, markHtmlChanges, wordTokens, type DiffPart } from "./textDiff.ts";
import { filename } from "./utils.ts";
import styles from "./ChangesView.module.css";

/** Shorten a commit id to 8 characters; labels such as "working tree" pass through. */
export function snapshotLabel(label: string): string {
  return /^[0-9a-f]{40}$/.test(label) ? label.slice(0, 8) : label;
}

/** Identity of a section across snapshots — the same key the core diff uses. */
export function sectionKeyOf(ref: SectionRef): string {
  return JSON.stringify([ref.file, ref.headingPath, ref.occurrence]);
}

export const STATUS_CLASS: Record<string, string | undefined> = {
  added: styles.added,
  modified: styles.modified,
  removed: styles.removed,
  unchanged: styles.modified,
};

export function ChangeCounts({
  added,
  modified,
  removed,
}: Pick<DiffDocument, "added" | "modified" | "removed">) {
  return (
    <span className={styles.counts}>
      {added > 0 && <span className={styles.countAdded}>+{added}</span>}
      {modified > 0 && <span className={styles.countModified}>~{modified}</span>}
      {removed > 0 && <span className={styles.countRemoved}>−{removed}</span>}
    </span>
  );
}

/** Chapter of each element — where diagram nodes link to. */
function chapterMapOf(elements: Iterable<Element>): Map<string, number> {
  return new Map(
    [...elements].map((element) => [element.id, ELEMENT_CHAPTER[element.kind as BlockType]]),
  );
}

/** Render AST nodes the way the Documents view does. */
export function NodesRender({
  nodes,
  proseHtml,
  viewMode,
  elementsMap,
  elementDocMap,
  edges,
  diagrams,
  targetElementId,
  onTargetConsumed,
}: {
  nodes: AstNode[];
  /** Rendered HTML of each prose run, in order; rendered from the text when absent. */
  proseHtml?: string[];
  viewMode: "human" | "agent";
  elementsMap: Map<string, Element>;
  elementDocMap: Map<string, string>;
  edges: Edge[];
  diagrams: Diagram[];
  targetElementId?: string | null;
  onTargetConsumed?: () => void;
}) {
  const groups = useMemo(() => groupNodes(nodes), [nodes]);
  const chapterMap = useMemo(() => chapterMapOf(elementsMap.values()), [elementsMap]);
  let run = 0;
  return (
    <>
      {groups.map((group, index) => {
        if (group.kind === "other") {
          return (
            <AstNodeRenderer
              key={index}
              node={group.node}
              viewMode={viewMode}
              elementsMap={elementsMap}
              elementDocMap={elementDocMap}
              edges={edges}
              diagrams={diagrams}
              chapterMap={chapterMap}
            />
          );
        }
        const blockId = group.block?.attributes["id"] ?? null;
        const isTarget = blockId !== null && blockId === targetElementId;
        const node: ProseRunNode = {
          kind: "prose-run",
          text: group.text,
          renderedHtml: proseHtml?.[run++] ?? group.renderedHtml,
          block: group.block,
        };
        return (
          <AstNodeRenderer
            key={index}
            node={node}
            viewMode={viewMode}
            elementsMap={elementsMap}
            elementDocMap={elementDocMap}
            edges={edges}
            diagrams={diagrams}
            chapterMap={chapterMap}
            targetElementId={isTarget ? targetElementId : null}
            onTargetConsumed={isTarget ? onTargetConsumed : undefined}
          />
        );
      })}
    </>
  );
}

/** Rendered HTML of each prose run of the nodes, in order (rendered on the server). */
function proseRunsHtml(nodes: AstNode[]): string[] {
  return groupNodes(nodes).flatMap((group) =>
    group.kind === "prose-run"
      ? [group.renderedHtml ?? (group.text ? renderProse(group.text) : "")]
      : [],
  );
}

/** The head's prose runs with added words in `<ins>` and removed ones in `<del>`. */
function markProseChanges(head: AstNode[], base: AstNode[]): string[] {
  return markHtmlChanges(proseRunsHtml(base), proseRunsHtml(head), {
    added: styles.proseAdded!,
    removed: styles.proseRemoved!,
  });
}

/** Render one side of a changed section with the elements it carries. */
function SectionRender({
  content,
  compareTo,
  viewMode,
  targetElementId,
  onTargetConsumed,
}: {
  content: SectionContent;
  /** The other version: prose words that differ from it are marked. */
  compareTo?: SectionContent;
  viewMode: "human" | "agent";
  targetElementId?: string | null;
  onTargetConsumed?: () => void;
}) {
  const proseHtml = useMemo(
    () => (compareTo ? markProseChanges(content.nodes, compareTo.nodes) : undefined),
    [content, compareTo],
  );
  const elementsMap = useMemo(
    () => new Map<string, Element>(content.elements.map((element) => [element.id, element])),
    [content],
  );
  const elementDocMap = useMemo(
    () =>
      new Map<string, string>(
        content.elements.map((element) => [element.id, filename(element.loc.file)]),
      ),
    [content],
  );
  return (
    <NodesRender
      nodes={content.nodes}
      {...(proseHtml ? { proseHtml } : {})}
      viewMode={viewMode}
      elementsMap={elementsMap}
      elementDocMap={elementDocMap}
      edges={content.edges}
      diagrams={content.diagrams}
      targetElementId={targetElementId}
      onTargetConsumed={onTargetConsumed}
    />
  );
}

/** Tokens of an attribute value: list items, lines of a multi-line text, or words. */
function valueText(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function isMultiline(value: unknown): boolean {
  return typeof value === "string" && value.includes("\n");
}

/** One side of a changed single-line value: unchanged text plain, the changed tokens marked. */
function ValueSide({
  parts,
  side,
  separator,
}: {
  parts: DiffPart<string>[];
  side: "before" | "after";
  separator: string;
}) {
  const hidden = side === "before" ? "insert" : "delete";
  const shown = parts.filter((part) => part.op !== hidden);
  if (shown.length === 0) return <>—</>;
  const Mark = side === "before" ? "del" : "ins";
  let first = true;
  return (
    <>
      {shown.flatMap((part, index) =>
        part.values.map((value, position) => {
          const text = `${first ? "" : separator}${value}`;
          first = false;
          return part.op === "equal" ? (
            <React.Fragment key={`${index}-${position}`}>{text}</React.Fragment>
          ) : (
            <Mark
              key={`${index}-${position}`}
              className={side === "before" ? styles.before : styles.after}
              data-testid={side === "before" ? "value-removed" : "value-added"}
            >
              {text}
            </Mark>
          );
        }),
      )}
    </>
  );
}

/** Unchanged lines kept around a change in a multi-line value; longer runs collapse. */
const LINE_CONTEXT = 2;

function LineDiff({ before, after }: { before: string; after: string }) {
  const lines = (text: string) =>
    text === "" ? [] : text.split("\n").map((line) => line.trimEnd());
  const parts = diffTokens(lines(before), lines(after));
  const rows: React.ReactNode[] = [];
  parts.forEach((part, index) => {
    let values = part.values;
    if (part.op === "equal") {
      const head = index === 0 ? 0 : LINE_CONTEXT;
      const tail = index === parts.length - 1 ? 0 : LINE_CONTEXT;
      if (values.length > head + tail + 1) {
        const hidden = values.length - head - tail;
        values = [...values.slice(0, head), "", ...values.slice(values.length - tail)];
        rows.push(
          ...values.map((line, position) =>
            position === head ? (
              <span key={`${index}-gap`} className={styles.lineGap} data-testid="line-gap">
                ⋯ {hidden} unchanged {hidden === 1 ? "line" : "lines"}
              </span>
            ) : (
              <span key={`${index}-${position}`} className={styles.line}>
                {`  ${line}`}
              </span>
            ),
          ),
        );
        return;
      }
    }
    const marker = part.op === "equal" ? " " : part.op === "delete" ? "−" : "+";
    const className =
      part.op === "equal"
        ? styles.line
        : part.op === "delete"
          ? styles.lineRemoved
          : styles.lineAdded;
    rows.push(
      ...values.map((line, position) => (
        <span
          key={`${index}-${position}`}
          className={className}
          data-testid={
            part.op === "equal" ? undefined : `line-${part.op === "delete" ? "removed" : "added"}`
          }
        >
          {`${marker} ${line}`}
        </span>
      )),
    );
  });
  return <pre className={styles.lineDiff}>{rows}</pre>;
}

function AttributeRow({ attribute }: { attribute: AttributeChange }) {
  const { before, after } = attribute;
  if (isMultiline(before) || isMultiline(after)) {
    return (
      <tr data-testid="attribute-change">
        <th scope="row">{attribute.name}</th>
        <td colSpan={2}>
          <LineDiff
            before={before === undefined ? "" : valueText(before)}
            after={after === undefined ? "" : valueText(after)}
          />
        </td>
      </tr>
    );
  }
  const lists = Array.isArray(before) || Array.isArray(after);
  const tokens = (value: unknown): string[] => {
    if (value === undefined) return [];
    if (Array.isArray(value)) return value.map(valueText);
    return wordTokens(valueText(value));
  };
  const parts = diffTokens(tokens(before), tokens(after));
  const separator = lists ? ", " : "";
  return (
    <tr data-testid="attribute-change">
      <th scope="row">{attribute.name}</th>
      <td>
        <ValueSide parts={parts} side="before" separator={separator} />
      </td>
      <td>
        <ValueSide parts={parts} side="after" separator={separator} />
      </td>
    </tr>
  );
}

function AttributeTable({ attributes }: { attributes: AttributeChange[] }) {
  if (attributes.length === 0) return null;
  return (
    <div className={styles.attributesWrap}>
      <table className={styles.attributes}>
        <tbody>
          {attributes.map((attribute) => (
            <AttributeRow key={attribute.name} attribute={attribute} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChangeList({ segment }: { segment: DiffSegment }) {
  const items = [
    ...segment.elements.map((change) => ({
      key: `element-${change.id}`,
      label: change.id,
      kind: change.kind as string,
      status: change.status,
      note: change.proseChanged ? "prose changed" : undefined,
      attributes: change.attributes,
    })),
    ...segment.diagrams.map((change) => ({
      key: `diagram-${change.id}`,
      label: change.id,
      kind: "diagram",
      status: change.status,
      note: undefined,
      attributes: change.attributes,
    })),
  ];
  if (items.length === 0 && !segment.prose) return null;
  return (
    <ul className={styles.changeList} role="list">
      {items.map((item) => (
        <li key={item.key} data-testid="element-change" data-status={item.status}>
          <span className={[styles.chip, STATUS_CLASS[item.status]].join(" ")}>
            {item.status === "unchanged" ? "prose" : item.status}
          </span>
          <span className={styles.kind}>{item.kind}</span>
          <code>{item.label}</code>
          {item.note && item.status === "modified" && (
            <span className={styles.note}>{item.note}</span>
          )}
          <AttributeTable attributes={item.attributes} />
        </li>
      ))}
      {segment.prose && (
        <li data-testid="element-change" data-status={segment.prose.status}>
          <span className={[styles.chip, STATUS_CLASS[segment.prose.status]].join(" ")}>
            {segment.prose.status}
          </span>
          <span className={styles.kind}>prose</span>
        </li>
      )}
    </ul>
  );
}

/** Status of a section — worded apart from the element status chips inside it. */
const SECTION_STATUS: Record<DiffSegment["status"], string> = {
  added: "Section added",
  modified: "Section changed",
  removed: "Section removed",
};

/** How a changed section's content is shown: marked changes, or one of the two versions. */
type SectionVersion = "changes" | "current" | "previous";

const VERSION_LABEL: Record<SectionVersion, string> = {
  changes: "Changes",
  current: "Current",
  previous: "Previous",
};

function VersionSwitch({
  value,
  onChange,
}: {
  value: SectionVersion;
  onChange: (version: SectionVersion) => void;
}) {
  return (
    <span
      className={styles.versionSwitch}
      role="group"
      aria-label="Show"
      data-testid="version-switch"
    >
      {(Object.keys(VERSION_LABEL) as SectionVersion[]).map((version) => (
        <button
          key={version}
          type="button"
          aria-pressed={value === version}
          onClick={() => onChange(version)}
        >
          {VERSION_LABEL[version]}
        </button>
      ))}
    </span>
  );
}

/** One changed section, marked by status, with both versions available. */
export function SegmentView({
  segment,
  viewMode,
  targetElementId,
  onTargetConsumed,
}: {
  segment: DiffSegment;
  viewMode: "human" | "agent";
  targetElementId?: string | null;
  onTargetConsumed?: () => void;
}) {
  const [version, setVersion] = useState<SectionVersion>("changes");
  const path = segment.section.headingPath;
  const title = path[path.length - 1] ?? "Preamble";
  const compared = segment.status === "modified" && segment.base && segment.head;
  const head = (compareTo?: SectionContent) =>
    segment.head && (
      <div data-testid="segment-head" data-version={compareTo ? "changes" : "current"}>
        <SectionRender
          content={segment.head}
          {...(compareTo ? { compareTo } : {})}
          viewMode={viewMode}
          targetElementId={targetElementId}
          onTargetConsumed={onTargetConsumed}
        />
      </div>
    );
  return (
    <section
      className={[styles.segment, STATUS_CLASS[segment.status]].join(" ")}
      data-testid="diff-segment"
      data-status={segment.status}
      aria-label={`${segment.status}: ${title}`}
    >
      <header className={styles.segmentHeader} data-testid="segment-status">
        <span className={styles.sectionStatus}>{SECTION_STATUS[segment.status]}</span>
        {segment.heading && (
          <span className={styles.headingRename} data-testid="segment-heading-change">
            heading <del className={styles.before}>{segment.heading.before}</del>
            <span aria-hidden="true"> → </span>
            <span className={styles.visuallyHidden}> renamed to </span>
            <ins className={styles.after}>{segment.heading.after}</ins>
          </span>
        )}
        {compared && <VersionSwitch value={version} onChange={setVersion} />}
      </header>
      <ChangeList segment={segment} />
      {segment.status === "removed" && segment.base && (
        <div className={styles.removedContent} data-testid="segment-base">
          <SectionRender content={segment.base} viewMode={viewMode} />
        </div>
      )}
      {segment.status === "added" && head()}
      {compared && version === "changes" && head(segment.base)}
      {compared && version === "current" && head()}
      {compared && version === "previous" && (
        <div data-testid="segment-base">
          <SectionRender content={segment.base!} viewMode={viewMode} />
        </div>
      )}
    </section>
  );
}
