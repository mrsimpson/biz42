import { useState, useEffect, useMemo } from "react";
import type { WorkspacePayload } from "./types.ts";
import { ELEMENT_KIND_ORDER, ELEMENT_CHAPTER, CHAPTER_TITLE } from "@biz42/core";
import type { Element, BlockType, Diagram } from "@biz42/core";
import { DiagramView } from "./DiagramView.tsx";
import "./styles.css";

// ---------------------------------------------------------------------------
// Load workspace
// ---------------------------------------------------------------------------

async function fetchWorkspace(): Promise<WorkspacePayload> {
  // Injected at build time (biz42 build command)
  if (window.__WORKSPACE__) return window.__WORKSPACE__;
  // Live from dev server / biz42 serve
  const res = await fetch("/api/workspace");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<WorkspacePayload>;
}

// ---------------------------------------------------------------------------
// Colour per block type
// ---------------------------------------------------------------------------

const KIND_COLOR: Record<string, string> = {
  scope: "#7c3aed",
  signal: "#0891b2",
  expectation: "#0e7490",
  risk: "#dc2626",
  opportunity: "#16a34a",
  objective: "#2563eb",
  measure: "#9333ea",
  owner: "#78350f",
  capability: "#1d4ed8",
  product: "#0f766e",
  evaluation: "#b45309",
  improvement: "#15803d",
};

function kindColor(kind: string): string {
  return KIND_COLOR[kind] ?? "#555";
}



// ---------------------------------------------------------------------------
// Agent-view JSON card
// ---------------------------------------------------------------------------

function AgentCard({ element }: { element: Element }) {
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
      }}
    >
      {JSON.stringify(element, null, 2)}
    </pre>
  );
}

// ---------------------------------------------------------------------------
// Human-view element card
// ---------------------------------------------------------------------------

function ElementCard({ element }: { element: Element }) {
  const color = kindColor(element.kind);
  return (
    <div
      style={{
        border: `1px solid ${color}33`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 6,
        padding: "12px 16px",
        marginBottom: 12,
        background: "#fafafa",
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 4 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            color,
            letterSpacing: "0.05em",
          }}
        >
          {element.kind}
        </span>
        <span style={{ fontSize: 11, color: "#888" }}>{element.id}</span>
      </div>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{element.title}</div>
      <ElementFields element={element} />
    </div>
  );
}

function ElementFields({ element }: { element: Element }) {
  const fields: [string, string][] = [];

  if (element.kind === "risk") {
    fields.push(["severity", element.severity]);
    if (element.mitigation) fields.push(["mitigation", element.mitigation]);
  } else if (element.kind === "signal") {
    if (element.source) fields.push(["source", element.source]);
  } else if (element.kind === "expectation") {
    if (element.source) fields.push(["source", element.source]);
  } else if (element.kind === "objective") {
    if (element.addresses.length > 0) fields.push(["addresses", element.addresses.join(", ")]);
    if (element["measured-by"].length > 0) fields.push(["measured-by", element["measured-by"].join(", ")]);
    if (element.owner) fields.push(["owner", element.owner]);
    if (element.requires.length > 0) fields.push(["requires", element.requires.join(", ")]);
  } else if (element.kind === "measure") {
    if (element.target) fields.push(["target", element.target]);
  } else if (element.kind === "owner") {
    if (element.role) fields.push(["role", element.role]);
  } else if (element.kind === "capability") {
    if (element.status) fields.push(["status", element.status]);
  } else if (element.kind === "product") {
    if (element.enables.length > 0) fields.push(["enables", element.enables.join(", ")]);
  } else if (element.kind === "evaluation") {
    if (element.method) fields.push(["method", element.method]);
  } else if (element.kind === "improvement") {
    if (element.addresses.length > 0) fields.push(["addresses", element.addresses.join(", ")]);
  }

  if (fields.length === 0) return null;

  return (
    <table style={{ fontSize: 12, borderCollapse: "collapse", width: "100%" }}>
      <tbody>
        {fields.map(([k, v]) => (
          <tr key={k}>
            <td style={{ color: "#888", paddingRight: 12, whiteSpace: "nowrap", verticalAlign: "top", paddingBottom: 2 }}>{k}</td>
            <td style={{ color: "#333" }}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// Sidebar chapter navigation
// ---------------------------------------------------------------------------

function Sidebar({
  activeChapter,
  elementsByChapter,
  onSelectChapter,
}: {
  activeChapter: number | null;
  elementsByChapter: Map<number, Element[]>;
  onSelectChapter: (ch: number | null) => void;
}) {
  const chapters = [...elementsByChapter.keys()].sort((a, b) => a - b);
  return (
    <nav
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: "1px solid #e0e0e0",
        padding: "16px 0",
        overflowY: "auto",
      }}
    >
      <div style={{ padding: "0 16px 12px", fontWeight: 700, fontSize: 13, color: "#444" }}>
        biz42
      </div>
      <button
        onClick={() => onSelectChapter(null)}
        style={{
          display: "block",
          width: "100%",
          textAlign: "left",
          padding: "6px 16px",
          background: activeChapter === null ? "#eff6ff" : "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: activeChapter === null ? 600 : 400,
          color: activeChapter === null ? "#2563eb" : "#333",
        }}
      >
        All elements
      </button>
      {chapters.map((ch) => {
        const count = elementsByChapter.get(ch)?.length ?? 0;
        const active = activeChapter === ch;
        return (
          <button
            key={ch}
            onClick={() => onSelectChapter(ch)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              textAlign: "left",
              padding: "6px 16px",
              background: active ? "#eff6ff" : "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              color: active ? "#2563eb" : "#333",
            }}
          >
            <span>
              {String(ch).padStart(2, "0")} {CHAPTER_TITLE[ch] ?? `Ch. ${ch}`}
            </span>
            <span style={{ color: "#888", fontSize: 11 }}>{count}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------

export function App() {
  const [payload, setPayload] = useState<WorkspacePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agentView, setAgentView] = useState(false);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);

  useEffect(() => {
    fetchWorkspace()
      .then(setPayload)
      .catch((e: unknown) => setError(String(e)));

    // SSE live reload (biz42 serve)
    const es = new EventSource("/api/workspace/events");
    es.addEventListener("workspace", () => {
      fetchWorkspace().then(setPayload).catch(() => null);
    });
    return () => es.close();
  }, []);

  // Handle hash navigation from clickable diagram nodes: #chapter-{n}-{elementId}
  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash;
      const match = /^#chapter-(\d+)-/.exec(hash);
      if (match) {
        const chapter = parseInt(match[1]!, 10);
        setActiveChapter(chapter);
      }
    }
    // Handle initial hash on load
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // All useMemo hooks must be called unconditionally — before any early returns
  const elementsByChapter = useMemo(() => {
    const map = new Map<number, Element[]>();
    for (const el of payload?.elements ?? []) {
      const ch = ELEMENT_CHAPTER[el.kind as BlockType];
      if (!map.has(ch)) map.set(ch, []);
      map.get(ch)!.push(el);
    }
    return map;
  }, [payload?.elements]);

  const chapterMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const el of payload?.elements ?? []) {
      map.set(el.id, ELEMENT_CHAPTER[el.kind as BlockType]);
    }
    return map;
  }, [payload?.elements]);

  // Map diagrams to chapters by parsing the filename prefix (02-signals.biz42.md → chapter 2)
  const diagramsByChapter = useMemo(() => {
    const map = new Map<number, Diagram[]>();
    for (const d of payload?.diagrams ?? []) {
      const basename = d.loc.file.split("/").pop() ?? "";
      const m = /^(\d+)-/.exec(basename);
      if (m) {
        const ch = parseInt(m[1]!, 10);
        if (!map.has(ch)) map.set(ch, []);
        map.get(ch)!.push(d);
      }
    }
    return map;
  }, [payload?.diagrams]);

  if (error) {
    return (
      <div style={{ padding: 32, color: "#dc2626" }}>
        <strong>Failed to load workspace:</strong> {error}
      </div>
    );
  }

  if (!payload) {
    return <div style={{ padding: 32, color: "#888" }}>Loading…</div>;
  }

  const diagramsForChapter = activeChapter !== null ? (diagramsByChapter.get(activeChapter) ?? []) : [];

  // Filter elements to display
  const displayElements =
    activeChapter !== null
      ? (elementsByChapter.get(activeChapter) ?? [])
      : payload.elements;

  const title =
    activeChapter !== null
      ? `${String(activeChapter).padStart(2, "0")} — ${CHAPTER_TITLE[activeChapter] ?? `Chapter ${activeChapter}`}`
      : "All elements";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        activeChapter={activeChapter}
        elementsByChapter={elementsByChapter}
        onSelectChapter={setActiveChapter}
      />

      <main style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setAgentView(false)}
              style={{
                padding: "4px 12px",
                borderRadius: 4,
                border: "1px solid #e0e0e0",
                background: !agentView ? "#2563eb" : "#fff",
                color: !agentView ? "#fff" : "#333",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Human
            </button>
            <button
              onClick={() => setAgentView(true)}
              style={{
                padding: "4px 12px",
                borderRadius: 4,
                border: "1px solid #e0e0e0",
                background: agentView ? "#2563eb" : "#fff",
                color: agentView ? "#fff" : "#333",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Agent
            </button>
          </div>
        </div>

        {/* Diagrams (scope chapter) */}
        {diagramsForChapter.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            {diagramsForChapter.map((d: Diagram) => (
              <DiagramView
                key={d.id}
                diagram={d}
                elements={payload.elements}
                chapterMap={chapterMap}
                agentView={agentView}
              />
            ))}
          </div>
        )}

        {/* Element list */}
        {displayElements.length === 0 ? (
          <div style={{ color: "#888" }}>No elements in this chapter.</div>
        ) : (
          displayElements.map((el) =>
            agentView ? (
              <AgentCard key={el.id} element={el} />
            ) : (
              <ElementCard key={el.id} element={el} />
            ),
          )
        )}
      </main>
    </div>
  );
}
