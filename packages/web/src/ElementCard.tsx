import React, { useState } from "react";
import type { Element, Edge, Cashflow } from "@biz42/core";
import styles from "./ElementCard.module.css";

// ─── Element → accent colour ──────────────────────────────────────────────────

const KIND_COLOR: Record<string, string> = {
  scope: "var(--c-scope)",
  signal: "var(--c-signal)",
  expectation: "var(--c-expectation)",
  risk: "var(--c-risk)",
  opportunity: "var(--c-opportunity)",
  objective: "var(--c-objective)",
  measure: "var(--c-measure)",
  owner: "var(--c-owner)",
  capability: "var(--c-capability)",
  product: "var(--c-product)",
  evaluation: "var(--c-evaluation)",
  improvement: "var(--c-improvement)",
};

/** Returns the accent colour for an element. Cashflow uses type-aware colours. */
export function elementColor(el: Element): string {
  if (el.kind === "cashflow") {
    return (el as Cashflow).type === "cost"
      ? "var(--c-cashflow-cost)"
      : "var(--c-cashflow-revenue)";
  }
  return KIND_COLOR[el.kind] ?? "var(--c-ch0)";
}

// ─── ElementCard ─────────────────────────────────────────────────────────────

interface ElementCardProps {
  elementId: string;
  elementsMap: Map<string, Element>;
  /** elementId → document filePath (for cross-doc ref links) */
  elementDocMap: Map<string, string>;
  edges: Edge[];
  accentColor?: string;
  onDismiss?: () => void;
}

export function ElementCard({
  elementId,
  elementsMap,
  elementDocMap,
  edges,
  accentColor,
  onDismiss,
}: ElementCardProps) {
  const el = elementsMap.get(elementId);
  const [showIncoming, setShowIncoming] = useState(false);

  if (!el) {
    return (
      <div className={`${styles.card} ${styles.missing}`}>
        <span className={styles.badge}>unknown</span>
        <span className={styles.id}>{elementId}</span>
        <span>element not found in workspace</span>
      </div>
    );
  }

  const color = accentColor ?? elementColor(el);
  const outgoing = edges.filter((e) => e.from === el.id);
  const incoming = edges.filter((e) => e.to === el.id);

  return (
    <div data-testid="element-card" className={styles.card} id={`el-${el.id}`}>
      {onDismiss ? (
        <button
          data-testid="card-dismiss-stripe"
          className={styles.dismissStripe}
          style={{ backgroundColor: color }}
          onClick={onDismiss}
          title="Show prose"
          aria-label="Collapse element card"
        />
      ) : (
        <div className={styles.staticStripe} style={{ backgroundColor: color }} />
      )}
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.badge} style={{ backgroundColor: color }}>
            {el.kind}
          </span>
          <code className={styles.id}>{el.id}</code>
          <span className={styles.title}>{el.title}</span>
        </div>
        <dl className={styles.fields}>{renderFields(el)}</dl>
        {(outgoing.length > 0 || incoming.length > 0) && (
          <div className={styles.refs}>
            {outgoing.length > 0 && (
              <div className={styles.refsGroup}>
                <span className={styles.refsLabel}>references</span>
                {outgoing.map((e) => (
                  <a
                    key={`${e.to}-${e.relation}`}
                    href={refHref(e.to, elementDocMap)}
                    className={styles.refChip}
                  >
                    <span className={styles.refRel}>{e.relation}</span>
                    {e.to}
                  </a>
                ))}
              </div>
            )}
            {incoming.length > 0 && (
              <div className={styles.refsGroup}>
                <button
                  className={styles.refsToggle}
                  onClick={() => setShowIncoming((v) => !v)}
                  aria-expanded={showIncoming}
                >
                  <span className={styles.refsLabel}>referenced by ({incoming.length})</span>
                  <span className={styles.refsToggleIcon}>{showIncoming ? "▾" : "▸"}</span>
                </button>
                {showIncoming &&
                  incoming.map((e) => (
                    <a
                      key={`${e.from}-${e.relation}`}
                      href={refHref(e.from, elementDocMap)}
                      className={`${styles.refChip} ${styles.refChipIncoming}`}
                    >
                      <span className={styles.refRel}>{e.relation}</span>
                      {e.from}
                    </a>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function refHref(targetId: string, elementDocMap: Map<string, string>): string {
  const filePath = elementDocMap.get(targetId);
  if (filePath) {
    // Navigate to the owning document and auto-expand the element card.
    // Hash scheme: #filename:el-{id}  (same as arc42-language)
    const file = filePath.split("/").pop() ?? filePath;
    return `#${file}:el-${targetId}`;
  }
  return `#el-${targetId}`;
}

function renderFields(el: Element): React.ReactNode {
  const fields: [string, string | undefined][] = [];

  switch (el.kind) {
    case "scope":
      if (el.included) fields.push(["included", el.included]);
      if (el.excluded) fields.push(["excluded", el.excluded]);
      // parent is a cross-reference; shown in the edges section
      break;
    case "signal":
      if (el.source) fields.push(["source", el.source]);
      // surfaces is a cross-reference; shown in the edges section
      break;
    case "expectation":
      if (el.source) fields.push(["source", el.source]);
      // surfaces is a cross-reference; shown in the edges section
      break;
    case "risk":
      fields.push(["severity", el.severity]);
      if (el.mitigation) fields.push(["mitigation", el.mitigation]);
      break;
    case "opportunity":
      break;
    case "objective":
      // addresses, measured-by, owner, requires are cross-references; shown in the edges section
      break;
    case "measure":
      if (el.target) fields.push(["target", el.target]);
      break;
    case "owner":
      if (el.role) fields.push(["role", el.role]);
      break;
    case "capability":
      if (el.status) fields.push(["status", el.status]);
      // enables, owner are cross-references; shown in the edges section
      break;
    case "product":
      // fulfills, owner are cross-references; shown in the edges section
      break;
    case "evaluation":
      if (el.method) fields.push(["method", el.method]);
      // evaluates is a cross-reference; shown in the edges section
      break;
    case "improvement":
      fields.push(["type", el.type]);
      // triggered-by, addresses are cross-references; shown in the edges section
      break;
    case "cashflow":
      fields.push(["type", el.type]);
      if (el.category) fields.push(["category", el.category]);
      // linked-to is a cross-reference; shown in the edges section
      if (el.recurrence) fields.push(["recurrence", el.recurrence]);
      break;
  }

  return fields.map(([key, val]) =>
    val ? (
      <div key={key} className={styles.field}>
        <dt>{key}</dt>
        <dd>{val}</dd>
      </div>
    ) : null,
  );
}
