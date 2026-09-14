import type { Element, Edge } from "@biz42/core";
import type { DocumentAst } from "@biz42/core";

export interface WorkspacePayload {
  elements: Element[];
  edges: Edge[];
  documents: DocumentAst[];
}

declare global {
  interface Window {
    __WORKSPACE__?: WorkspacePayload;
  }
}
