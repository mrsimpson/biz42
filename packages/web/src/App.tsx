import { useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import {
  DocumentRoutes,
  WorkspaceLinks,
  changesHref,
  formatRoute,
  historyHref,
  openVersion,
  parseRoute,
  pearlKey,
  versionHref,
} from "@cli42/lib/web";
import type { HistorySource, Route, SnapshotFiles } from "@cli42/lib/web";
import {
  ChangesView,
  HistoryChain,
  HistoryEntryView,
  WebViewProvider,
  useHistory,
  useSnapshot,
  useTheme,
  useVersion,
} from "@cli42/lib/web-react";
import type { WebView } from "@cli42/lib/web-react";
import { loadWorkspaceFromFiles } from "@biz42/core";
import type { Element, DocumentAst, DiffDocument, DiffPayload } from "@biz42/core";
import type { WorkspacePayload } from "./types.ts";
import { DocumentView, NodesRender, isBiz42Block } from "./DocumentView.tsx";
import type { NodesWorkspace } from "./DocumentView.tsx";
import { MetaModelView } from "./MetaModelView.tsx";
import { Sidebar } from "./Sidebar.tsx";
import styles from "./App.module.css";
import "@cli42/lib/web-react/styles.css";
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

interface DiffState {
  diff: DiffPayload | null;
  error: string | null;
}

/**
 * Load the visualized difference: injected by `biz42 build --diff`, or served
 * by `biz42 serve --diff`. 404 means serve runs without --diff; 500 carries the
 * error of a difference that could not be computed.
 */
async function fetchDiff(): Promise<DiffState> {
  const res = await fetch("/api/diff");
  if (res.status === 404) return { diff: null, error: null };
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    return { diff: null, error: body.error ?? `HTTP ${res.status}` };
  }
  return { diff: (await res.json()) as DiffPayload, error: null };
}

// ---------------------------------------------------------------------------
// Routing — the routes of every *42 web view (@cli42/lib/web):
//   #<file>[:el-<id>|:<heading>]            a document, an element opened
//   #changes                                the summary of the visualized difference
//   #history[:<commit|worktree>[:message]]  one pearl of the history
//   ?version=<commit>                       an earlier version as a whole
// ---------------------------------------------------------------------------

/** The route, following the hash. */
function useRoute(): Route {
  const [route, setRoute] = useState(() =>
    parseRoute(window.location.hash, { views: ["meta-model"] }),
  );
  useEffect(() => {
    const onHashChange = () =>
      setRoute(parseRoute(window.location.hash, { views: ["meta-model"] }));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return route;
}

/** Build the workspace of one commit in the browser ("files in, model out"). */
function loadVersion({ files }: SnapshotFiles): Promise<WorkspacePayload> {
  return loadWorkspaceFromFiles(files);
}

// ---------------------------------------------------------------------------
// Loading: workspace, difference, history — and an earlier version
// ---------------------------------------------------------------------------

function Spinner({ children }: { children: ReactNode }) {
  return (
    <div className={styles.loadSpinner} role="status">
      <div className={styles.spinner} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export function App() {
  const [payload, setPayload] = useState<WorkspacePayload | null>(null);
  const [diffState, setDiffState] = useState<DiffState>({ diff: null, error: null });
  const [history, setHistory] = useState<HistorySource | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // An earlier version, selected by ?version=<commit>, replaces the workspace.
  const version = useVersion();
  // Whether there is a history is known once the workspace has loaded.
  const snapshot = useSnapshot(
    payload ? history : undefined,
    version,
    loadVersion,
    "This site has no business model history.",
  );

  useEffect(() => {
    // biz42 build: workspace — and with --diff / --with-history, the difference
    // and the history — injected inline as window.__WORKSPACE__ / __DIFF__ / __HISTORY__.
    const injected = window.__WORKSPACE__;
    if (injected) {
      const diff = window.__DIFF__ ?? null;
      setPayload(injected);
      setDiffState({ diff, error: null });
      setHistory(window.__HISTORY__ ?? null);
      setDefaultHash(injected, diff !== null);
      return;
    }
    // biz42 serve: always offers the history; its index answers why when there is none.
    setHistory({ base: "/api/history/" });
    let events: EventSource | undefined;
    let active = true;
    Promise.all([fetchWorkspace(), fetchDiff()])
      .then(([p, d]) => {
        if (!active) return;
        setPayload(p);
        setDiffState(d);
        setDefaultHash(p, d.diff !== null || d.error !== null);
        // serve watches the workspace and Git and announces reloads over SSE.
        events = new EventSource("/api/workspace/events");
        events.addEventListener("workspace", () => {
          setRefreshToken((token) => token + 1);
          fetchWorkspace()
            .then(setPayload)
            .catch((e: unknown) => setError(String(e)));
          fetchDiff()
            .then(setDiffState)
            .catch((e: unknown) => setDiffState({ diff: null, error: String(e) }));
        });
      })
      .catch((e: unknown) => setError(String(e)));
    return () => {
      active = false;
      events?.close();
    };
  }, []);

  if (error) {
    return (
      <div className={styles.loadError}>
        <h1>Failed to load workspace</h1>
        <pre>{error}</pre>
      </div>
    );
  }
  if (!payload) return <Spinner>Loading…</Spinner>;

  if (version) {
    if (snapshot.status === "error") {
      return (
        <div className={styles.loadError} data-testid="version-error">
          <h1>Failed to load version {version.slice(0, 8)}</h1>
          <pre>{snapshot.reason}</pre>
          <a href={versionHref(null)}>Back to the current version</a>
        </div>
      );
    }
    if (snapshot.status === "loading")
      return <Spinner>Loading version {version.slice(0, 8)}…</Spinner>;
    // The difference belongs to the current version, so it is not shown here.
    return (
      <WorkspaceApp
        key={version}
        payload={snapshot.payload}
        diff={null}
        diffError={null}
        history={history}
        refreshToken={refreshToken}
        version={version}
      />
    );
  }
  return (
    <WorkspaceApp
      key="current"
      payload={payload}
      diff={diffState.diff}
      diffError={diffState.error}
      history={history}
      refreshToken={refreshToken}
      version={null}
    />
  );
}

/** Without a hash, open the difference's summary, or else the first document. */
function setDefaultHash(payload: WorkspacePayload, hasDiff: boolean) {
  if (window.location.hash) return;
  const first = payload.documents[0];
  if (hasDiff) window.history.replaceState(null, "", "#changes");
  else if (first) {
    const routes = new DocumentRoutes(payload.documents.map((d) => d.filePath));
    window.history.replaceState(null, "", routes.documentHref(first.filePath));
  }
}

// ---------------------------------------------------------------------------
// Workspace app
// ---------------------------------------------------------------------------

interface WorkspaceAppProps {
  payload: WorkspacePayload;
  /** The visualized difference (serve/build --diff), if any. */
  diff: DiffPayload | null;
  /** Error of a difference that could not be computed. */
  diffError: string | null;
  /** Where to load the business model history from, if any. */
  history: HistorySource | null;
  /** Changes whenever the server announces new data. */
  refreshToken: number;
  /** The commit of the earlier version shown instead of the current one, if any. */
  version: string | null;
}

function WorkspaceApp({
  payload,
  diff,
  diffError,
  history,
  refreshToken,
  version,
}: WorkspaceAppProps) {
  const route = useRoute();
  const [agentView, setAgentView] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();

  const documents: DocumentAst[] = payload.documents;
  const routes = useMemo(() => new DocumentRoutes(documents.map((d) => d.filePath)), [documents]);
  const links = useMemo(() => new WorkspaceLinks(routes, payload.elements), [routes, payload]);

  // The active document: the route's, else the one shown before (other views), else the first.
  const [lastDocument, setLastDocument] = useState(0);
  const routedIndex =
    route.view === "document" && route.file
      ? documents.findIndex((d) => d.filePath === routes.resolve(route.file))
      : -1;
  const activeDocIndex =
    route.view === "document"
      ? Math.max(routedIndex, 0)
      : Math.min(lastDocument, documents.length - 1);
  useEffect(() => {
    if (route.view === "document") setLastDocument(activeDocIndex);
  }, [route, activeDocIndex]);

  // Element anchors open the element's card; other anchors scroll to a heading.
  const [targetElementId, setTargetElementId] = useState<string | null>(null);
  useEffect(() => {
    if (route.view !== "document") return;
    if (route.element) {
      setTargetElementId(route.element);
    } else if (route.anchor) {
      const anchor = route.anchor;
      requestAnimationFrame(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [route]);

  function navigate(next: Route) {
    window.location.hash = formatRoute(next);
    setSidebarOpen(false);
  }

  // Changes view — #changes, shown whenever a difference is visualized
  const hasDiff = diff !== null || diffError !== null;
  const showChanges = hasDiff && route.view === "changes";

  // Meta-model view — #meta-model
  const showMetaModel = route.view === "app" && route.name === "meta-model";

  // History — #history, #history:<commit|worktree>[:message]
  const showHistory = history !== null && route.view === "history";
  const historyKey = route.view === "history" ? route.key : undefined;
  const historyMessage = route.view === "history" && route.message;
  const historyData = useHistory<DiffPayload>(history, refreshToken);
  const pearls = historyData.state.status === "ready" ? historyData.state.pearls : [];

  // Entering the history without a selection opens the newest pearl.
  useEffect(() => {
    if (showHistory && historyKey === null && pearls[0]) {
      window.history.replaceState(null, "", historyHref(pearlKey(pearls[0])));
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  }, [showHistory, historyKey, pearls]);

  /** Open a pearl's change; with `message`, its commit message too. */
  function selectPearl(key: string, message = false) {
    window.location.hash = historyHref(key, message);
  }
  const selectedPearl = pearls.find((pearl) => pearlKey(pearl) === historyKey);
  const versionPearl = version ? pearls.find((pearl) => pearl.commit === version) : undefined;

  /** Open the history; from an earlier version, back in the current one at that pearl. */
  function selectHistory() {
    if (version) openVersion(null, historyHref(version));
    else window.location.hash = historyHref();
  }

  const changedDocuments = useMemo(
    () =>
      new Map<string, DiffDocument>(
        diff?.view.documents.map((d) => [routes.keyOf(d.file), d]) ?? [],
      ),
    [diff, routes],
  );

  // Summary links lead into the chapters: to the element card when the element
  // exists after the change, else to its chapter.
  const diffElementFiles = useMemo(() => {
    const files = new Map<string, { file: string; inHead: boolean }>();
    for (const document of diff?.view.documents ?? []) {
      for (const segment of document.segments) {
        for (const change of segment.elements) {
          const location = change.head ?? change.base;
          if (location) files.set(change.id, { file: location.file, inHead: !!change.head });
        }
      }
    }
    return files;
  }, [diff]);

  function diffElementLink(elementId: string) {
    const changed = diffElementFiles.get(elementId);
    if (changed) {
      return {
        href: changed.inHead
          ? routes.elementHref(changed.file, elementId)
          : routes.documentHref(changed.file),
      };
    }
    const href = links.elementHref(elementId);
    return href ? { href } : null;
  }

  // Build elements map (id → element) — used by ElementCard and AstNodeRenderer
  const elementsMap = useMemo(() => {
    const map = new Map<string, Element>();
    for (const el of payload.elements) map.set(el.id, el);
    return map;
  }, [payload.elements]);

  const workspace = useMemo<NodesWorkspace>(
    () => ({ elementsMap, links, edges: payload.edges, diagrams: payload.diagrams }),
    [elementsMap, links, payload.edges, payload.diagrams],
  );
  const webView = useMemo<WebView>(
    () => ({
      labels: { model: "business model" },
      isBlock: isBiz42Block,
      renderNodes: (props) => <NodesRender {...props} workspace={workspace} />,
    }),
    [workspace],
  );

  const viewMode = agentView ? "agent" : "human";
  const activeDoc = documents[activeDocIndex] ?? null;

  return (
    <WebViewProvider value={webView}>
      <div className={styles.layout}>
        <button
          className={styles.menuButton}
          type="button"
          aria-label="Open document navigation"
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen(true)}
        >
          <span aria-hidden="true">☰</span>
          <span>Contents</span>
        </button>
        {sidebarOpen && (
          <button
            className={styles.sidebarBackdrop}
            type="button"
            aria-label="Close document navigation"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar
          documents={documents}
          routes={routes}
          activeDocIndex={showHistory ? -1 : activeDocIndex}
          onSelectDoc={(idx) => {
            const doc = documents[idx];
            if (doc) window.location.hash = routes.documentHref(doc.filePath);
            setSidebarOpen(false);
          }}
          changes={
            hasDiff
              ? {
                  active: showChanges,
                  onSelect: () => navigate({ view: "changes" }),
                  documents: changedDocuments,
                }
              : undefined
          }
          history={
            history
              ? {
                  active: showHistory,
                  onSelect: selectHistory,
                  onSelectDocuments: () => {
                    window.location.hash = hasDiff
                      ? changesHref
                      : routes.documentHref(documents[activeDocIndex]?.filePath ?? "");
                  },
                  panel: (
                    <HistoryChain
                      state={historyData.state}
                      entries={historyData.entries}
                      chunkErrors={historyData.chunkErrors}
                      requestChunk={historyData.requestChunk}
                      selectedKey={historyKey ?? null}
                      onSelect={(key) => {
                        selectPearl(key);
                        setSidebarOpen(false);
                      }}
                    />
                  ),
                }
              : undefined
          }
          viewMode={viewMode}
          onToggleViewMode={() => setAgentView((v) => !v)}
          theme={theme}
          onToggleTheme={toggleTheme}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          metaModel={{
            active: showMetaModel,
            onSelect: () => navigate({ view: "app", name: "meta-model" }),
          }}
        />

        <main className={styles.main}>
          {version && (
            <p className={styles.versionBanner} role="status" data-testid="version-banner">
              <span>
                Earlier version <code>{version.slice(0, 8)}</code>
                {versionPearl && (
                  <>
                    {" "}
                    · {versionPearl.subject} · {versionPearl.date.slice(0, 10)}
                  </>
                )}
              </span>
              <a
                href={versionHref(null)}
                data-testid="version-leave"
                onClick={(event) => {
                  event.preventDefault();
                  openVersion(null);
                }}
              >
                Back to the current version
              </a>
            </p>
          )}
          {showHistory ? (
            <HistoryEntryView
              pearl={selectedPearl}
              entry={historyKey ? historyData.entries.get(historyKey) : undefined}
              chunkError={
                selectedPearl ? historyData.chunkErrors.get(selectedPearl.chunk) : undefined
              }
              requestChunk={historyData.requestChunk}
              viewMode={viewMode}
              elementHref={(id) => links.elementHref(id)}
              messageOpen={historyMessage}
              onToggleMessage={() => historyKey && selectPearl(historyKey, !historyMessage)}
              onBrowse={(commit) => openVersion(commit)}
            />
          ) : showChanges ? (
            <ChangesView
              diff={diff}
              error={diffError}
              viewMode={viewMode}
              elementLink={diffElementLink}
              documentLink={(file) => ({ href: routes.documentHref(file) })}
            />
          ) : showMetaModel ? (
            <MetaModelView
              onNavigateToChapter={(ch) => {
                const doc = documents.find((d) => {
                  const m = /^(\d+)-/.exec(d.filePath.split("/").pop() ?? "");
                  return m ? parseInt(m[1]!, 10) === ch : false;
                });
                if (doc) window.location.hash = routes.documentHref(doc.filePath);
              }}
            />
          ) : activeDoc ? (
            <DocumentView
              doc={activeDoc}
              viewMode={viewMode}
              {...workspace}
              targetElementId={targetElementId}
              onTargetConsumed={() => setTargetElementId(null)}
              diffDocument={
                hasDiff ? changedDocuments.get(routes.keyOf(activeDoc.filePath)) : undefined
              }
            />
          ) : (
            <div style={{ color: "var(--text-muted)", padding: "2rem" }}>No document selected.</div>
          )}
        </main>
      </div>
    </WebViewProvider>
  );
}
