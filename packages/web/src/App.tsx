import { useState, useEffect, useMemo } from "react";
import type { WorkspacePayload } from "./types.ts";
import { ELEMENT_CHAPTER } from "@biz42/core";
import type { Element, Edge, DocumentAst, Diagram, BlockType } from "@biz42/core";
import { DocumentView } from "./DocumentView.tsx";
import "./styles.css";

// ---------------------------------------------------------------------------
// Load workspace
// ---------------------------------------------------------------------------

async function fetchWorkspace(): Promise<WorkspacePayload> {
  if (window.__WORKSPACE__) return window.__WORKSPACE__;
  const res = await fetch("/api/workspace");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<WorkspacePayload>;
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

/** Extract the H1 heading text from a document's AST nodes */
function docTitle(doc: DocumentAst): string {
  const h1 = doc.nodes.find((n) => n.kind === "heading" && (n as { level: number }).level === 1);
  if (h1) return (h1 as { text: string }).text;
  // Fallback: derive from filename
  const base = doc.filePath.split("/").pop() ?? doc.filePath;
  return base.replace(/\.biz42\.md$/, "");
}

function Sidebar({
  documents,
  activeDocIndex,
  onSelectDoc,
}: {
  documents: DocumentAst[];
  activeDocIndex: number | null;
  onSelectDoc: (idx: number) => void;
}) {
  return (
    <nav
      style={{
        width: 240,
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        padding: "16px 0",
        overflowY: "auto",
        background: "var(--bg-sidebar)",
      }}
    >
      <div
        style={{
          padding: "0 16px 12px",
          fontWeight: 700,
          fontSize: 13,
          color: "var(--text-muted)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        biz42
      </div>
      {documents.map((doc, idx) => {
        const active = activeDocIndex === idx;
        const basename = doc.filePath.split("/").pop() ?? "";
        const numMatch = /^(\d+)-/.exec(basename);
        const num = numMatch ? numMatch[1] : null;
        const title = docTitle(doc);
        return (
          <button
            key={doc.filePath}
            onClick={() => onSelectDoc(idx)}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              width: "100%",
              textAlign: "left",
              padding: "6px 16px",
              background: active
                ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                : "transparent",
              border: "none",
              borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              color: active ? "var(--accent)" : "var(--text)",
            }}
          >
            {num && (
              <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 18 }}>{num}</span>
            )}
            <span>{title}</span>
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
  const [activeDocIndex, setActiveDocIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchWorkspace()
      .then((p) => {
        setPayload(p);
        if (p.documents.length > 0) setActiveDocIndex(0);
      })
      .catch((e: unknown) => setError(String(e)));

    // SSE live reload
    const es = new EventSource("/api/workspace/events");
    es.addEventListener("workspace", () => {
      fetchWorkspace()
        .then(setPayload)
        .catch(() => null);
    });
    return () => es.close();
  }, []);

  // Handle hash navigation from clickable diagram nodes: #chapter-{n}-{elementId}
  // Map the chapter number to the document index whose filename starts with that number.
  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash;
      const match = /^#chapter-(\d+)-/.exec(hash);
      if (!match || !payload) return;
      const chapter = parseInt(match[1]!, 10);
      const idx = payload.documents.findIndex((doc) => {
        const basename = doc.filePath.split("/").pop() ?? "";
        const m = /^(\d+)-/.exec(basename);
        return m ? parseInt(m[1]!, 10) === chapter : false;
      });
      if (idx >= 0) setActiveDocIndex(idx);
    }
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [payload]);

  // Build elements map (id → element) — used by ElementCard and AstNodeRenderer
  const elementsMap = useMemo(() => {
    const map = new Map<string, Element>();
    for (const el of payload?.elements ?? []) map.set(el.id, el);
    return map;
  }, [payload?.elements]);

  // Build elementDocMap (elementId → filePath) for cross-doc ref links
  const elementDocMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const doc of payload?.documents ?? []) {
      for (const node of doc.nodes) {
        if (node.kind === "block") {
          const id = (node as { attributes: Record<string, string> }).attributes["id"];
          if (id) map.set(id, doc.filePath);
        }
      }
    }
    return map;
  }, [payload?.documents]);

  // Build chapterMap (elementId → chapter number) for DiagramView
  const chapterMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const el of payload?.elements ?? []) {
      map.set(el.id, ELEMENT_CHAPTER[el.kind as BlockType]);
    }
    return map;
  }, [payload?.elements]);

  const edges: Edge[] = payload?.edges ?? [];
  const documents: DocumentAst[] = payload?.documents ?? [];
  const diagrams: Diagram[] = payload?.diagrams ?? [];

  if (error) {
    return (
      <div style={{ padding: 32, color: "var(--color-error)" }}>
        <strong>Failed to load workspace:</strong> {error}
      </div>
    );
  }

  if (!payload) {
    return <div style={{ padding: 32, color: "var(--text-muted)" }}>Loading…</div>;
  }

  const activeDoc = activeDocIndex !== null ? (documents[activeDocIndex] ?? null) : null;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        documents={documents}
        activeDocIndex={activeDocIndex}
        onSelectDoc={setActiveDocIndex}
      />

      <main style={{ flex: 1, overflowY: "auto", padding: "20px 36px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setAgentView(false)}
              style={{
                padding: "4px 12px",
                borderRadius: 4,
                border: "1px solid var(--border)",
                background: !agentView ? "var(--accent)" : "transparent",
                color: !agentView ? "#fff" : "var(--text)",
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
                border: "1px solid var(--border)",
                background: agentView ? "var(--accent)" : "transparent",
                color: agentView ? "#fff" : "var(--text)",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Agent
            </button>
          </div>
        </div>

        {/* Document content */}
        {activeDoc ? (
          <DocumentView
            doc={activeDoc}
            viewMode={agentView ? "agent" : "human"}
            elementsMap={elementsMap}
            elementDocMap={elementDocMap}
            edges={edges}
            diagrams={diagrams}
            chapterMap={chapterMap}
          />
        ) : (
          <div style={{ color: "var(--text-muted)", padding: "2rem" }}>No document selected.</div>
        )}
      </main>
    </div>
  );
}
