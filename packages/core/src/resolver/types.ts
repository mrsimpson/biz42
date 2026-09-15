// Reference index produced by the biz42 resolver

import type { Element } from "../model/types.ts";

/** A graph edge connecting two elements */
export interface Edge {
  from: string;
  to: string;
  /** The semantic relationship type */
  relation:
    | "surfaces"
    | "addresses"
    | "measured-by"
    | "owner"
    | "requires"
    | "enables"
    | "fulfills"
    | "evaluates"
    | "triggered-by"
    | "improvement-addresses"
    | "parent";
}

export interface ReferenceIndex {
  /** id → element */
  byId: Map<string, Element>;
  /** id → list of ids this element references */
  refsFrom: Map<string, string[]>;
  /** id → list of ids that reference this element */
  refsTo: Map<string, string[]>;
  /** All reference edges in the workspace */
  edges: Edge[];
}
