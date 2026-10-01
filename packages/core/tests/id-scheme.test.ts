// Id schemes: each kind declares its prefixes (idPrefixes in the schemas);
// WG08 checks element ids against them and E011 recognises ids in diagrams by them.
import { expect, test, describe } from "vite-plus/test";
import { validate } from "../src/validator/index.ts";
import { buildIndex } from "../src/resolver/index.ts";
import type { Workspace, Element, Diagram } from "../src/model/types.ts";

function workspace(elements: Element[], diagrams: Diagram[] = []): Workspace {
  return { elements, parseErrors: [], documents: [], diagrams, ignoreDirectives: [] };
}

const loc = (line = 1) => ({ file: "02-signals.biz42.md", line });

describe("WG08 — id scheme", () => {
  test("warns about an id without its kind's prefix", () => {
    const ws = workspace([
      { kind: "signal", id: "market-growth", title: "Market growth", surfaces: [], loc: loc(3) },
    ]);
    const wg08 = validate(ws, buildIndex(ws)).filter((d) => d.code === "WG08");
    expect(wg08).toHaveLength(1);
    expect(wg08[0]?.message).toContain("start it with 'signal-' (or 'sig-')");
  });

  test("accepts every declared prefix of a kind", () => {
    const ws = workspace([
      { kind: "signal", id: "signal-growth", title: "A", surfaces: [], loc: loc(1) },
      { kind: "signal", id: "sig-churn", title: "B", surfaces: [], loc: loc(5) },
    ]);
    expect(validate(ws, buildIndex(ws)).filter((d) => d.code === "WG08")).toEqual([]);
  });
});

describe("E011 — diagram ids by the id scheme", () => {
  test("flags an unknown id with a short prefix (cap-) that the former prefix list missed", () => {
    const ws = workspace(
      [],
      [
        {
          id: "map",
          notation: "strategy-map",
          source: "flowchart TB\n  cap-missing --> obj-missing",
          loc: loc(10),
        },
      ],
    );
    const e011 = validate(ws, buildIndex(ws)).filter((d) => d.code === "E011");
    expect(e011.map((d) => d.message)).toEqual([
      "Diagram 'map': node 'cap-missing' is not a known element id",
      "Diagram 'map': node 'obj-missing' is not a known element id",
    ]);
  });
});
