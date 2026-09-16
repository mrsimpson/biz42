import type { Diagram, Element } from "@biz42/core";

// ---------------------------------------------------------------------------
// Minimal YAML parser for the flat BMC structure
// ---------------------------------------------------------------------------

/**
 * Parses the simple flat YAML structure used in BMC diagram source.
 * Returns a map of top-level key → list of string items.
 * Strips surrounding quotes from quoted list values.
 */
function parseBmcYaml(source: string): Map<string, string[]> {
  const result = new Map<string, string[]>();
  let currentKey: string | null = null;

  for (const rawLine of source.split("\n")) {
    const line = rawLine.trimEnd();
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;

    const keyMatch = /^([a-z][a-z0-9-]*):\s*$/.exec(line);
    if (keyMatch) {
      currentKey = keyMatch[1]!;
      if (!result.has(currentKey)) result.set(currentKey, []);
      continue;
    }

    if (currentKey !== null) {
      const itemMatch = /^\s+-\s+(.+)$/.exec(line);
      if (itemMatch) {
        let value = itemMatch[1]!.trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        result.get(currentKey)!.push(value);
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// BMC grid layout definition
// ---------------------------------------------------------------------------

/** One cell in the BMC grid. */
interface BmcCellDef {
  key: string;
  label: string;
  /** grid-area shorthand */
  area: string;
  accent: string;
}

const BMC_CELLS: BmcCellDef[] = [
  { key: "key-partners", label: "Key Partners", area: "kp", accent: "#e8f4fd" },
  { key: "key-activities", label: "Key Activities", area: "ka", accent: "#fef9e7" },
  { key: "value-propositions", label: "Value Propositions", area: "vp", accent: "#eafaf1" },
  { key: "customer-relationships", label: "Customer Relationships", area: "cr", accent: "#fdf2f8" },
  { key: "customer-segments", label: "Customer Segments", area: "cs", accent: "#fef5e4" },
  { key: "key-resources", label: "Key Resources", area: "kr", accent: "#fef9e7" },
  { key: "channels", label: "Channels", area: "ch", accent: "#fdf2f8" },
  { key: "cost-structure", label: "Cost Structure", area: "co", accent: "#fdfefe" },
  { key: "revenue-streams", label: "Revenue Streams", area: "re", accent: "#f0fff4" },
];

// ---------------------------------------------------------------------------
// BmcDiagram component
// ---------------------------------------------------------------------------

export interface BmcDiagramProps {
  diagram: Diagram;
  elements: Element[];
  chapterMap: Map<string, number>;
}

/** Returns true when the value looks like a biz42 element id (no whitespace). */
function looksLikeElementId(value: string): boolean {
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/.test(value);
}

function BmcEntry({
  value,
  elements,
  chapterMap,
}: {
  value: string;
  elements: Element[];
  chapterMap: Map<string, number>;
}) {
  if (looksLikeElementId(value)) {
    const el = elements.find((e) => e.id === value);
    const ch = chapterMap.get(value);
    if (el && ch !== undefined) {
      return (
        <li>
          <a
            href={`#chapter-${ch}-${el.id}`}
            style={{ color: "#1a6fa8", textDecoration: "none", fontWeight: 500 }}
          >
            {el.title}
          </a>
        </li>
      );
    }
    // Id-like but not resolved — show the raw id
    return <li style={{ color: "#c0392b" }}>{value}</li>;
  }
  return <li>{value}</li>;
}

function BmcCell({
  cell,
  entries,
  elements,
  chapterMap,
}: {
  cell: BmcCellDef;
  entries: string[];
  elements: Element[];
  chapterMap: Map<string, number>;
}) {
  return (
    <div
      style={{
        gridArea: cell.area,
        background: cell.accent,
        border: "1px solid #d4d8dd",
        borderRadius: 4,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        minHeight: 80,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "#555",
          marginBottom: 6,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {cell.label}
      </div>
      {entries.length > 0 && (
        <ul
          style={{
            margin: 0,
            padding: "0 0 0 14px",
            fontSize: 13,
            lineHeight: 1.55,
            color: "#222",
            flexGrow: 1,
          }}
        >
          {entries.map((v, i) => (
            <BmcEntry key={i} value={v} elements={elements} chapterMap={chapterMap} />
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Custom React renderer for the Business Model Canvas (bmc) diagram notation.
 *
 * Layout (classic 9-block BMC grid):
 *
 * | Key Partners | Key Activities  | Value Props | Customer Rel | Customer Seg |
 * |              | Key Resources   |             |              |              |
 * |     Cost Structure             |             |  Revenue Streams             |
 */
export function BmcDiagram({ diagram, elements, chapterMap }: BmcDiagramProps) {
  const slots = parseBmcYaml(diagram.source);

  return (
    <div
      data-testid="bmc-diagram"
      style={{
        display: "grid",
        gridTemplateAreas: `
          "kp ka vp cr cs"
          "kp kr vp ch cs"
          "co co co re re"
        `,
        gridTemplateColumns: "1fr 1fr 1.3fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr auto",
        gap: 6,
        width: "100%",
        overflowX: "auto",
        fontSize: 13,
      }}
    >
      {BMC_CELLS.map((cell) => (
        <BmcCell
          key={cell.key}
          cell={cell}
          entries={slots.get(cell.key) ?? []}
          elements={elements}
          chapterMap={chapterMap}
        />
      ))}
    </div>
  );
}
