import { useMemo } from "react";
import { groupNodes as groupDocumentNodes } from "@cli42/lib/web";
import type { ElementLinks, RenderGroup } from "@cli42/lib/web";
import { ChapterDiff, headingClass } from "@cli42/lib/web-react";
import type { RenderNodesProps } from "@cli42/lib/web-react";
import type {
  AstNode,
  BlockNode,
  HeadingNode,
  IgnoreNode,
  DocumentAst,
  Element,
  Edge,
  Diagram,
  DiffDocument,
} from "@biz42/core";
import styles from "./DocumentView.module.css";
import { AstNodeRenderer } from "./AstNodeRenderer.tsx";
import type { ProseRunNode } from "./AstNodeRenderer.tsx";

/** Whether a node is a biz42 block, introduced by the prose before it. */
export function isBiz42Block(node: { kind: string }): node is BlockNode {
  return node.kind === "block" && (node as BlockNode).inBiz42Fence;
}

/**
 * Prose runs and other nodes of a document (see `groupNodes` of @cli42/lib/web):
 * consecutive prose renders as one (tables), and the biz42 block that follows
 * a paragraph is attached to it (the prose stripe opens its card).
 */
export function groupNodes(
  nodes: readonly AstNode[],
): RenderGroup<AstNode, BlockNode, IgnoreNode>[] {
  return groupDocumentNodes<AstNode, BlockNode, IgnoreNode>(nodes, { isBlock: isBiz42Block });
}

/** The workspace the Documents view renders nodes of. */
export interface NodesWorkspace {
  elementsMap: Map<string, Element>;
  links: ElementLinks;
  edges: Edge[];
  diagrams: Diagram[];
}

/**
 * Render document nodes the way the Documents view does. The shared views of
 * @cli42/lib/web-react call this for unchanged and changed sections; a diff
 * side (`content`) brings its own elements, edges and diagrams.
 */
export function NodesRender({
  nodes,
  proseHtml,
  content,
  viewMode,
  targetElementId = null,
  onTargetConsumed,
  workspace,
}: RenderNodesProps & { workspace: NodesWorkspace }) {
  const own = useMemo<NodesWorkspace>(() => {
    if (!content) return workspace;
    const elements = content.elements as Element[];
    return {
      elementsMap: new Map(elements.map((element) => [element.id, element])),
      links: workspace.links,
      edges: content.edges as Edge[],
      diagrams: (content.diagrams ?? []) as Diagram[],
    };
  }, [content, workspace]);
  const groups = useMemo(() => groupNodes(nodes as AstNode[]), [nodes]);
  let run = 0;
  return (
    <>
      {groups.map((group, i) => {
        if (group.kind === "other") {
          return (
            <AstNodeRenderer
              key={i}
              node={group.node}
              viewMode={viewMode}
              elementsMap={own.elementsMap}
              links={own.links}
              edges={own.edges}
              diagrams={own.diagrams}
            />
          );
        }
        // prose-run (with optional attached biz42 block)
        const blockId = group.block?.attributes["id"] ?? null;
        const proseRunNode: ProseRunNode = {
          kind: "prose-run",
          text: group.text,
          renderedHtml: proseHtml?.[run++] ?? group.renderedHtml,
          block: group.block,
        };
        return (
          <AstNodeRenderer
            key={i}
            node={proseRunNode}
            viewMode={viewMode}
            elementsMap={own.elementsMap}
            links={own.links}
            edges={own.edges}
            diagrams={own.diagrams}
            targetElementId={blockId === targetElementId ? targetElementId : null}
            onTargetConsumed={blockId === targetElementId ? onTargetConsumed : undefined}
          />
        );
      })}
    </>
  );
}

interface DocumentViewProps extends NodesWorkspace {
  doc: DocumentAst;
  viewMode: "human" | "agent";
  targetElementId?: string | null;
  onTargetConsumed?: () => void;
  /** The changes of a visualized difference to this document: shown inline. */
  diffDocument?: DiffDocument;
}

/**
 * The document — with its changes inline when a visualized difference touches
 * it.
 */
export function DocumentView(props: DocumentViewProps) {
  const { diffDocument } = props;
  if (diffDocument) {
    return (
      <ChapterDiff
        diff={diffDocument}
        document={props.doc}
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
  links,
  edges,
  diagrams,
  targetElementId = null,
  onTargetConsumed,
}: DocumentViewProps) {
  const workspace = useMemo(
    () => ({ elementsMap, links, edges, diagrams }),
    [elementsMap, links, edges, diagrams],
  );
  const chapterTitle = useMemo(() => {
    const h1 = doc.nodes.find(
      (n): n is HeadingNode => n.kind === "heading" && (n as HeadingNode).level === 1,
    );
    return h1?.text.trim() ?? null;
  }, [doc]);

  return (
    <article className={styles.documentView}>
      {chapterTitle && (
        <h1 className={[headingClass(1), styles.chapterTitle].join(" ")}>{chapterTitle}</h1>
      )}
      <NodesRender
        nodes={doc.nodes}
        viewMode={viewMode}
        targetElementId={targetElementId}
        onTargetConsumed={onTargetConsumed}
        workspace={workspace}
      />
    </article>
  );
}
