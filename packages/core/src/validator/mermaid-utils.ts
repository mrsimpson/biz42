/**
 * Shared Mermaid source utilities for biz42 diagram validation rules.
 */

const MERMAID_KEYWORDS = new Set([
  "graph",
  "TD",
  "TB",
  "LR",
  "RL",
  "BT",
  "subgraph",
  "end",
  "click",
  "style",
  "classDef",
  "class",
  "direction",
  "flowchart",
  "linkStyle",
  "fill",
  "stroke",
  "color",
  "note",
  "participant",
  "actor",
  "loop",
  "alt",
  "else",
  "opt",
]);

/**
 * Extract node ids from a Mermaid source string.
 * Returns ids that appear as node definitions (before `[`, `(`, or `{`).
 * Skips edge lines (`-->`, `---`) and known Mermaid keywords.
 */
export function extractMermaidIds(source: string): Set<string> {
  const ids = new Set<string>();
  const lines = source.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("%%")) continue;
    if (trimmed.includes("-->") || trimmed.includes("---")) continue;
    const nodeMatch = /^([a-zA-Z][a-zA-Z0-9_-]*)[\s[({]/.exec(trimmed);
    if (nodeMatch) {
      const token = nodeMatch[1]!;
      if (!MERMAID_KEYWORDS.has(token)) {
        ids.add(token);
      }
    }
  }
  return ids;
}

/**
 * Check whether a model element id appears in a Mermaid source string.
 * Uses word-boundary matching to avoid false positives from id prefix collisions
 * (e.g. `obj-a` matching inside `obj-ab`).
 */
export function sourceContainsId(source: string, id: string): boolean {
  const escaped = id.replace(/[-]/gu, "\\-");
  return new RegExp(`(?<![a-zA-Z0-9_-])${escaped}(?![a-zA-Z0-9_-])`).test(source);
}

/** An edge extracted from Mermaid source. */
export interface MermaidEdge {
  from: string;
  to: string;
  /** The label content, or undefined if no label. */
  label: string | undefined;
}

/**
 * Extract all edges from a Mermaid flowchart source string.
 * Handles:
 *   from --> to
 *   from -->|"label"| to
 *   from["Label"] --> to
 */
export function extractMermaidEdges(source: string): MermaidEdge[] {
  const edges: MermaidEdge[] = [];
  const lines = source.split("\n");

  for (const line of lines) {
    if (!line.includes("-->")) continue;
    // Strip inline node definition from source side
    const stripped = line.trim().replace(/^([a-zA-Z][a-zA-Z0-9_-]*)(?:\s*[[(][^\])\n]*)/, "$1");

    const withLabel =
      /^([a-zA-Z][a-zA-Z0-9_-]*)\s*-->\s*\|"?([^"|]*)["?]\|\s*([a-zA-Z][a-zA-Z0-9_-]*)/.exec(
        stripped,
      );
    if (withLabel) {
      const from = withLabel[1]!;
      const label = withLabel[2]!;
      const to = withLabel[3]!;
      if (!MERMAID_KEYWORDS.has(from) && !MERMAID_KEYWORDS.has(to)) {
        edges.push({ from, to, label: label.trim() });
      }
      continue;
    }

    const noLabel = /^([a-zA-Z][a-zA-Z0-9_-]*)\s*-->\s*([a-zA-Z][a-zA-Z0-9_-]*)/.exec(stripped);
    if (noLabel) {
      const from = noLabel[1]!;
      const to = noLabel[2]!;
      if (!MERMAID_KEYWORDS.has(from) && !MERMAID_KEYWORDS.has(to)) {
        edges.push({ from, to, label: undefined });
      }
    }
  }

  return edges;
}

/**
 * Extract subgraph ids from a Mermaid source string.
 * Handles: subgraph sipoc-supplier["Supplier"]  and  subgraph sipoc-supplier
 */
export function extractMermaidSubgraphIds(source: string): Set<string> {
  const ids = new Set<string>();
  for (const line of source.split("\n")) {
    const m = /^\s*subgraph\s+([a-zA-Z][a-zA-Z0-9_-]*)/.exec(line.trim());
    if (m?.[1]) ids.add(m[1]);
  }
  return ids;
}
