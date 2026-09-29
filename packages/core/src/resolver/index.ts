import { buildIndex as buildReferenceIndex } from "@cli42/lib/model";
import { ELEMENT_SCHEMAS } from "../model/schemas.ts";
import type { Element, Workspace } from "../model/types.ts";
import type { Edge, ReferenceIndex } from "./types.ts";

/**
 * Index the references between elements. The edges come from the
 * cross-references the schemas declare (see ELEMENT_SCHEMAS).
 */
export function buildIndex(workspace: Workspace): ReferenceIndex {
  return buildReferenceIndex<Element, Edge["relation"]>(workspace.elements, ELEMENT_SCHEMAS);
}
