import React, { useEffect, useMemo, useRef, useState } from "react";
import mermaid from "mermaid";
import styles from "./MermaidDiagram.module.css";

let mermaidCounter = 0;

/** Read the current effective theme from the data-theme attribute or system preference. */
function getEffectiveMermaidTheme(): "dark" | "default" {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "dark") return "dark";
  if (attr === "light") return "default";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "default";
}

export interface MermaidDiagramProps {
  source: string;
  id?: string;
  /** Map of Mermaid node id → URL to navigate to on click */
  clickableNodes?: Map<string, string>;
}

/**
 * Strip Markdown code fence markers from diagram source if present.
 */
function cleanSource(source: string): string {
  return source
    .trimStart()
    .replace(/^```[a-zA-Z0-9_-]*[ \t]*\n/, "")
    .replace(/\n```[ \t]*$/, "")
    .trim();
}

/**
 * Append Mermaid `click` directives for each clickable node.
 */
function applyClickDirectives(source: string, clickableNodes: Map<string, string>): string {
  if (clickableNodes.size === 0) return source;
  const lines: string[] = [];
  for (const [nodeId, url] of clickableNodes) {
    lines.push(`click ${nodeId} href "${url}" "_self"`);
  }
  return source + "\n" + lines.join("\n");
}

/** Hook that returns the current mermaid theme and updates when data-theme changes. */
function useMermaidTheme(): "dark" | "default" {
  const [mermaidTheme, setMermaidTheme] = useState<"dark" | "default">(getEffectiveMermaidTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setMermaidTheme(getEffectiveMermaidTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const mqHandler = () => {
      if (!document.documentElement.getAttribute("data-theme")) {
        setMermaidTheme(getEffectiveMermaidTheme());
      }
    };
    mq.addEventListener("change", mqHandler);

    return () => {
      observer.disconnect();
      mq.removeEventListener("change", mqHandler);
    };
  }, []);

  return mermaidTheme;
}

export function MermaidDiagram({ source, id, clickableNodes }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [rendered, setRendered] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panning, setPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const diagramId = useRef(`mermaid-${id ?? ++mermaidCounter}`);
  const mermaidTheme = useMermaidTheme();

  function startPan(event: React.PointerEvent<HTMLDivElement>) {
    const viewport = event.currentTarget;
    if (zoom <= 1) return;
    viewport.setPointerCapture(event.pointerId);
    panStart.current = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };
    setPanning(true);
  }

  function movePan(event: React.PointerEvent<HTMLDivElement>) {
    if (!panning) return;
    const viewport = event.currentTarget;
    viewport.scrollLeft = panStart.current.scrollLeft - (event.clientX - panStart.current.x);
    viewport.scrollTop = panStart.current.scrollTop - (event.clientY - panStart.current.y);
  }

  function endPan(event: React.PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setPanning(false);
  }

  useEffect(() => {
    if (!fullscreen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setFullscreen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [fullscreen]);

  const cleanedSource = useMemo(() => {
    const clean = cleanSource(source);
    return clickableNodes && clickableNodes.size > 0
      ? applyClickDirectives(clean, clickableNodes)
      : clean;
  }, [source, clickableNodes]);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    setRendered(false);
    setError(null);

    mermaid.initialize({ startOnLoad: false, theme: mermaidTheme, securityLevel: "loose" });

    async function render() {
      try {
        const renderId = `${diagramId.current}-${mermaidTheme}`;
        const { svg } = await mermaid.render(renderId, cleanedSource);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setRendered(true);
        }
      } catch (err) {
        containerRef.current?.querySelector(`#${CSS.escape(diagramId.current)}`)?.remove();
        containerRef.current?.replaceChildren();
        if (!cancelled) {
          setError(String(err));
        }
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [cleanedSource, mermaidTheme]);

  if (error) {
    return (
      <figure className={[styles.figure, styles.error].join(" ")}>
        <pre className={styles.raw}>{cleanedSource}</pre>
        <figcaption className={styles.errorMsg}>Diagram render error: {error}</figcaption>
      </figure>
    );
  }

  return (
    <figure
      className={[styles.figure, fullscreen ? styles.fullscreen : "", !rendered && styles.loading]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.toolbar}>
        <button
          type="button"
          onClick={() => setZoom((v) => Math.max(0.5, v - 0.1))}
          aria-label="Zoom out"
        >
          −
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          onClick={() => setZoom((v) => Math.min(3, v + 0.1))}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className={styles.fullscreenButton}
          onClick={() => {
            setFullscreen((v) => !v);
            setZoom(1);
          }}
          aria-label={fullscreen ? "Close fullscreen diagram" : "Open diagram fullscreen"}
          title={fullscreen ? "Close fullscreen" : "Fullscreen"}
        >
          <span aria-hidden="true">{fullscreen ? "⤢" : "⛶"}</span>
        </button>
      </div>
      <div
        className={[styles.viewport, zoom > 1 ? styles.pannable : "", panning ? styles.panning : ""]
          .filter(Boolean)
          .join(" ")}
        onPointerDown={startPan}
        onPointerMove={movePan}
        onPointerUp={endPan}
        onPointerCancel={endPan}
      >
        <div
          data-testid="diagram"
          ref={containerRef}
          className={styles.svg}
          style={{ transform: `scale(${zoom})` }}
        />
      </div>
      {!rendered && <div className={styles.spinner} aria-label="Rendering diagram…" />}
    </figure>
  );
}
