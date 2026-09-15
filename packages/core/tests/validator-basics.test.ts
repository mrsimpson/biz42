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

describe("validator › H001/H002 — signal/expectation severity upgrade", () => {
  test("H001 has severity warning (not hint)", () => {
    const ws = makeWorkspace([
      { kind: "signal", id: "sig-1", title: "Market shift", surfaces: [], loc: loc(1) },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    const d = diags.find((d) => d.code === "H001");
    expect(d).toBeDefined();
    expect(d!.severity).toBe("warning");
  });

  test("H002 has severity warning (not hint)", () => {
    const ws = makeWorkspace([
      { kind: "expectation", id: "exp-1", title: "Fast delivery", surfaces: [], loc: loc(1) },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    const d = diags.find((d) => d.code === "H002");
    expect(d).toBeDefined();
    expect(d!.severity).toBe("warning");
  });
});

describe("validator › W008 — opportunity unaddressed", () => {
  test("warns when an opportunity has no addressing objective", () => {
    const ws = makeWorkspace([
      { kind: "opportunity", id: "opp-1", title: "New market", loc: loc(1) },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.some((d) => d.code === "W008")).toBe(true);
  });

  test("no warning when opportunity is addressed by an objective", () => {
    const ws = makeWorkspace([
      { kind: "opportunity", id: "opp-1", title: "New market", loc: loc(1) },
      {
        kind: "objective",
        id: "obj-1",
        title: "Enter new market",
        addresses: ["opp-1"],
        "measured-by": [],
        requires: [],
        loc: loc(5),
      },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.filter((d) => d.code === "W008")).toHaveLength(0);
  });
});

describe("validator › W011 — objective not addressing anything", () => {
  test("warns when an objective addresses no risk or opportunity", () => {
    const ws = makeWorkspace([
      {
        kind: "objective",
        id: "obj-1",
        title: "Floating commitment",
        addresses: [],
        "measured-by": [],
        requires: [],
        loc: loc(1),
      },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.some((d) => d.code === "W011")).toBe(true);
  });

  test("no warning when objective addresses a risk", () => {
    const ws = makeWorkspace([
      { kind: "risk", id: "risk-1", title: "Churn", severity: "medium", loc: loc(1) },
      {
        kind: "objective",
        id: "obj-1",
        title: "Reduce churn",
        addresses: ["risk-1"],
        "measured-by": [],
        requires: [],
        loc: loc(5),
      },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.filter((d) => d.code === "W011")).toHaveLength(0);
  });
});

describe("validator › H005 — risk/opportunity with no source context", () => {
  test("hints when a risk has no signal or expectation pointing to it", () => {
    const ws = makeWorkspace([
      { kind: "risk", id: "risk-1", title: "Orphan risk", severity: "low", loc: loc(1) },
      // objective present so W001 doesn't fire — isolates H005
      {
        kind: "objective",
        id: "obj-1",
        title: "Address it",
        addresses: ["risk-1"],
        "measured-by": [],
        requires: [],
        loc: loc(5),
      },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.some((d) => d.code === "H005")).toBe(true);
  });

  test("no hint when a signal surfaces the risk", () => {
    const ws = makeWorkspace([
      {
        kind: "signal",
        id: "sig-1",
        title: "Market signal",
        surfaces: ["risk-1"],
        loc: loc(1),
      },
      { kind: "risk", id: "risk-1", title: "Market risk", severity: "low", loc: loc(3) },
      {
        kind: "objective",
        id: "obj-1",
        title: "Address it",
        addresses: ["risk-1"],
        "measured-by": [],
        requires: [],
        loc: loc(5),
      },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.filter((d) => d.code === "H005")).toHaveLength(0);
  });
});

describe("validator › W012 — evaluation with no evaluates entries", () => {
  test("warns when an evaluation references no measures", () => {
    const ws = makeWorkspace([
      {
        kind: "evaluation",
        id: "eval-1",
        title: "Quarterly review",
        evaluates: [],
        loc: loc(1),
      },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.some((d) => d.code === "W012")).toBe(true);
  });

  test("no warning when evaluation references a measure", () => {
    const ws = makeWorkspace([
      { kind: "measure", id: "meas-1", title: "NPS", loc: loc(1) },
      {
        kind: "evaluation",
        id: "eval-1",
        title: "Quarterly review",
        evaluates: ["meas-1"],
        loc: loc(3),
      },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.filter((d) => d.code === "W012")).toHaveLength(0);
  });
});

describe("validator › H006 — improvement with no triggered-by", () => {
  test("hints when an improvement has no triggered-by", () => {
    const ws = makeWorkspace([
      {
        kind: "improvement",
        id: "imp-1",
        title: "Improve onboarding",
        type: "innovative",
        addresses: [],
        loc: loc(1),
      },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.some((d) => d.code === "H006")).toBe(true);
  });

  test("no hint when improvement has a triggered-by", () => {
    const ws = makeWorkspace([
      {
        kind: "evaluation",
        id: "eval-1",
        title: "Review",
        evaluates: [],
        loc: loc(1),
      },
      {
        kind: "improvement",
        id: "imp-1",
        title: "Improve onboarding",
        type: "innovative",
        "triggered-by": "eval-1",
        addresses: [],
        loc: loc(3),
      },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.filter((d) => d.code === "H006")).toHaveLength(0);
  });
});

describe("validator › W013 — improvement addresses nothing", () => {
  test("warns when an improvement has empty addresses", () => {
    const ws = makeWorkspace([
      {
        kind: "improvement",
        id: "imp-1",
        title: "Vague improvement",
        type: "corrective",
        addresses: [],
        loc: loc(1),
      },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.some((d) => d.code === "W013")).toBe(true);
  });

  test("no warning when improvement addresses an objective", () => {
    const ws = makeWorkspace([
      {
        kind: "objective",
        id: "obj-1",
        title: "Grow revenue",
        addresses: [],
        "measured-by": [],
        requires: [],
        loc: loc(1),
      },
      {
        kind: "improvement",
        id: "imp-1",
        title: "Fix process",
        type: "corrective",
        addresses: ["obj-1"],
        loc: loc(3),
      },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.filter((d) => d.code === "W013")).toHaveLength(0);
  });
});

describe("validator › H007 — capability not required by any objective", () => {
  test("hints when a capability is not required by any objective", () => {
    const ws = makeWorkspace([
      {
        kind: "capability",
        id: "cap-1",
        title: "Data analytics",
        enables: [],
        loc: loc(1),
      },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.some((d) => d.code === "H007")).toBe(true);
  });

  test("no hint when capability is required by an objective", () => {
    const ws = makeWorkspace([
      {
        kind: "capability",
        id: "cap-1",
        title: "Data analytics",
        enables: [],
        loc: loc(1),
      },
      {
        kind: "objective",
        id: "obj-1",
        title: "Use data",
        addresses: [],
        "measured-by": [],
        requires: ["cap-1"],
        loc: loc(3),
      },
    ]);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.filter((d) => d.code === "H007")).toHaveLength(0);
  });
});
