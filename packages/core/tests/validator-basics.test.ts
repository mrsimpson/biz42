import { expect, test, describe } from "vite-plus/test";
import { validate } from "../src/validator/index.ts";
import { buildIndex } from "../src/resolver/index.ts";
import type { Workspace, Element } from "../src/model/types.ts";

function makeWorkspace(elements: Element[], parseErrors: Workspace["parseErrors"] = []): Workspace {
  return { elements, parseErrors, documents: [], diagrams: [] };
}

function loc(line = 1) {
  return { file: "test.biz42.md", line };
}

describe("validator › E001 — duplicate id", () => {
  test("flags two elements with the same id", () => {
    const ws = makeWorkspace([
      { kind: "scope", id: "scope-org", title: "Org", loc: loc(1) },
      { kind: "scope", id: "scope-org", title: "Org duplicate", loc: loc(5) },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.some((d) => d.code === "E001")).toBe(true);
  });

  test("passes when all ids are unique", () => {
    const ws = makeWorkspace([
      { kind: "scope", id: "scope-org", title: "Org", loc: loc(1) },
      { kind: "signal", id: "sig-market", title: "Market growth", surfaces: [], loc: loc(5) },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.filter((d) => d.code === "E001")).toHaveLength(0);
  });
});

describe("validator › E002 — unresolved reference", () => {
  test("flags an objective addressing a non-existent risk id", () => {
    const ws = makeWorkspace([
      {
        kind: "objective",
        id: "obj-1",
        title: "Grow revenue",
        addresses: ["risk-nonexistent"],
        "measured-by": [],
        requires: [],
        loc: loc(1),
      },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.some((d) => d.code === "E002")).toBe(true);
  });
});

describe("validator › W001 — risk unaddressed", () => {
  test("warns when a risk has no objective addressing it", () => {
    const ws = makeWorkspace([
      {
        kind: "risk",
        id: "risk-1",
        title: "Supply chain disruption",
        severity: "high",
        loc: loc(1),
      },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.some((d) => d.code === "W001")).toBe(true);
  });

  test("no warning when risk is addressed by an objective", () => {
    const ws = makeWorkspace([
      {
        kind: "risk",
        id: "risk-1",
        title: "Supply chain disruption",
        severity: "high",
        loc: loc(1),
      },
      {
        kind: "objective",
        id: "obj-1",
        title: "Mitigate risk",
        addresses: ["risk-1"],
        "measured-by": [],
        requires: [],
        loc: loc(5),
      },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.filter((d) => d.code === "W001")).toHaveLength(0);
  });
});
