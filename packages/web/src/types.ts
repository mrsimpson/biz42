import type { Element, Edge, Diagram } from "@biz42/core";
import type { DiffPayload, DocumentAst } from "@biz42/core";

export interface WorkspacePayload {
  elements: Element[];
  edges: Edge[];
  documents: DocumentAst[];
  diagrams: Diagram[];
}

declare global {
  interface Window {
    __WORKSPACE__?: WorkspacePayload;
    /** The difference injected by `biz42 build --diff`. */
    __DIFF__?: DiffPayload;
    /** Where `biz42 build --with-history` put the history (or the history itself). */
    __HISTORY__?: import("./useHistory.ts").HistorySource;
  }
}
