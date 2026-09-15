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
    } else if (el.kind === "capability") {
      // enables → product
      for (const ref of el.enables) {
        edges.push({ from: el.id, to: ref, relation: "enables" });
        addRef(el.id, ref);
      }
      // owner → owner (single)
      if (el.owner) {
        edges.push({ from: el.id, to: el.owner, relation: "owner" });
        addRef(el.id, el.owner);
      }
    } else if (el.kind === "product") {
      // fulfills → expectation
      for (const ref of el.fulfills) {
        edges.push({ from: el.id, to: ref, relation: "fulfills" });
        addRef(el.id, ref);
      }
      // owner → owner (single)
      if (el.owner) {
        edges.push({ from: el.id, to: el.owner, relation: "owner" });
        addRef(el.id, el.owner);
      }
    } else if (el.kind === "evaluation") {
      // evaluates → measure
      for (const ref of el.evaluates) {
        edges.push({ from: el.id, to: ref, relation: "evaluates" });
        addRef(el.id, ref);
      }
    } else if (el.kind === "improvement") {
      // triggered-by → evaluation (single)
      if (el["triggered-by"]) {
        edges.push({ from: el.id, to: el["triggered-by"], relation: "triggered-by" });
        addRef(el.id, el["triggered-by"]);
      }
      // addresses → objective | capability | product
      for (const ref of el.addresses) {
        edges.push({ from: el.id, to: ref, relation: "improvement-addresses" });
        addRef(el.id, ref);
      }
    } else if (el.kind === "scope") {
      // parent → scope (single)
      if (el.parent) {
        edges.push({ from: el.id, to: el.parent, relation: "parent" });
        addRef(el.id, el.parent);
      }
    }
  }

  return { byId, refsFrom, refsTo, edges };
}
