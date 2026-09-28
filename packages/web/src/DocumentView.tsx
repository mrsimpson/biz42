import React, { useMemo } from "react";
import type {
  AstNode,
  ProseNode,
  BlockNode,
  HeadingNode,
  DocumentAst,
  Element,
  Edge,
  Diagram,
  DiffDocument,
} from "@biz42/core";
import styles from "./DocumentView.module.css";
import { AstNodeRenderer } from "./AstNodeRenderer.tsx";
import type { ProseRunNode } from "./AstNodeRenderer.tsx";
import { ChapterDiff } from "./ChapterDiff.tsx";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A render group is either:
 * - A prose-run: one or more consecutive ProseNodes merged into a single string,
 *   optionally followed by a biz42 BlockNode that is "attached" to that prose.
 * - An "other" node: heading, diagram, bare-mermaid, ignore, or standalone block.
 *
 * Grouping is required for two reasons:
 *  1. Tables: the parser emits one ProseNode per source line. If each line is
 *     rendered independently, table rows never assemble into a <table>. Merging
 *     the run and passing the full text to marked restores table rendering.
 *  2. Collapsible cards: the biz42 BlockNode that follows a prose paragraph
 *     should be attached to it — the prose gets a clickable stripe that
 *     expands/collapses the element card below.
 */
type RenderGroup =
  | { kind: "prose-run"; text: string; block: BlockNode | null }
  | { kind: "other"; node: AstNode };

export function groupNodes(nodes: AstNode[]): RenderGroup[] {
  const groups: RenderGroup[] = [];
  let proseLines: string[] = [];
  let i = 0;

  function flushProse(attachedBlock: BlockNode | null) {
    if (proseLines.length === 0 && !attachedBlock) return;
    groups.push({
      kind: "prose-run",
      text: proseLines.join("\n"),
      block: attachedBlock,
    });
    proseLines = [];
  }

  while (i < nodes.length) {
    const node = nodes[i]!;

    if (node.kind === "prose") {
      proseLines.push((node as ProseNode).text);
      i++;

      // Check if the next non-ignore node is a biz42 block — if so, attach it
      let j = i;
      while (nodes[j]?.kind === "ignore") j++;
      const next = nodes[j];
      if (next && next.kind === "block" && (next as BlockNode).inBiz42Fence) {
        flushProse(next as BlockNode);
        i = j + 1; // skip past the block (and any ignores before it)
      }
      // Otherwise keep accumulating prose lines
      continue;
    }

    // Non-prose node — flush any pending prose first (no attached block)
    if (proseLines.length > 0) {
      flushProse(null);
    }

    if (node.kind === "ignore") {
      // Standalone ignore directive — skip in human view, handled by agent view
      i++;
      continue;
    }

    if (node.kind === "block" && (node as BlockNode).inBiz42Fence) {
      // biz42 block with no preceding prose — emit as prose-run with empty text
      groups.push({ kind: "prose-run", text: "", block: node as BlockNode });
    } else {
      groups.push({ kind: "other", node });
    }
    i++;
  }

  // Flush any remaining prose lines
  if (proseLines.length > 0) {
    flushProse(null);
  }

  return groups;
}

// ─── DocumentView ─────────────────────────────────────────────────────────────

interface DocumentViewProps {
  doc: DocumentAst;
  viewMode: "human" | "agent";
  elementsMap: Map<string, Element>;
  elementDocMap: Map<string, string>;
  edges: Edge[];
  diagrams: Diagram[];
  chapterMap: Map<string, number>;
  targetElementId?: string | null;
  onTargetConsumed?: () => void;
  /** The changes of a visualized difference to this document: shown inline. */
  diffDocument?: DiffDocument;
}

/**
 * The document — with its changes inline when a visualized difference touches
 * it. A separate component per mode keeps each one's hooks stable.
 */
export function DocumentView(props: DocumentViewProps) {
  const { diffDocument } = props;
  if (diffDocument) {
    return (
      <ChapterDiff
        diff={diffDocument}
        context={{
          document: props.doc,
          elementsMap: props.elementsMap,
          elementDocMap: props.elementDocMap,
          edges: props.edges,
          diagrams: props.diagrams,
        }}
        viewMode={props.viewMode}
        targetElementId={props.targetElementId ?? null}
        onTargetConsumed={props.onTargetConsumed}
      />
    );
  }
  return <PlainDocumentView {...props} />;
}

function PlainDocumentView({
  doc,
  viewMode,
  elementsMap,
  elementDocMap,
  edges,
  diagrams,
  chapterMap,
  targetElementId = null,
  onTargetConsumed,
}: DocumentViewProps) {
  const groups = useMemo(() => groupNodes(doc.nodes), [doc]);

  const chapterTitle = useMemo(() => {
    const h1 = doc.nodes.find(
      (n): n is HeadingNode => n.kind === "heading" && (n as HeadingNode).level === 1,
    );
    return h1?.text.trim() ?? null;
  }, [doc]);

  return (
    <article className={styles.documentView}>
      {chapterTitle && (
        <h1 className={[styles.heading, styles.heading1, styles.chapterTitle].join(" ")}>
          {chapterTitle}
        </h1>
      )}
      {groups.map((group, i) => {
        if (group.kind === "other") {
          return (
            <AstNodeRenderer
              key={i}
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
        // prose-run (with optional attached biz42 block)
        const blockId = group.block?.attributes["id"] ?? null;
        const proseRunNode: ProseRunNode = {
          kind: "prose-run",
          text: group.text,
          block: group.block,
        };
        return (
          <AstNodeRenderer
            key={i}
            node={proseRunNode}
            viewMode={viewMode}
            elementsMap={elementsMap}
            elementDocMap={elementDocMap}
            edges={edges}
            diagrams={diagrams}
            chapterMap={chapterMap}
            targetElementId={blockId === targetElementId ? targetElementId : null}
            onTargetConsumed={blockId === targetElementId ? onTargetConsumed : undefined}
          />
        );
      })}
    </article>
  );
}
