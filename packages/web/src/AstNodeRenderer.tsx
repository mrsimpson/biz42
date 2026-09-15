import React, { useMemo, useState } from "react";
import { marked } from "marked";
import type { AstNode, BlockNode, DiagramNode, Element, Edge } from "@biz42/core";
import docStyles from "./DocumentView.module.css";
import styles from "./AstNodeRenderer.module.css";
import { ElementCard, kindColor } from "./ElementCard.tsx";
import { DiagramView } from "./DiagramView.tsx";
import type { Diagram } from "@biz42/core";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProseRunNode {
  kind: "prose-run";
  text: string;
  block: BlockNode | null;
}

export interface AstNodeRendererProps {
  node: AstNode | ProseRunNode;
  viewMode: "human" | "agent";
  elementsMap: Map<string, Element>;
  elementDocMap: Map<string, string>;
  edges: Edge[];
  diagrams?: Diagram[];
  chapterMap?: Map<string, number>;
}

// ─── Main renderer ────────────────────────────────────────────────────────────

export function AstNodeRenderer({
  node,
  viewMode,
  elementsMap,
  elementDocMap,
  edges,
  diagrams = [],
  chapterMap = new Map(),
}: AstNodeRendererProps) {
  switch (node.kind) {
    case "heading": {
      // H1 is the chapter title — it lives in the nav, rendered by DocumentView header
      if (node.level === 1) return null;
      // Shift levels down by one so H2 renders as h1, H3 as h2, etc.
      const Tag = `h${Math.min(node.level, 6)}` as keyof React.JSX.IntrinsicElements;
      const anchor = node.text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      const levelClass =
        [docStyles.heading2, docStyles.heading3, docStyles.heading4][node.level - 2] ??
        docStyles.heading4;
      return (
        <Tag id={anchor} className={[docStyles.heading, levelClass].join(" ")}>
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
          block={runNode.block}
          viewMode={viewMode}
          elementsMap={elementsMap}
          elementDocMap={elementDocMap}
          edges={edges}
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
              elementDocMap={elementDocMap}
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
          chapterMap={chapterMap}
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
  block: BlockNode | null;
  viewMode: "human" | "agent";
  elementsMap: Map<string, Element>;
  elementDocMap: Map<string, string>;
  edges: Edge[];
}

function ProseRun({ text, block, viewMode, elementsMap, elementDocMap, edges }: ProseRunProps) {
  const [showCard, setShowCard] = useState(false);

  // Determine stripe colour from the attached block's element kind
  const stripeColor = useMemo(() => {
    if (!block) return null;
    const elementId = block.attributes["id"] ?? "";
    const el = elementsMap.get(elementId);
    if (!el) return null;
    return kindColor(el.kind);
  }, [block, elementsMap]);

  const hasBlock = block !== null && block.inBiz42Fence;

  // Agent view: show prose source + block source
  if (!hasBlock || viewMode === "agent") {
    return (
      <div className={styles.proseRun}>
        {text && <ProseBlock text={text} />}
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
            elementDocMap={elementDocMap}
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
          {text && <ProseBlock text={text} />}
        </div>
      </div>
    </div>
  );
}

// ─── ProseBlock — renders markdown via marked ─────────────────────────────────

function ProseBlock({ text }: { text: string }) {
  const html = useMemo(() => {
    try {
      return marked.parse(text, { async: false }) as string;
    } catch {
      return `<p>${text}</p>`;
    }
  }, [text]);
  return <div className={docStyles.proseBlock} dangerouslySetInnerHTML={{ __html: html }} />;
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
