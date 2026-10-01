import React, { useMemo, useState, useEffect } from "react";
import { marked } from "marked";
import type { AstNode, BlockNode, DiagramNode, Element, Edge } from "@biz42/core";
import docStyles from "./DocumentView.module.css";
import styles from "./AstNodeRenderer.module.css";
import { ElementCard, elementColor } from "./ElementCard.tsx";
import { DiagramView } from "./DiagramView.tsx";
import type { Diagram } from "@biz42/core";
import type { ElementLinks } from "@cli42/lib/web";
import { slug } from "@cli42/lib/web";
import { headingClass } from "@cli42/lib/web-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProseRunNode {
  kind: "prose-run";
  text: string;
  /** Pre-rendered HTML of the text (e.g. with changed words marked); rendered from `text` when absent. */
  renderedHtml?: string;
  block: BlockNode | null;
}

export interface AstNodeRendererProps {
  node: AstNode | ProseRunNode;
  viewMode: "human" | "agent";
  elementsMap: Map<string, Element>;
  links: ElementLinks;
  edges: Edge[];
  diagrams?: Diagram[];
  /** Element id to auto-expand when this renderer mounts/updates */
  targetElementId?: string | null;
  onTargetConsumed?: () => void;
}

// ─── Main renderer ────────────────────────────────────────────────────────────

export function AstNodeRenderer({
  node,
  viewMode,
  elementsMap,
  links,
  edges,
  diagrams = [],
  targetElementId,
  onTargetConsumed,
}: AstNodeRendererProps) {
  switch (node.kind) {
    case "heading": {
      // H1 is the chapter title — it lives in the nav, rendered by DocumentView header
      if (node.level === 1) return null;
      // Shift levels down by one so H2 renders as h1, H3 as h2, etc.
      const Tag = `h${Math.min(node.level, 6)}` as keyof React.JSX.IntrinsicElements;
      return (
        <Tag id={slug(node.text)} className={headingClass(node.level + 1)}>
          {node.text}
        </Tag>
      );
    }

    case "prose": {
      return <ProseBlock text={node.text} />;
    }

    case "prose-run": {
      const runNode = node as ProseRunNode;
      return (
        <ProseRun
          text={runNode.text}
          renderedHtml={runNode.renderedHtml}
          block={runNode.block}
          viewMode={viewMode}
          elementsMap={elementsMap}
          links={links}
          edges={edges}
          targetElementId={targetElementId ?? null}
          onTargetConsumed={onTargetConsumed}
        />
      );
    }

    case "block": {
      const blockNode = node as BlockNode;
      if (!blockNode.inBiz42Fence) {
        return (
          <pre className={styles.codeBlock}>
            <code>{reconstructBlockSource(blockNode)}</code>
          </pre>
        );
      }
      // biz42 block without preceding prose — render card or agent block
      if (viewMode === "human") {
        return (
          <div style={{ margin: "1em 0" }}>
            <ElementCard
              elementId={blockNode.attributes["id"] ?? ""}
              elementsMap={elementsMap}
              links={links}
              edges={edges}
            />
          </div>
        );
      }
      return <AgentBlock source={reconstructBlockSource(blockNode)} />;
    }

    case "ignore":
      if (viewMode === "agent") {
        const reason = node.reason ? ` ${node.reason}` : "";
        return <AgentBlock source={`:::ignore ${node.ruleCode}${reason} :::`} />;
      }
      return null;

    case "diagram": {
      const diagramNode = node as DiagramNode;
      // Find the Diagram model object matching this AST node by id
      const diagram = diagrams.find((d) => d.id === diagramNode.id) ?? null;
      if (!diagram) {
        // Fallback: render raw source
        if (viewMode === "agent") {
          return <AgentBlock source={diagramNode.source} lang="mermaid" />;
        }
        return null;
      }
      return (
        <DiagramView
          diagram={diagram}
          elements={[...elementsMap.values()]}
          links={links}
          agentView={viewMode === "agent"}
        />
      );
    }

    case "bare-mermaid": {
      const source = (node as { kind: "bare-mermaid"; source: string }).source;
      if (viewMode === "agent") {
        return <AgentBlock source={source} lang="mermaid" />;
      }
      // Bare mermaid: render inline using DiagramView with a synthetic Diagram
      // For simplicity, render as a code block in human view too (no :::diagram metadata)
      return (
        <pre className={styles.codeBlock}>
          <code className="language-mermaid">{source}</code>
        </pre>
      );
    }

    default:
      return null;
  }
}

// ─── ProseRun — prose with optional collapsible block card ────────────────────

interface ProseRunProps {
  text: string;
  renderedHtml?: string;
  block: BlockNode | null;
  viewMode: "human" | "agent";
  elementsMap: Map<string, Element>;
  links: ElementLinks;
  edges: Edge[];
  targetElementId: string | null;
  onTargetConsumed?: () => void;
}

function ProseRun({
  text,
  renderedHtml,
  block,
  viewMode,
  elementsMap,
  links,
  edges,
  targetElementId,
  onTargetConsumed,
}: ProseRunProps) {
  const blockId = block?.attributes["id"] ?? null;
  const autoExpand = targetElementId !== null && blockId === targetElementId;
  const [showCard, setShowCard] = useState(autoExpand);

  // Auto-expand and scroll when targetElementId matches this block
  useEffect(() => {
    if (autoExpand && block !== null) {
      setShowCard(true);
      onTargetConsumed?.();
      // Scroll after React renders the card
      const id = block.attributes["id"] ?? "";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById(`el-${id}`)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      });
    }
  }, [autoExpand]); // eslint-disable-line react-hooks/exhaustive-deps

  // Determine stripe colour from the attached block's element kind
  const stripeColor = useMemo(() => {
    if (!block) return null;
    const elementId = block.attributes["id"] ?? "";
    const el = elementsMap.get(elementId);
    if (!el) return null;
    return elementColor(el);
  }, [block, elementsMap]);

  const hasBlock = block !== null && block.inBiz42Fence;

  // Agent view: show prose source + block source
  if (!hasBlock || viewMode === "agent") {
    return (
      <div className={styles.proseRun}>
        {(text || renderedHtml) && <ProseBlock text={text} html={renderedHtml} />}
        {hasBlock && viewMode === "agent" && <AgentBlock source={reconstructBlockSource(block!)} />}
      </div>
    );
  }

  // Human view with card expanded: full-width card, stripe is the dismiss button
  const color = stripeColor ?? "var(--c-ch0)";

  if (showCard) {
    return (
      <div className={[styles.proseRun, styles.proseRunCardExpanded].join(" ")}>
        <div className={styles.cardView}>
          <ElementCard
            elementId={block.attributes["id"] ?? ""}
            elementsMap={elementsMap}
            links={links}
            edges={edges}
            accentColor={color}
            onDismiss={() => setShowCard(false)}
          />
        </div>
      </div>
    );
  }

  // Human view with card collapsed: narrow stripe + prose text
  return (
    <div className={[styles.proseRun, styles.proseRunHasBlock].join(" ")}>
      <button
        data-testid="prose-stripe"
        className={styles.stripe}
        style={{ backgroundColor: color }}
        onClick={() => setShowCard(true)}
        title="Show element details"
        aria-expanded={false}
      />
      <div className={styles.content}>
        <div data-testid="prose-view" className={styles.proseView}>
          {(text || renderedHtml) && <ProseBlock text={text} html={renderedHtml} />}
        </div>
      </div>
    </div>
  );
}

// ─── ProseBlock — renders markdown via marked ─────────────────────────────────

/** Render Markdown prose to HTML. */
export function renderProse(text: string): string {
  try {
    return marked.parse(text, { async: false }) as string;
  } catch {
    return `<p>${text}</p>`;
  }
}

function ProseBlock({ text, html }: { text: string; html?: string }) {
  const rendered = useMemo(() => html ?? renderProse(text), [text, html]);
  return <div className={docStyles.proseBlock} dangerouslySetInnerHTML={{ __html: rendered }} />;
}

// ─── AgentBlock — dark code block ────────────────────────────────────────────

function AgentBlock({ source, lang = "biz42" }: { source: string; lang?: string }) {
  return (
    <pre data-testid="agent-block" className={styles.agentBlock}>
      <code className={`language-${lang}`}>{source}</code>
    </pre>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function reconstructBlockSource(node: BlockNode): string {
  const lines: string[] = [`:::${node.blockType}`];
  for (const [key, val] of Object.entries(node.attributes)) {
    lines.push(`${key}: ${val}`);
  }
  lines.push(":::");
  return lines.join("\n");
}
