import React from "react";
import type { DocumentAst, AstNode, DiffDocument } from "@biz42/core";
import { ChangeCounts } from "./DiffSegment.tsx";
import styles from "./Sidebar.module.css";

function basename(filePath: string): string {
  return filePath.split("/").pop() ?? filePath;
}

function docTitle(doc: DocumentAst): string {
  const h1 = doc.nodes.find(
    (n: AstNode) => n.kind === "heading" && (n as { level: number }).level === 1,
  );
  if (h1) return (h1 as { text: string }).text;
  const base = basename(doc.filePath);
  return base.replace(/\.biz42\.(md|adoc)$/, "");
}

interface SidebarProps {
  documents: DocumentAst[];
  activeDocIndex: number;
  onSelectDoc: (index: number) => void;
  /** Present when a difference is visualized (serve/build --diff). */
  changes?: {
    active: boolean;
    onSelect: () => void;
    /** Changed documents by file name. */
    documents: Map<string, DiffDocument>;
  };
  /** Present when a business model history is available (serve, build --with-history). */
  history?: {
    active: boolean;
    onSelect: () => void;
    onSelectDocuments: () => void;
    /** The pearl chain, shown instead of the documents while active. */
    panel: React.ReactNode;
  };
  viewMode: "human" | "agent";
  onToggleViewMode: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({
  documents,
  activeDocIndex,
  onSelectDoc,
  changes,
  history,
  viewMode,
  onToggleViewMode,
  theme,
  onToggleTheme,
  open,
  onClose,
}: SidebarProps) {
  return (
    <nav
      className={[styles.sidebar, open ? styles.sidebarOpen : ""].filter(Boolean).join(" ")}
      aria-label="Document navigation"
    >
      <div className={styles.header}>
        <span className={styles.logo}>biz42</span>
        <button
          className={styles.closeButton}
          type="button"
          aria-label="Close document navigation"
          onClick={onClose}
        >
          ×
        </button>
        <button
          className={[styles.viewToggle, viewMode === "agent" ? styles.viewToggleAgent : ""]
            .filter(Boolean)
            .join(" ")}
          onClick={onToggleViewMode}
          title={viewMode === "human" ? "Switch to Agent view (raw DSL)" : "Switch to Human view"}
          aria-pressed={viewMode === "agent"}
        >
          {viewMode === "human" ? "Human" : "Agent"}
        </button>
        <button
          className={styles.viewToggle}
          onClick={onToggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={theme === "dark"}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>

      {history && (
        <div className={styles.tabs} role="tablist" aria-label="Sidebar view">
          <button
            type="button"
            role="tab"
            data-testid="sidebar-tab-documents"
            aria-selected={!history.active}
            className={[styles.tab, !history.active ? styles.tabActive : ""].join(" ")}
            onClick={history.onSelectDocuments}
          >
            Documents
          </button>
          <button
            type="button"
            role="tab"
            data-testid="sidebar-tab-history"
            aria-selected={history.active}
            className={[styles.tab, history.active ? styles.tabActive : ""].join(" ")}
            onClick={history.onSelect}
          >
            History
          </button>
        </div>
      )}

      {history?.active && history.panel}

      {!history?.active && changes && (
        <a
          data-testid="sidebar-changes-link"
          href="#changes"
          aria-current={changes.active ? "page" : undefined}
          className={[styles.docBtn, styles.changesLink, changes.active ? styles.docBtnActive : ""]
            .filter(Boolean)
            .join(" ")}
          onClick={(e) => {
            e.preventDefault();
            changes.onSelect();
          }}
        >
          <span className={styles.docLabel}>Changes</span>
          <ChangeCounts {...totalCounts([...changes.documents.values()])} />
        </a>
      )}

      {!history?.active && (
        <ul className={styles.docs} role="list">
          {documents.map((doc, i) => {
            const isActive = i === activeDocIndex && !changes?.active;
            const docChanges = changes?.documents.get(basename(doc.filePath));
            const base = basename(doc.filePath);
            const numMatch = /^(\d+)-/.exec(base);
            const num = numMatch ? numMatch[1] : null;
            const title = docTitle(doc);
            return (
              <li key={doc.filePath} className={styles.doc}>
                <button
                  data-testid="sidebar-doc-link"
                  aria-current={isActive ? "page" : undefined}
                  className={[styles.docBtn, isActive ? styles.docBtnActive : ""]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onSelectDoc(i)}
                >
                  {num && <span className={styles.docNum}>{parseInt(num, 10)}</span>}
                  <span className={styles.docLabel}>{title}</span>
                  {docChanges && (
                    <span className={styles.docChanges} data-testid="doc-change-badge">
                      <ChangeCounts {...docChanges} />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}

function totalCounts(documents: DiffDocument[]) {
  return documents.reduce(
    (total, d) => ({
      added: total.added + d.added,
      modified: total.modified + d.modified,
      removed: total.removed + d.removed,
    }),
    { added: 0, modified: 0, removed: 0 },
  );
}
