import React, { useState } from "react";
import type { Element, Edge } from "@biz42/core";
import styles from "./ElementCard.module.css";

// ─── Kind → accent colour ─────────────────────────────────────────────────────

export const KIND_COLOR: Record<string, string> = {
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

export function kindColor(kind: string): string {
  return KIND_COLOR[kind] ?? "var(--c-ch0)";
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

  const color = accentColor ?? kindColor(el.kind);
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
      if (el.parent) fields.push(["parent", el.parent]);
      break;
    case "signal":
      if (el.source) fields.push(["source", el.source]);
      if (el.surfaces?.length) fields.push(["surfaces", (el.surfaces as string[]).join(", ")]);
      break;
    case "expectation":
      if (el.source) fields.push(["source", el.source]);
      if (el.surfaces?.length) fields.push(["surfaces", (el.surfaces as string[]).join(", ")]);
      break;
    case "risk":
      fields.push(["severity", el.severity]);
      if (el.mitigation) fields.push(["mitigation", el.mitigation]);
      break;
    case "opportunity":
      break;
    case "objective":
      if (el.addresses?.length) fields.push(["addresses", el.addresses.join(", ")]);
      if (el["measured-by"]?.length) fields.push(["measured-by", el["measured-by"].join(", ")]);
      if (el.owner) fields.push(["owner", el.owner]);
      if (el.requires?.length) fields.push(["requires", el.requires.join(", ")]);
      break;
    case "measure":
      if (el.target) fields.push(["target", el.target]);
      break;
    case "owner":
      if (el.role) fields.push(["role", el.role]);
      break;
    case "capability":
      if (el.status) fields.push(["status", el.status]);
      break;
    case "product":
      if (el.enables?.length) fields.push(["enables", el.enables.join(", ")]);
      break;
    case "evaluation":
      if (el.method) fields.push(["method", el.method]);
      break;
    case "improvement":
      if (el.addresses?.length) fields.push(["addresses", el.addresses.join(", ")]);
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
