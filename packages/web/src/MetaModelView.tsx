/**
 * MetaModelView — biz42 meta-model traceability diagram.
 *
 * Rendering primitives (MetaModelDiagram, autoFaces, resolveGeometry, etc.)
 * come from @cli42/lib/web-react. This file owns only biz42-specific data:
 *   - NODE_POS         → pixel positions per kind
 *   - EDGE_OVERRIDES   → face/curve corrections for visually problematic edges
 *   - SKIP_TARGET_KINDS → compound targetKind strings too ambiguous to draw
 *   - data derivation from @biz42/core
 *
 * The scope bounding bracket is rendered inline inside the SVG via a custom
 * wrapper, since MetaModelDiagram does not have an overlay API.
 */

import { MetaModelDiagram, autoFaces, NODE_W, NODE_H } from "@cli42/lib/web-react";
import type { DiagramNode, DiagramEdge, Face } from "@cli42/lib/web-react";
import { ELEMENT_KIND_ORDER, ELEMENT_CHAPTER, CHAPTER_TITLE, explainElement } from "@biz42/core";
import type { BlockType } from "@biz42/core";

// ── SVG layout ────────────────────────────────────────────────────────────────

const SVG_W = 900;
const SVG_H = 520;

const NODE_POS: Record<BlockType, [number, number]> = {
  scope: [74, 40],
  signal: [74, 110],
  expectation: [74, 178],
  risk: [260, 110],
  opportunity: [260, 178],
  objective: [452, 110],
  measure: [644, 110],
  owner: [644, 268],
  capability: [452, 348],
  product: [452, 440],
  evaluation: [826, 110],
  improvement: [826, 440],
  cashflow: [260, 440],
};

// ── Edge overrides ────────────────────────────────────────────────────────────

interface EdgeOverride {
  fromFace?: Face;
  toFace?: Face;
  cp?: [number, number];
  cubic?: true;
}

const EDGE_OVERRIDES: Record<string, EdgeOverride> = {
  "signal:surfaces:opportunity": { cp: [0, 28] },
  "expectation:surfaces:risk": { cp: [0, -28] },
  "objective:addresses:opportunity": { cp: [0, 28] },
  "objective:owner:owner": { fromFace: "right", toFace: "top", cp: [0, -60] },
  "capability:owner:owner": { fromFace: "right", toFace: "bottom", cp: [0, 40] },
  "product:owner:owner": { fromFace: "right", toFace: "bottom", cp: [60, 30] },
  "cashflow:linked-to:capability": { fromFace: "top", toFace: "bottom", cp: [0, -30], cubic: true },
  "product:fulfills:expectation": { fromFace: "left", toFace: "bottom", cp: [-165, 65] },
};

// ── Compound targetKind resolution ────────────────────────────────────────────

const SKIP_TARGET_KINDS = new Set(["objective, capability, or product"]);
const VALID_KINDS = new Set<string>(ELEMENT_KIND_ORDER);

function resolveTargets(targetKind: string): BlockType[] {
  if (SKIP_TARGET_KINDS.has(targetKind)) return [];
  return targetKind
    .split(/,\s*|\s+or\s+/)
    .map((t) => t.trim())
    .filter((t) => VALID_KINDS.has(t)) as BlockType[];
}

// ── Build nodes and edges from @biz42/core ────────────────────────────────────

function buildNodes(): DiagramNode[] {
  return ELEMENT_KIND_ORDER.map((kind) => {
    const ch = ELEMENT_CHAPTER[kind];
    return {
      id: kind,
      label: CHAPTER_TITLE[ch] ?? kind,
      x: NODE_POS[kind][0],
      y: NODE_POS[kind][1],
      color: `var(--c-${kind})`,
      chapter: ch,
    };
  });
}

function buildEdges(): DiagramEdge[] {
  const edges: DiagramEdge[] = [];

  for (const kind of ELEMENT_KIND_ORDER) {
    const { crossRefs } = explainElement(kind);
    for (const ref of crossRefs) {
      for (const targetKind of resolveTargets(ref.targetKind)) {
        if (targetKind === kind) continue;

        const fromPos = NODE_POS[kind];
        const toPos = NODE_POS[targetKind];
        if (!fromPos || !toPos) continue;

        const override = EDGE_OVERRIDES[`${kind}:${ref.field}:${targetKind}`];
        const [autoFrom, autoTo] = autoFaces(fromPos, toPos);

        edges.push({
          from: kind,
          to: targetKind,
          label: ref.field,
          fromFace: override?.fromFace ?? autoFrom,
          toFace: override?.toFace ?? autoTo,
          cp: override?.cp,
          cubic: override?.cubic,
        });
      }
    }
  }

  return edges;
}

// ── Scope bracket overlay ─────────────────────────────────────────────────────
// The scope bounding bracket is biz42-specific (scope contains all other elements).
// We render a custom SVG wrapper that adds it as a background layer.

function lx(cx: number) {
  return cx - NODE_W / 2;
}
function ty(cy: number) {
  return cy - NODE_H / 2;
}

interface BizMetaModelDiagramProps {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  width: number;
  height: number;
  onNodeClick?: (id: string) => void;
  ariaLabel?: string;
}

function BizMetaModelDiagram({
  nodes,
  edges,
  width,
  height,
  onNodeClick,
  ariaLabel,
}: BizMetaModelDiagramProps) {
  const [cx, cy] = NODE_POS.scope;
  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{
          display: "block",
          minWidth: "600px",
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x={lx(cx) - 10}
          y={ty(cy) - 18}
          width={NODE_W + 20}
          height={height - ty(cy) + 10}
          rx={8}
          fill="none"
          stroke="var(--c-scope)"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          opacity={0.35}
        />
        <text
          x={cx}
          y={ty(cy) - 5}
          textAnchor="middle"
          fontSize={8}
          fill="var(--c-scope)"
          fontFamily="var(--font-mono)"
          fontWeight={700}
          letterSpacing="0.1em"
          opacity={0.6}
        >
          SCOPE
        </text>
      </svg>
      <MetaModelDiagram
        nodes={nodes}
        edges={edges}
        width={width}
        height={height}
        onNodeClick={onNodeClick}
        ariaLabel={ariaLabel}
      />
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const headingStyle: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 700,
  marginBottom: "0.25rem",
  color: "var(--text)",
};

const subStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--text-muted)",
  marginBottom: "1.5rem",
};

const wrapStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  background: "var(--bg-card)",
  padding: "1rem",
  overflowX: "auto",
};

// ── Component ─────────────────────────────────────────────────────────────────

interface MetaModelViewProps {
  onNavigateToChapter: (chapter: number) => void;
}

export function MetaModelView({ onNavigateToChapter }: MetaModelViewProps) {
  const nodes = buildNodes();
  const edges = buildEdges();

  return (
    <div style={{ padding: "2rem", maxWidth: "920px", margin: "0 auto" }}>
      <h1 style={headingStyle}>Meta-model</h1>
      <p style={subStyle}>
        How the 13 biz42 element kinds relate to each other. Click any node to open the
        corresponding chapter.
      </p>
      <div style={wrapStyle}>
        <BizMetaModelDiagram
          nodes={nodes}
          edges={edges}
          width={SVG_W}
          height={SVG_H}
          onNodeClick={(id) => {
            const ch = ELEMENT_CHAPTER[id as BlockType];
            if (ch !== undefined) onNavigateToChapter(ch);
          }}
          ariaLabel="biz42 meta-model: signals and expectations surface risks and opportunities, which objectives address; objectives require capabilities that enable products; products fulfill expectations"
        />
      </div>
    </div>
  );
}
