import type { Workspace } from "../model/types.ts";
import type { ReferenceIndex, Edge } from "./types.ts";

export function buildIndex(workspace: Workspace): ReferenceIndex {
  const byId = new Map<string, import("../model/types.ts").Element>();
  const refsFrom = new Map<string, string[]>();
  const refsTo = new Map<string, string[]>();
  const edges: Edge[] = [];

  // Populate byId
  for (const el of workspace.elements) {
    byId.set(el.id, el);
  }

  function addRef(fromId: string, toId: string) {
    const from = refsFrom.get(fromId) ?? [];
    from.push(toId);
    refsFrom.set(fromId, from);

    const to = refsTo.get(toId) ?? [];
    to.push(fromId);
    refsTo.set(toId, to);
  }

  for (const el of workspace.elements) {
    if (el.kind === "signal") {
      for (const ref of el.surfaces) {
        edges.push({ from: el.id, to: ref, relation: "surfaces" });
        addRef(el.id, ref);
      }
    } else if (el.kind === "expectation") {
      for (const ref of el.surfaces) {
        edges.push({ from: el.id, to: ref, relation: "surfaces" });
        addRef(el.id, ref);
      }
    } else if (el.kind === "objective") {
      // addresses → risk | opportunity
      for (const ref of el.addresses) {
        edges.push({ from: el.id, to: ref, relation: "addresses" });
        addRef(el.id, ref);
      }
      // measured-by → measure
      for (const ref of el["measured-by"]) {
        edges.push({ from: el.id, to: ref, relation: "measured-by" });
        addRef(el.id, ref);
      }
      // owner → owner (single)
      if (el.owner) {
        edges.push({ from: el.id, to: el.owner, relation: "owner" });
        addRef(el.id, el.owner);
      }
      // requires → capability
      for (const ref of el.requires) {
        edges.push({ from: el.id, to: ref, relation: "requires" });
        addRef(el.id, ref);
      }
    } else if (el.kind === "product") {
      // enables → capability
      for (const ref of el.enables) {
        edges.push({ from: el.id, to: ref, relation: "enables" });
        addRef(el.id, ref);
      }
    } else if (el.kind === "improvement") {
      // addresses → objective | risk | measure
      for (const ref of el.addresses) {
        edges.push({ from: el.id, to: ref, relation: "improvement-addresses" });
        addRef(el.id, ref);
      }
    }
  }

  return { byId, refsFrom, refsTo, edges };
}
