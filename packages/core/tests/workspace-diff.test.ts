import { describe, expect, test } from "vite-plus/test";
import { diffWorkspaces } from "../src/workspace-diff.ts";
import { FILE, block, risk, workspace } from "./diff-helpers.ts";

const RISKS = ["Risks", "Churn"];

describe("diffWorkspaces — elements", () => {
  test("reports nothing for identical snapshots", () => {
    const diff = diffWorkspaces(workspace({ [FILE]: risk() }), workspace({ [FILE]: risk() }));
    expect(diff).toEqual({
      elements: [],
      diagrams: [],
      edges: [],
      proseSections: [],
      documents: [],
    });
  });

  test("reports attribute changes with old and new values", () => {
    const diff = diffWorkspaces(
      workspace({ [FILE]: risk() }),
      workspace({ [FILE]: risk(undefined, { id: "churn", title: "Churn", severity: "low" }) }),
    );
    expect(diff.elements).toEqual([
      {
        id: "churn",
        kind: "risk",
        status: "modified",
        attributes: [{ name: "severity", before: "high", after: "low" }],
        proseChanged: false,
        base: { file: FILE, line: 8 },
        head: { file: FILE, line: 8 },
        section: { file: FILE, headingPath: RISKS, occurrence: 1 },
      },
    ]);
  });

  test("attaches a prose change to the block of the same section", () => {
    const diff = diffWorkspaces(
      workspace({ [FILE]: risk() }),
      workspace({
        [FILE]: risk("Key customers are leaving.", {
          id: "churn",
          title: "Churn",
          severity: "low",
        }),
      }),
    );
    expect(diff.elements[0]).toMatchObject({ status: "modified", proseChanged: true });
  });

  test("reports prose-only changes on an unchanged element", () => {
    const diff = diffWorkspaces(
      workspace({ [FILE]: risk() }),
      workspace({ [FILE]: risk("Key customers are leaving.") }),
    );
    expect(diff.elements).toMatchObject([
      { id: "churn", status: "unchanged", attributes: [], proseChanged: true },
    ]);
  });

  test("ignores reflowed prose, attribute order and list order", () => {
    const signal = (prose: string, attributes: Record<string, string>) =>
      `# Signals\n\n## Price war\n\n${prose}\n\n${block("signal", attributes)}\n`;
    const base = workspace({
      [FILE]: risk(),
      "02-signals.biz42.md": signal("Competitors\ncut prices.", {
        id: "price-war",
        title: "Price war",
        surfaces: "churn, margin",
      }),
    });
    const head = workspace({
      [FILE]: risk(),
      "02-signals.biz42.md": signal("Competitors   cut prices.", {
        surfaces: "margin, churn",
        title: "Price war",
        id: "price-war",
      }),
    });
    expect(diffWorkspaces(base, head).elements).toEqual([]);
  });

  test("an element added with its own new section has changed prose", () => {
    const head = `${risk()}\n## Key person\n\nOnly one person knows billing.\n\n${block("risk", { id: "key-person", title: "Key person", severity: "medium" })}\n`;
    const diff = diffWorkspaces(workspace({ [FILE]: risk() }), workspace({ [FILE]: head }));
    expect(diff.elements).toMatchObject([
      { id: "key-person", status: "added", proseChanged: true, head: { file: FILE } },
    ]);
    expect(diff.elements[0]?.base).toBeUndefined();
  });

  test("an element added to an unchanged section has unchanged prose", () => {
    const base = `# Risks\n\n## Key person\n\nOnly one person knows billing.\n`;
    const head = `${base}\n${block("risk", { id: "key-person", title: "Key person", severity: "medium" })}\n`;
    const diff = diffWorkspaces(workspace({ [FILE]: base }), workspace({ [FILE]: head }));
    expect(diff.elements).toMatchObject([
      { id: "key-person", status: "added", proseChanged: false },
    ]);
  });

  test("an element removed with its section has changed prose", () => {
    const diff = diffWorkspaces(workspace({ [FILE]: risk() }), workspace({ [FILE]: "# Risks\n" }));
    expect(diff.elements).toMatchObject([
      { id: "churn", status: "removed", proseChanged: true, base: { file: FILE, line: 8 } },
    ]);
  });

  test("an element removed while its prose stays has unchanged prose", () => {
    const diff = diffWorkspaces(
      workspace({ [FILE]: risk() }),
      workspace({
        [FILE]: "# Risks\n\n## Churn\n\nKey customers may leave for cheaper competitors.\n",
      }),
    );
    expect(diff.elements).toMatchObject([{ id: "churn", status: "removed", proseChanged: false }]);
  });

  test("a renamed id is a removal plus an addition", () => {
    const diff = diffWorkspaces(
      workspace({ [FILE]: risk() }),
      workspace({
        [FILE]: risk(undefined, { id: "customer-churn", title: "Churn", severity: "high" }),
      }),
    );
    expect(diff.elements.map((change) => [change.id, change.status])).toEqual([
      ["customer-churn", "added"],
      ["churn", "removed"],
    ]);
  });

  test("a renamed heading counts as a prose change", () => {
    const diff = diffWorkspaces(
      workspace({ [FILE]: risk() }),
      workspace({ [FILE]: risk().replace("## Churn", "## Customer churn") }),
    );
    expect(diff.elements).toMatchObject([
      {
        id: "churn",
        status: "unchanged",
        proseChanged: true,
        section: { headingPath: ["Risks", "Customer churn"] },
      },
    ]);
  });

  test("refuses an element before the first heading (E017)", () => {
    const outside = (severity: string) =>
      `${block("risk", { id: "churn", title: "Churn", severity })}\n`;
    expect(() =>
      diffWorkspaces(workspace({ [FILE]: outside("high") }), workspace({ [FILE]: outside("low") })),
    ).toThrow(/04-risks\.biz42\.md:2: block is not placed under any heading \(E017\)/);
  });
});

describe("diffWorkspaces — renamed headings", () => {
  const nested = (parent: string, child: string, prose = "Notes on churn.") =>
    `${risk().replace("## Churn", `## ${parent}`)}\n### ${child}\n\n${prose}\n`;

  test("a section keeps its identity when it defines the same block", () => {
    const diff = diffWorkspaces(
      workspace({ [FILE]: risk() }),
      workspace({
        [FILE]: risk(undefined, { id: "churn", title: "Attrition", severity: "high" }).replace(
          "## Churn",
          "## Attrition",
        ),
      }),
    );
    expect(diff.elements).toMatchObject([
      {
        id: "churn",
        status: "modified",
        proseChanged: true,
        section: { headingPath: ["Risks", "Attrition"] },
      },
    ]);
    expect(diff.proseSections).toEqual([]);
  });

  test("subsections follow a renamed enclosing section", () => {
    const diff = diffWorkspaces(
      workspace({ [FILE]: nested("Churn", "Notes") }),
      workspace({ [FILE]: nested("Attrition", "Notes") }),
    );
    // The heading rename is a prose change of the defining element only.
    expect(diff.elements).toMatchObject([{ id: "churn", status: "unchanged" }]);
    expect(diff.proseSections).toEqual([]);

    const revised = diffWorkspaces(
      workspace({ [FILE]: nested("Churn", "Notes") }),
      workspace({ [FILE]: nested("Attrition", "Notes", "Revised notes.") }),
    );
    expect(revised.proseSections).toMatchObject([
      { status: "modified", section: { headingPath: ["Risks", "Attrition", "Notes"] } },
    ]);
  });

  test("an element whose enclosing heading was renamed has unchanged prose", () => {
    const withChild = (parent: string, severity: string) =>
      `# Risks\n\n## ${parent}\n\nThe market.\n\n### Churn\n\nKey customers may leave.\n\n${block("risk", { id: "churn", title: "Churn", severity })}\n`;
    const diff = diffWorkspaces(
      workspace({ [FILE]: withChild("Market risks", "high") }),
      workspace({ [FILE]: withChild("Commercial risks", "low") }),
    );
    expect(diff.elements).toMatchObject([{ id: "churn", status: "modified", proseChanged: false }]);
  });

  test("a renamed section without a block is a removal plus an addition", () => {
    const diff = diffWorkspaces(
      workspace({ "01-scope.biz42.md": `# Scope\n\n## Purpose\n\nSells software.\n` }),
      workspace({ "01-scope.biz42.md": `# Scope\n\n## Mission\n\nSells software.\n` }),
    );
    expect(diff.proseSections.map((change) => [change.section.headingPath, change.status])).toEqual(
      [
        [["Scope", "Mission"], "added"],
        [["Scope", "Purpose"], "removed"],
      ],
    );
  });
});

describe("diffWorkspaces — edges, diagrams and prose sections", () => {
  const signals = (surfaces?: string) =>
    `# Signals\n\n## Price war\n\nCompetitors cut prices.\n\n${block("signal", {
      id: "price-war",
      title: "Price war",
      ...(surfaces ? { surfaces } : {}),
    })}\n`;

  test("reports added and removed relations", () => {
    const diff = diffWorkspaces(
      workspace({ "02-signals.biz42.md": signals(), [FILE]: risk() }),
      workspace({ "02-signals.biz42.md": signals("churn"), [FILE]: risk() }),
    );
    expect(diff.edges).toEqual([
      { status: "added", edge: { from: "price-war", to: "churn", relation: "surfaces" } },
    ]);
  });

  test("reports diagram source changes but ignores trailing whitespace", () => {
    const diagram = (source: string) =>
      `# Scope\n\n## Overview\n\nThe big picture.\n\n\`\`\`biz42\n:::diagram\nid: overview\nnotation: flowchart\n:::\n\`\`\`\n\`\`\`mermaid\n${source}\n\`\`\`\n`;
    const base = workspace({ "01-scope.biz42.md": diagram("flowchart LR\n  a --> b") });
    expect(
      diffWorkspaces(
        base,
        workspace({ "01-scope.biz42.md": diagram("flowchart LR  \n  a --> b   ") }),
      ).diagrams,
    ).toEqual([]);
    expect(
      diffWorkspaces(base, workspace({ "01-scope.biz42.md": diagram("flowchart LR\n  a --> c") }))
        .diagrams,
    ).toMatchObject([
      {
        id: "overview",
        status: "modified",
        attributes: [{ name: "source", before: "flowchart LR\n  a --> b" }],
      },
    ]);
  });

  test("reports prose-only sections as added, modified and removed", () => {
    const base = `# Scope\n\n## Purpose\n\nSells software.\n\n## Legacy\n\nOld notes.\n`;
    const head = `# Scope\n\n## Purpose\n\nSells software and services.\n\n## Customers\n\nSMEs.\n`;
    const diff = diffWorkspaces(
      workspace({ "01-scope.biz42.md": base }),
      workspace({ "01-scope.biz42.md": head }),
    );
    expect(diff.proseSections.map((change) => [change.section.headingPath, change.status])).toEqual(
      [
        [["Scope", "Purpose"], "modified"],
        [["Scope", "Customers"], "added"],
        [["Scope", "Legacy"], "removed"],
      ],
    );
    expect(diff.documents).toEqual([
      { file: "01-scope.biz42.md", added: 1, modified: 1, removed: 1 },
    ]);
  });

  test("sections that hold a block are reported through their elements only", () => {
    const diff = diffWorkspaces(
      workspace({ [FILE]: risk() }),
      workspace({ [FILE]: risk("Changed prose.") }),
    );
    expect(diff.proseSections).toEqual([]);
    expect(diff.elements).toHaveLength(1);
  });

  test("distinguishes sections with the same heading path by occurrence", () => {
    const base = `# Scope\n\n## Notes\n\nFirst.\n\n## Notes\n\nSecond.\n`;
    const head = `# Scope\n\n## Notes\n\nFirst.\n\n## Notes\n\nSecond, revised.\n`;
    const diff = diffWorkspaces(
      workspace({ "01-scope.biz42.md": base }),
      workspace({ "01-scope.biz42.md": head }),
    );
    expect(diff.proseSections).toMatchObject([
      { status: "modified", section: { headingPath: ["Scope", "Notes"], occurrence: 2 } },
    ]);
  });
});

describe("diffWorkspaces — invalid snapshots fail loudly", () => {
  test("rejects duplicate element ids", () => {
    const duplicated = `${risk()}\n## Copy\n\nCopy.\n\n${block("risk", { id: "churn", title: "Copy", severity: "low" })}\n`;
    expect(() =>
      diffWorkspaces(workspace({ [FILE]: risk() }), workspace({ [FILE]: duplicated })),
    ).toThrow(/Duplicate id 'churn' in head snapshot/);
  });
});
