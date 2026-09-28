import { ELEMENTS, ELEMENT_COLOR, type ElementKind } from "../metamodel";

const W = 140;
const H = 48;
const COL = { a: 25, b: 220, c: 415, d: 610, e: 805 };
const ROW = { top: 40, one: 130, two: 230, bottom: 360 };

interface Placed {
  kind: ElementKind;
  x: number;
  y: number;
  width?: number;
  label?: string;
}

const NODES: Placed[] = [
  { kind: "signal", x: COL.a, y: ROW.one },
  { kind: "expectation", x: COL.a, y: ROW.two },
  { kind: "risk", x: COL.b, y: ROW.one },
  { kind: "opportunity", x: COL.b, y: ROW.two },
  { kind: "objective", x: COL.c, y: ROW.one },
  { kind: "measure", x: COL.c, y: ROW.two },
  { kind: "owner", x: COL.c, y: ROW.top, width: COL.e + W - COL.c },
  { kind: "capability", x: COL.d, y: ROW.one },
  { kind: "product", x: COL.e, y: ROW.one, label: "Products" },
  { kind: "improvement", x: COL.a, y: ROW.bottom },
  { kind: "evaluation", x: COL.c, y: ROW.bottom },
];

interface Edge {
  /** SVG path; the arrow head sits at its end. */
  d: string;
  label?: { text: string; x: number; y: number; anchor?: "start" | "middle" };
}

const right = (x: number) => x + W;
const mid = (x: number) => x + W / 2;
const bottom = (y: number) => y + H;

/** Every edge points from the block that holds the field to the element it references. */
const EDGES: Edge[] = [
  // surfaces: signal / expectation → risk / opportunity
  {
    d: `M${right(COL.a)},${ROW.one + 16} L${COL.b},${ROW.one + 16}`,
    label: { text: "surfaces", x: 192, y: ROW.one - 6 },
  },
  { d: `M${right(COL.a)},${ROW.one + 32} L${COL.b},${ROW.two + 16}` },
  { d: `M${right(COL.a)},${ROW.two + 16} L${COL.b},${ROW.one + 32}` },
  { d: `M${right(COL.a)},${ROW.two + 32} L${COL.b},${ROW.two + 32}` },
  // addresses: objective → risk / opportunity
  {
    d: `M${COL.c},${ROW.one + 16} L${right(COL.b)},${ROW.one + 16}`,
    label: { text: "addresses", x: 387, y: ROW.one - 6 },
  },
  { d: `M${COL.c},${ROW.one + 32} L${right(COL.b)},${ROW.two + 24}` },
  // requires, enables
  {
    d: `M${right(COL.c)},${ROW.one + 24} L${COL.d},${ROW.one + 24}`,
    label: { text: "requires", x: 582, y: ROW.one + 17 },
  },
  {
    d: `M${right(COL.d)},${ROW.one + 24} L${COL.e},${ROW.one + 24}`,
    label: { text: "enables", x: 777, y: ROW.one + 17 },
  },
  // owner: objective, capability, product → owner
  {
    d: `M${mid(COL.c)},${ROW.one} L${mid(COL.c)},${bottom(ROW.top)}`,
    label: { text: "owner", x: mid(COL.c) + 7, y: ROW.one - 16, anchor: "start" },
  },
  { d: `M${mid(COL.d)},${ROW.one} L${mid(COL.d)},${bottom(ROW.top)}` },
  { d: `M${mid(COL.e)},${ROW.one} L${mid(COL.e)},${bottom(ROW.top)}` },
  // measured-by: objective → measure
  {
    d: `M${mid(COL.c)},${bottom(ROW.one)} L${mid(COL.c)},${ROW.two}`,
    label: { text: "measured-by", x: mid(COL.c) + 7, y: ROW.two - 18, anchor: "start" },
  },
  // fulfills: product → expectation
  {
    d: `M${mid(COL.e)},${bottom(ROW.one)} L${mid(COL.e)},320 L${mid(COL.a)},320 L${mid(COL.a)},${bottom(ROW.two)}`,
    label: { text: "fulfills", x: 740, y: 313 },
  },
  // evaluates: evaluation → measure
  {
    d: `M${mid(COL.c)},${ROW.bottom} L${mid(COL.c)},${bottom(ROW.two)}`,
    label: { text: "evaluates", x: mid(COL.c) + 7, y: ROW.bottom - 12, anchor: "start" },
  },
  // triggered-by: improvement → evaluation
  {
    d: `M${right(COL.a)},${ROW.bottom + 24} L${COL.c},${ROW.bottom + 24}`,
    label: { text: "triggered-by", x: 290, y: ROW.bottom + 17 },
  },
  // addresses: improvement → objective / capability / product — the loop back
  {
    d: `M${mid(COL.a)},${bottom(ROW.bottom)} L${mid(COL.a)},450 L${mid(COL.d)},450 L${mid(COL.d)},${bottom(ROW.one)}`,
    label: { text: "addresses — closes the loop", x: 390, y: 443 },
  },
];

const BY_KIND = new Map(ELEMENTS.map((el) => [el.kind, el]));

/**
 * The biz42 meta-model: element types as boxes, reference fields as arrows.
 * `hrefBase` prefixes each element's anchor link ("model/" on the landing page).
 */
export function MetamodelDiagram({ hrefBase = "" }: { hrefBase?: string }) {
  const scope = BY_KIND.get("scope")!;
  return (
    <figure className="metamodel">
      <div className="metamodel__scroll">
        <svg
          className="metamodel__svg"
          viewBox="0 0 960 480"
          role="img"
          aria-labelledby="metamodel-title metamodel-desc"
        >
          <title id="metamodel-title">The biz42 meta-model</title>
          <desc id="metamodel-desc">
            Within the scope, signals and expectations surface risks and opportunities. Objectives
            address them, are measured by measures, have an owner and require capabilities.
            Capabilities enable products, which fulfill expectations. Evaluation evaluates measures;
            improvements are triggered by evaluation and address objectives, capabilities or
            products.
          </desc>
          <defs>
            <marker
              id="metamodel-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M0,1 L9,5 L0,9 z" className="metamodel__head" />
            </marker>
          </defs>

          <a href={`${hrefBase}#${scope.kind}`} className="metamodel__node">
            <rect x="8" y="8" width="944" height="464" rx="10" className="metamodel__scope" />
            <text x={COL.a} y={ROW.top + 17} className="metamodel__num">
              01
            </text>
            <text x={COL.a} y={ROW.top + 36} className="metamodel__name">
              Scope
            </text>
            <text x={COL.a + 52} y={ROW.top + 36} className="metamodel__note">
              bounds every element
            </text>
          </a>

          {EDGES.map((edge, i) => (
            <g key={i}>
              <path d={edge.d} className="metamodel__edge" markerEnd="url(#metamodel-arrow)" />
              {edge.label && (
                <text
                  x={edge.label.x}
                  y={edge.label.y}
                  textAnchor={edge.label.anchor ?? "middle"}
                  className="metamodel__label"
                >
                  {edge.label.text}
                </text>
              )}
            </g>
          ))}

          {NODES.map((node) => {
            const el = BY_KIND.get(node.kind)!;
            const width = node.width ?? W;
            return (
              <a key={node.kind} href={`${hrefBase}#${node.kind}`} className="metamodel__node">
                <rect
                  x={node.x}
                  y={node.y}
                  width={width}
                  height={H}
                  rx="6"
                  className="metamodel__box"
                />
                <rect
                  x={node.x}
                  y={node.y}
                  width="4"
                  height={H}
                  style={{ fill: ELEMENT_COLOR[node.kind] }}
                />
                <text x={node.x + 14} y={node.y + 18} className="metamodel__num">
                  {String(el.chapter).padStart(2, "0")}
                </text>
                <text x={node.x + 14} y={node.y + 36} className="metamodel__name">
                  {node.label ?? el.name}
                </text>
              </a>
            );
          })}
        </svg>
      </div>
      <figcaption className="metamodel__caption">
        Each arrow is a field in a block, pointing to the element it references. Select an element
        for its details.
      </figcaption>
    </figure>
  );
}
