import type { GetResult, WorkspaceView, ElementView } from "@biz42/core";
import type { Edge } from "@biz42/core";

export interface GetRenderer {
  meta: { id: string; description: string; mimeType: string };
  render(result: GetResult): string;
}

export class JsonGetRenderer implements GetRenderer {
  meta = {
    id: "json",
    description: "JSON renderer",
    mimeType: "application/json",
  };

  render(result: GetResult): string {
    if (result.kind === "workspace") {
      return this.renderWorkspace(result);
    }
    return this.renderElement(result as ElementView);
  }

  private renderWorkspace(view: WorkspaceView): string {
    const output: {
      version: 1;
      elements: unknown[];
      edges: Edge[];
      typeFilter?: string;
    } = {
      version: 1,
      elements: view.elements,
      edges: view.edges,
    };
    if (view.typeFilter) output.typeFilter = view.typeFilter;
    return JSON.stringify(output, null, 2);
  }

  private renderElement(view: ElementView): string {
    const refsFrom = view.refsFrom.map((r) => ({
      id: r.id,
      kind: r.element?.kind,
      title: r.element?.title,
    }));
    const refsTo = view.refsTo.map((r) => ({
      id: r.id,
      kind: r.element?.kind,
      title: r.element?.title,
    }));
    return JSON.stringify({ version: 1, element: view.element, refsFrom, refsTo }, null, 2);
  }
}
