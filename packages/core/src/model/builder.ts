import { buildWorkspace as buildModel } from "@cli42/lib/model";
import type { DocumentAst } from "../ast.ts";
import type { Diagram, DiagramNotation, Workspace } from "./types.ts";
import { ELEMENT_SCHEMAS } from "./schemas.ts";

export function buildWorkspace(documents: DocumentAst[]): Workspace {
  return buildModel(documents, {
    elements: ELEMENT_SCHEMAS,
    diagram: (node, loc) => {
      const notation = (node.notation || "auto") as DiagramNotation;
      const diagram: Diagram = {
        id: node.id,
        title: node.title,
        notation,
        source: node.source,
        loc,
      };
      return { diagram };
    },
  });
}
