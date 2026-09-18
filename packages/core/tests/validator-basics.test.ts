import { expect, test, describe } from "vite-plus/test";
import { validate } from "../src/validator/index.ts";
import { buildIndex } from "../src/resolver/index.ts";
import { buildWorkspace } from "../src/model/builder.ts";
import type { Workspace, Element, IgnoreDirective } from "../src/model/types.ts";
import type { DocumentAst } from "../src/ast.ts";

function makeWorkspace(
  elements: Element[],
  parseErrors: Workspace["parseErrors"] = [],
  ignoreDirectives: IgnoreDirective[] = [],
): Workspace {
  return { elements, parseErrors, documents: [], diagrams: [], ignoreDirectives };
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

// ---------------------------------------------------------------------------
// Helper for builder-based tests
// ---------------------------------------------------------------------------

function makeDoc(blockType: string, attrs: Record<string, string>): DocumentAst {
  return {
    filePath: "test.biz42.md",
    nodes: [
      {
        kind: "block",
        blockType,
        attributes: attrs,
        startLine: 1,
        endLine: 5,
        inBiz42Fence: false,
      },
    ],
  };
}

describe("validator › W014 — unknown attribute on block", () => {
  test("emits W014 warning when a block has an unrecognised attribute", () => {
    const ws = buildWorkspace([
      makeDoc("risk", { id: "risk-1", title: "Supply chain", severity: "high", sevrity: "medium" }),
    ]);
    // Block still parses — element is present
    expect(ws.elements).toHaveLength(1);
    expect(ws.parseErrors).toHaveLength(0);
    // Warning is recorded
    expect(ws.parseWarnings).toBeDefined();
    expect(ws.parseWarnings!.some((w) => w.message.includes("sevrity"))).toBe(true);

    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    const w014 = diags.filter((d) => d.code === "W014");
    expect(w014).toHaveLength(1);
    expect(w014[0]!.severity).toBe("warning");
    expect(w014[0]!.message).toMatch(/Unknown attribute 'sevrity' on risk/);
  });

  test("no W014 when all attributes are known", () => {
    const ws = buildWorkspace([
      makeDoc("risk", { id: "risk-1", title: "Supply chain", severity: "high" }),
    ]);
    expect(ws.elements).toHaveLength(1);
    expect(ws.parseErrors).toHaveLength(0);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.filter((d) => d.code === "W014")).toHaveLength(0);
  });

  test("emits one W014 per unknown attribute", () => {
    const ws = buildWorkspace([
      makeDoc("scope", { id: "scope-1", title: "Org", foo: "bar", baz: "qux" }),
    ]);
    expect(ws.elements).toHaveLength(1);
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.filter((d) => d.code === "W014")).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Ignore directive tests
// ---------------------------------------------------------------------------

describe("validator › ignore directives", () => {
  test("W-code directive suppresses a matching warning", () => {
    const ws = makeWorkspace(
      [
        {
          kind: "risk",
          id: "risk-1",
          title: "Orphan risk",
          severity: "low",
          loc: { file: "test.biz42.md", line: 10 },
        },
      ],
      [],
      [{ ruleCode: "W001", file: "test.biz42.md", line: 5, used: false }],
    );
    // Add objective so W001 fires for the risk... actually W001 = unaddressed risk, no objective present
    // directive at line 5, diagnostic will be at line 10 — directive.line <= diagnostic.line ✓
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.filter((d) => d.code === "W001")).toHaveLength(0);
    expect(diags.filter((d) => d.code === "W019")).toHaveLength(0);
  });

  test("H-code directive suppresses a matching hint", () => {
    const ws = makeWorkspace(
      [
        {
          kind: "risk",
          id: "risk-1",
          title: "Orphan risk",
          severity: "low",
          loc: { file: "test.biz42.md", line: 10 },
        },
        {
          kind: "objective",
          id: "obj-1",
          title: "Address it",
          addresses: ["risk-1"],
          "measured-by": [],
          requires: [],
          loc: { file: "test.biz42.md", line: 15 },
        },
      ],
      [],
      [{ ruleCode: "H005", file: "test.biz42.md", line: 1, used: false }],
    );
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.filter((d) => d.code === "H005")).toHaveLength(0);
    expect(diags.filter((d) => d.code === "W019")).toHaveLength(0);
  });

  test("unused directive emits W019 (stale ignore)", () => {
    const ws = makeWorkspace(
      [],
      [],
      [{ ruleCode: "W001", file: "test.biz42.md", line: 5, used: false }],
    );
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    expect(diags.filter((d) => d.code === "W019")).toHaveLength(1);
    expect(diags[0]!.message).toMatch(/W001/);
  });

  test("E-code directive emits W020 and does not suppress the error", () => {
    const ws = makeWorkspace(
      [
        {
          kind: "scope",
          id: "scope-dup",
          title: "Dup A",
          loc: { file: "test.biz42.md", line: 10 },
        },
        {
          kind: "scope",
          id: "scope-dup",
          title: "Dup B",
          loc: { file: "test.biz42.md", line: 20 },
        },
      ],
      [],
      [{ ruleCode: "E001", file: "test.biz42.md", line: 1, used: false }],
    );
    const idx = buildIndex(ws);
    const diags = validate(ws, idx);
    // W020 must be emitted
    const w020 = diags.find((d) => d.code === "W020");
    expect(w020).toBeDefined();
    expect(w020!.message).toMatch(/E001/);
    // E001 must NOT be suppressed
    expect(diags.filter((d) => d.code === "E001")).toHaveLength(1);
    // No W019 for the same directive
    expect(diags.filter((d) => d.code === "W019")).toHaveLength(0);
  });
});
