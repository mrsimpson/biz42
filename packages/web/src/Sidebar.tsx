import React from "react";
import type { DocumentAst, AstNode } from "@biz42/core";
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
  return base.replace(/\.biz42\.md$/, "");
}

interface SidebarProps {
  documents: DocumentAst[];
  activeDocIndex: number;
  onSelectDoc: (index: number) => void;
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

      <ul className={styles.docs} role="list">
        {documents.map((doc, i) => {
          const isActive = i === activeDocIndex;
          const base = basename(doc.filePath);
          const numMatch = /^(\d+)-/.exec(base);
          const num = numMatch ? numMatch[1] : null;
          const title = docTitle(doc);
          return (
            <li key={doc.filePath} className={styles.doc}>
              <button
                aria-current={isActive ? "page" : undefined}
                className={[styles.docBtn, isActive ? styles.docBtnActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onSelectDoc(i)}
              >
                {num && <span className={styles.docNum}>{parseInt(num, 10)}</span>}
                <span className={styles.docLabel}>{title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
