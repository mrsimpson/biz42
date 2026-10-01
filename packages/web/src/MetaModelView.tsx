/**
 * MetaModelView — SVG of the biz42 meta-model traceability chain.
 *
 * What comes from core (single source of truth):
 *   - ELEMENT_KIND_ORDER  → node render order + valid BlockType set
 *   - ELEMENT_CHAPTER     → chapter number per kind
 *   - CHAPTER_TITLE       → node label text
 *   - explainElement()    → edges: connections and their field names
 *
 * What lives here (pure rendering concerns):
 *   - NODE_POS            → x/y pixel positions per kind
 *   - SVG sizing constants
 *   - EDGE_OVERRIDES      → face/curve overrides for the subset of edges where
 *                           autoFaces() picks a bad attachment or parallel arrows
 *                           need a bezier nudge (keyed "{fromKind}:{field}:{toKind}")
 *   - SKIP_TARGET_KINDS   → compound targetKind strings that are too visually
 *                           ambiguous to draw (explicit skip-list)
 *
 * Node labels are clickable and navigate to the corresponding chapter doc.
 */

import { ELEMENT_KIND_ORDER, ELEMENT_CHAPTER, CHAPTER_TITLE, explainElement } from "@biz42/core";
import type { BlockType } from "@biz42/core";

// ── SVG layout constants ──────────────────────────────────────────────────────

const NW = 128; // node box width
const NH = 28; // node box height
const RX = 5; // corner radius
const SVG_W = 900;
const SVG_H = 520;

/** Pixel centre [x, y] of each node box — pure layout, no semantic content. */
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
//
// Most edges are fully auto-derived from NODE_POS (faces) and crossRefs (label).
// This table covers the exceptions — edges where autoFaces() picks a bad face
// pair or parallel arrows need a bezier nudge to avoid overlap.
//
// Key: "{fromKind}:{field}:{resolvedToKind}"
// All fields are optional; omitted fields fall back to auto-computed values.
//
// cp:        quadratic bezier control-point offset [dx,dy] from the straight midpoint
// fromFace:  override the exit face on the source node
// toFace:    override the entry face on the target node
// cubic:     use a cubic S-curve bezier (needed when fromFace and toFace share an axis)

type Face = "right" | "left" | "top" | "bottom";

interface EdgeOverride {
  fromFace?: Face;
  toFace?: Face;
  cp?: [number, number];
  cubic?: true;
}

const EDGE_OVERRIDES: Record<string, EdgeOverride> = {
  // ── Parallel surface arrows ───────────────────────────────────────────────
  "signal:surfaces:opportunity": { cp: [0, 28] },
  "expectation:surfaces:risk": { cp: [0, -28] },
  "objective:addresses:opportunity": { cp: [0, 28] },

  // ── owner references — spread across top/bottom to avoid bunching ─────────
  "objective:owner:owner": { fromFace: "right", toFace: "top", cp: [0, -60] },
  "capability:owner:owner": { fromFace: "right", toFace: "bottom", cp: [0, 40] },
  "product:owner:owner": { fromFace: "right", toFace: "bottom", cp: [60, 30] },

  // ── cashflow → capability: S-curve to avoid awkward horizontal entry ──────
  "cashflow:linked-to:capability": { fromFace: "top", toFace: "bottom", cp: [0, -30], cubic: true },

  // ── product → expectation: loop-back arc ─────────────────────────────────
  "product:fulfills:expectation": { fromFace: "left", toFace: "bottom", cp: [-165, 65] },
};

// ── Compound targetKind resolution ───────────────────────────────────────────
//
// crossRef.targetKind can be a compound string like "risk or opportunity".
// We parse it by splitting on " or " and ", " separators and validating each
// token against ELEMENT_KIND_ORDER — no manual mapping needed.
//
// Some compound strings reference too many targets to draw clearly. We skip
// them explicitly rather than trying to route all their arrows.

const SKIP_TARGET_KINDS = new Set([
  "objective, capability, or product", // too many targets, visually ambiguous
]);

const VALID_KINDS = new Set<string>(ELEMENT_KIND_ORDER);

/**
 * Split a crossRef targetKind string into resolved BlockType[].
 * Parses compound strings like "risk or opportunity" → ["risk", "opportunity"].
 * Returns [] for any targetKind in SKIP_TARGET_KINDS.
 * Tokens not in ELEMENT_KIND_ORDER are silently filtered (defensive).
 */
function resolveTargets(targetKind: string): BlockType[] {
  if (SKIP_TARGET_KINDS.has(targetKind)) return [];
  return targetKind
    .split(/,\s*|\s+or\s+/)
    .map((t) => t.trim())
    .filter((t) => VALID_KINDS.has(t)) as BlockType[];
}

// ── Geometry helpers ──────────────────────────────────────────────────────────

/** Top-left x of a node centred at cx */
function lx(cx: number) {
  return cx - NW / 2;
}
/** Top y of a node centred at cy */
function ty(cy: number) {
  return cy - NH / 2;
}

/**
 * Auto-select attachment faces from the relative position of two nodes.
 * Prefers horizontal; falls back to vertical when nodes share a column.
 */
function autoFaces([ax, ay]: [number, number], [bx, by]: [number, number]): [Face, Face] {
  const dx = bx - ax;
  const dy = by - ay;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? ["right", "left"] : ["left", "right"];
  }
  return dy >= 0 ? ["bottom", "top"] : ["top", "bottom"];
}

function attachPoint([cx, cy]: [number, number], face: Face): [number, number] {
  switch (face) {
    case "right":
      return [lx(cx) + NW, cy];
    case "left":
      return [lx(cx), cy];
    case "top":
      return [cx, ty(cy)];
    case "bottom":
      return [cx, ty(cy) + NH];
  }
}

/**
 * Resolved geometry for a bezier edge: endpoints + optional control points.
 * Shared by buildPath() and labelMidpoint() to eliminate duplicated arithmetic.
 */
interface EdgeGeometry {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  // quadratic control point
  qx?: number;
  qy?: number;
  // cubic control points
  cx1?: number;
  cy1?: number;
  cx2?: number;
  cy2?: number;
}

function resolveGeometry(
  from: [number, number],
  to: [number, number],
  fromFace: Face,
  toFace: Face,
  cp?: [number, number],
  cubic?: true,
): EdgeGeometry {
  const [x1, y1] = attachPoint(from, fromFace);
  const [x2, y2] = attachPoint(to, toFace);
  if (!cp) return { x1, y1, x2, y2 };
  if (cubic) {
    return {
      x1,
      y1,
      x2,
      y2,
      cx1: x1 + cp[0],
      cy1: y1 + cp[1],
      cx2: x2 - cp[0],
      cy2: y2 - cp[1],
    };
  }
  return {
    x1,
    y1,
    x2,
    y2,
    qx: (x1 + x2) / 2 + cp[0],
    qy: (y1 + y2) / 2 + cp[1],
  };
}

function buildPath(g: EdgeGeometry): string {
  if (g.cx1 !== undefined) {
    return `M ${g.x1} ${g.y1} C ${g.cx1} ${g.cy1} ${g.cx2} ${g.cy2} ${g.x2} ${g.y2}`;
  }
  if (g.qx !== undefined) {
    return `M ${g.x1} ${g.y1} Q ${g.qx} ${g.qy} ${g.x2} ${g.y2}`;
  }
  return `M ${g.x1} ${g.y1} L ${g.x2} ${g.y2}`;
}

function labelMidpoint(g: EdgeGeometry): [number, number] {
  if (g.cx1 !== undefined) {
    // t=0.5 on cubic bezier: (1/8)P0 + (3/8)P1 + (3/8)P2 + (1/8)P3
    return [
      0.125 * g.x1 + 0.375 * g.cx1! + 0.375 * g.cx2! + 0.125 * g.x2,
      0.125 * g.y1 + 0.375 * g.cy1! + 0.375 * g.cy2! + 0.125 * g.y2,
    ];
  }
  if (g.qx !== undefined) {
    // t=0.5 on quadratic bezier: (1/4)P0 + (1/2)P1 + (1/4)P2
    return [0.25 * g.x1 + 0.5 * g.qx + 0.25 * g.x2, 0.25 * g.y1 + 0.5 * g.qy! + 0.25 * g.y2];
  }
  return [(g.x1 + g.x2) / 2, (g.y1 + g.y2) / 2];
}

// ── Build edges from core crossRefs ───────────────────────────────────────────

interface RenderedEdge {
  path: string;
  label: string;
  labelX: number;
  labelY: number;
}

function buildEdges(): RenderedEdge[] {
  const rendered: RenderedEdge[] = [];

  for (const kind of ELEMENT_KIND_ORDER) {
    const { crossRefs } = explainElement(kind);

    for (const ref of crossRefs) {
      for (const targetKind of resolveTargets(ref.targetKind)) {
        if (targetKind === kind) continue; // skip self-references

        const fromPos = NODE_POS[kind];
        const toPos = NODE_POS[targetKind];
        if (!fromPos || !toPos) continue;

        const override = EDGE_OVERRIDES[`${kind}:${ref.field}:${targetKind}`];
        const [autoFrom, autoTo] = autoFaces(fromPos, toPos);
        const fromFace = override?.fromFace ?? autoFrom;
        const toFace = override?.toFace ?? autoTo;

        const geo = resolveGeometry(
          fromPos,
          toPos,
          fromFace,
          toFace,
          override?.cp,
          override?.cubic,
        );
        const [lmx, lmy] = labelMidpoint(geo);

        rendered.push({
          path: buildPath(geo),
          label: ref.field,
          labelX: lmx,
          labelY: lmy - 3,
        });
      }
    }
  }

  return rendered;
}

// ── Component ─────────────────────────────────────────────────────────────────

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

interface MetaModelViewProps {
  /** Navigate to the document for a given biz42 chapter number (1-13). */
  onNavigateToChapter: (chapter: number) => void;
}

export function MetaModelView({ onNavigateToChapter }: MetaModelViewProps) {
  const edges = buildEdges();

  return (
    <div style={{ padding: "2rem", maxWidth: "920px", margin: "0 auto" }}>
      <h1 style={headingStyle}>Meta-model</h1>
      <p style={subStyle}>
        How the 13 biz42 element kinds relate to each other. Click any node to open the
        corresponding chapter.
      </p>

      <div
        style={wrapStyle}
        role="img"
        aria-label="biz42 meta-model: signals and expectations surface risks and opportunities, which objectives address; objectives require capabilities that enable products; products fulfill expectations"
      >
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ display: "block", minWidth: "600px" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <marker id="mm-arr" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
              <path d="M0,0.5 L0,5.5 L7,3 z" fill="var(--text-muted)" />
            </marker>
          </defs>

          {/* Scope bounding bracket */}
          <rect
            x={lx(NODE_POS.scope[0]) - 10}
            y={ty(NODE_POS.scope[1]) - 18}
            width={NW + 20}
            height={SVG_H - ty(NODE_POS.scope[1]) + 10}
            rx={8}
            fill="none"
            stroke="var(--c-scope)"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            opacity={0.35}
          />
          <text
            x={NODE_POS.scope[0]}
            y={ty(NODE_POS.scope[1]) - 5}
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

          {/* Edges — drawn first so nodes appear on top */}
          {edges.map((e, i) => (
            <g key={i}>
              <path
                d={e.path}
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth={1.2}
                markerEnd="url(#mm-arr)"
                opacity={0.5}
              />
              <text
                x={e.labelX}
                y={e.labelY}
                textAnchor="middle"
                fontSize={7.5}
                fill="var(--text-muted)"
                fontFamily="var(--font-mono)"
                opacity={0.85}
              >
                {e.label}
              </text>
            </g>
          ))}

          {/* Nodes — each is a clickable group navigating to its chapter */}
          {ELEMENT_KIND_ORDER.map((kind) => {
            const [cx, cy] = NODE_POS[kind];
            const ch = ELEMENT_CHAPTER[kind];
            const label = CHAPTER_TITLE[ch] ?? kind;
            const color = `var(--c-${kind})`;
            return (
              <g
                key={kind}
                onClick={() => onNavigateToChapter(ch)}
                style={{ cursor: "pointer" }}
                role="button"
                aria-label={`Go to chapter ${ch}: ${label}`}
              >
                <rect
                  x={lx(cx)}
                  y={ty(cy)}
                  width={NW}
                  height={NH}
                  rx={RX}
                  fill={color}
                  fillOpacity={0.12}
                  stroke={color}
                  strokeWidth={1.5}
                />
                {/* Invisible wider hit area for easier clicking */}
                <rect
                  x={lx(cx) - 4}
                  y={ty(cy) - 4}
                  width={NW + 8}
                  height={NH + 8}
                  rx={RX + 2}
                  fill="transparent"
                />
                <text
                  x={cx}
                  y={cy + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={10.5}
                  fontWeight={600}
                  fontFamily="var(--font-sans)"
                  fill={color}
                  style={{ pointerEvents: "none" }}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
