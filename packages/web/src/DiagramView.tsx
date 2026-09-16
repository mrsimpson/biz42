import { useMemo } from "react";
import type { Diagram, Element } from "@biz42/core";
import { MermaidDiagram } from "./MermaidDiagram.tsx";
import { BmcDiagram } from "./BmcDiagram.tsx";

// ---------------------------------------------------------------------------
// Element link resolution
// ---------------------------------------------------------------------------

function buildClickableNodes(
  source: string,
  elements: Element[],
  chapterMap: Map<string, number>,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const el of elements) {
    const escaped = el.id.replace(/[-]/gu, "\\-");
    const pattern = new RegExp(`(?<![a-zA-Z0-9_-])${escaped}(?![a-zA-Z0-9_-])`);
    if (pattern.test(source)) {
      const ch = chapterMap.get(el.id);
      if (ch !== undefined) {
        map.set(el.id, `#chapter-${ch}-${el.id}`);
      }
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// Methodology descriptions
// ---------------------------------------------------------------------------

interface MethodologyInfo {
  name: string;
  description: string;
  slots?: { label: string; meaning: string }[];
}

const METHODOLOGY: Record<string, MethodologyInfo> = {
  bmc: {
    name: "Business Model Canvas",
    description:
      "The Business Model Canvas (Osterwalder & Pigneur) is a strategic management tool that describes a business model on a single page using nine building blocks: Key Partners, Key Activities, Key Resources, Value Propositions, Customer Relationships, Channels, Customer Segments, Cost Structure, and Revenue Streams. In biz42, element ids in the canvas link back to the corresponding model elements.",
  },
  sipoc: {
    name: "SIPOC",
    description:
      "A SIPOC diagram (Six Sigma / ISO 9001 §4.4) maps a process from end to end by identifying who supplies the inputs, what those inputs are, what the process does, what it produces, and who receives the outputs. It is used to agree on scope and handoffs before diving into process detail.",
    slots: [
      { label: "Supplier", meaning: "Who provides the inputs (stakeholders, systems)" },
      { label: "Input", meaning: "What enters the process (signals, expectations)" },
      { label: "Process", meaning: "What the organisation does (objectives)" },
      { label: "Output", meaning: "What is produced (products, services)" },
      { label: "Customer", meaning: "Who receives the outputs (stakeholders)" },
    ],
  },
  turtle: {
    name: "Turtle Diagram",
    description:
      "A Turtle Diagram is an ISO 9001 process audit tool. It describes a single process by asking six questions: what resources are needed, who is responsible, how the process is carried out, for whom it is done, and how success is measured. It is named after its shape: a central process body with four 'legs' of context.",
    slots: [
      { label: "With what?", meaning: "Resources and capabilities required" },
      { label: "With whom?", meaning: "People and roles accountable" },
      { label: "How?", meaning: "Objectives and methods that define the process" },
      { label: "For whom?", meaning: "Customers and stakeholders served" },
      { label: "Results", meaning: "Measures that define success" },
    ],
  },
  "strategy-map": {
    name: "Strategy Map",
    description:
      "A Strategy Map (adapted from Kaplan & Norton's Balanced Scorecard) shows the cause-and-effect logic behind strategic choices: which risks and opportunities drive which objectives, and how each objective is measured. It makes the strategic reasoning visible and auditable.",
    slots: [
      { label: "Risks & Opportunities", meaning: "What triggered this objective" },
      { label: "Objectives", meaning: "What the organisation commits to achieving" },
      { label: "Measures", meaning: "How success is defined and tracked" },
    ],
  },
};

function MethodologyDescription({ notation }: { notation: string }) {
  const info = METHODOLOGY[notation];
  if (!info) return null;

  return (
    <details
      style={{
        marginTop: 8,
        marginBottom: 4,
        fontSize: 13,
        lineHeight: 1.55,
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          color: "#888",
          fontSize: 12,
          userSelect: "none",
          listStyle: "none",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span>▸</span>
        <span>About {info.name}</span>
      </summary>
      <div
        style={{
          marginTop: 8,
          padding: "12px 16px",
          background: "#f8f9fa",
          border: "1px solid #e8e9ea",
          borderRadius: 6,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4, color: "#444" }}>{info.name}</div>
        <div style={{ color: "#555", marginBottom: info.slots ? 10 : 0 }}>{info.description}</div>
        {info.slots && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "max-content 1fr",
              gap: "3px 12px",
              marginTop: 8,
            }}
          >
            {info.slots.map((s) => (
              <>
                <span key={`label-${s.label}`} style={{ fontWeight: 600, color: "#333" }}>
                  {s.label}
                </span>
                <span key={`meaning-${s.label}`} style={{ color: "#666" }}>
                  {s.meaning}
                </span>
              </>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

// ---------------------------------------------------------------------------
// DiagramView — clean, content-first presentation
// ---------------------------------------------------------------------------

export interface DiagramViewProps {
  diagram: Diagram;
  elements: Element[];
  chapterMap: Map<string, number>;
  agentView?: boolean;
}

export function DiagramView({
  diagram,
  elements,
  chapterMap,
  agentView = false,
}: DiagramViewProps) {
  const clickableNodes = useMemo(
    () => buildClickableNodes(diagram.source, elements, chapterMap),
    [diagram.source, elements, chapterMap],
  );

  // Human-readable title: prefer explicit title, fall back to formatted id
  const displayTitle =
    diagram.title ?? diagram.id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (agentView) {
    // Reconstruct the :::diagram block + source fence as raw source.
    // BMC diagrams use ```yaml; all others use ```mermaid.
    const fenceLang = diagram.notation === "bmc" ? "yaml" : "mermaid";
    const blockLines = [
      `:::diagram`,
      `id: ${diagram.id}`,
      ...(diagram.title ? [`title: ${diagram.title}`] : []),
      `notation: ${diagram.notation}`,
      `:::`,
      ``,
      "```" + fenceLang,
      diagram.source.trim(),
      "```",
    ];
    return (
      <pre
        style={{
          background: "#0f172a",
          color: "#e2e8f0",
          padding: "12px 16px",
          borderRadius: 6,
          fontSize: 12,
          overflowX: "auto",
          marginBottom: 16,
          whiteSpace: "pre",
        }}
      >
        {blockLines.join("\n")}
      </pre>
    );
  }

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Title */}
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#222",
          margin: "0 0 12px 0",
        }}
      >
        {displayTitle}
      </h3>
      {/* Diagram render — BMC uses custom renderer; all others use Mermaid */}
      {diagram.notation === "bmc" ? (
        <BmcDiagram diagram={diagram} elements={elements} chapterMap={chapterMap} />
      ) : (
        <MermaidDiagram source={diagram.source} id={diagram.id} clickableNodes={clickableNodes} />
      )}
      {/* Methodology description — collapsed by default */}
      <MethodologyDescription notation={diagram.notation} />
    </div>
  );
}
