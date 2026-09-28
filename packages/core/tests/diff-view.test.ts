import { describe, expect, test } from "vite-plus/test";
import { buildDiffView } from "../src/diff-view.ts";
import { diffWorkspaces } from "../src/workspace-diff.ts";
import { FILE, block, risk, workspace } from "./diff-helpers.ts";

const SIGNALS = "02-signals.biz42.md";
const signals = `# Signals\n\n## Price war\n\nCompetitors cut prices.\n\n${block("signal", { id: "price-war", title: "Price war", surfaces: "churn" })}\n`;

describe("buildDiffView", () => {
  test("renders a modified section with both sides and its related elements", () => {
    const view = buildDiffView(
      workspace({ [FILE]: risk(), [SIGNALS]: signals }),
      workspace({
        [FILE]: risk("Key customers are leaving.", {
          id: "churn",
          title: "Churn",
          severity: "low",
        }),
        [SIGNALS]: signals,
      }),
    );
    expect(view.documents).toHaveLength(1);
    const [document] = view.documents;
    expect(document).toMatchObject({ file: FILE, title: "Risks", added: 0, modified: 1 });
    const [segment] = document!.segments;
    expect(segment).toMatchObject({
      status: "modified",
      section: { headingPath: ["Risks", "Churn"] },
      elements: [{ id: "churn", status: "modified" }],
    });
    // The signal that surfaces the risk comes along, so its card can link to it.
    expect(segment!.head!.elements.map((element) => element.id)).toEqual(["churn", "price-war"]);
    expect(segment!.head!.edges).toEqual([
      { from: "price-war", to: "churn", relation: "surfaces" },
    ]);
    expect(segment!.base!.nodes[0]).toMatchObject({ kind: "heading", text: "Churn" });
  });

  test("uses a precomputed diff and leaves unchanged documents out", () => {
    const base = workspace({ [FILE]: risk(), [SIGNALS]: signals });
    const head = workspace({ [FILE]: risk("Changed."), [SIGNALS]: signals });
    const view = buildDiffView(base, head, diffWorkspaces(base, head));
    expect(view.documents.map((document) => document.file)).toEqual([FILE]);
  });

  test("marks added and removed sections with a single side", () => {
    const added = `${risk()}\n## Key person\n\nOnly one person knows billing.\n\n${block("risk", { id: "key-person", title: "Key person", severity: "medium" })}\n`;
    const grown = buildDiffView(workspace({ [FILE]: risk() }), workspace({ [FILE]: added }));
    expect(grown.documents[0]!.segments).toMatchObject([{ status: "added" }]);
    expect(grown.documents[0]!.segments[0]!.base).toBeUndefined();

    const shrunk = buildDiffView(workspace({ [FILE]: added }), workspace({ [FILE]: risk() }));
    expect(shrunk.documents[0]!.segments).toMatchObject([{ status: "removed" }]);
    expect(shrunk.documents[0]!.segments[0]!.head).toBeUndefined();
  });

  test("shows a renamed section once, with its heading change", () => {
    const view = buildDiffView(
      workspace({ [FILE]: risk() }),
      workspace({ [FILE]: risk().replace("## Churn", "## Attrition") }),
    );
    expect(view.documents[0]!.segments).toMatchObject([
      { status: "modified", heading: { before: "Churn", after: "Attrition" } },
    ]);
  });

  test("survives a JSON round trip unchanged", () => {
    const view = buildDiffView(workspace({ [FILE]: risk() }), workspace({ [FILE]: risk("New.") }));
    expect(JSON.parse(JSON.stringify(view))).toEqual(view);
  });

  test("outlines a changed document with every section and its status", () => {
    const base = `# Risks\n\n## Market\n\nThe market.\n\n## Legacy\n\nOld.\n\n## Notes\n\nNotes.\n`;
    const head = `# Risks\n\n## Market\n\nThe market is shrinking.\n\n## Notes\n\nNotes.\n`;
    const view = buildDiffView(workspace({ [FILE]: base }), workspace({ [FILE]: head }));
    expect(
      view.documents[0]!.outline.map((entry) => [entry.title, entry.level, entry.status]),
    ).toEqual([
      ["Risks", 1, "unchanged"],
      ["Market", 2, "modified"],
      ["Legacy", 2, "removed"],
      ["Notes", 2, "unchanged"],
    ]);
    expect(view.documents[0]!.outline[2]!.head).toBeUndefined();
  });
});

describe("buildDiffView — diagrams", () => {
  test("carries the diagrams of a section and the elements they mention", () => {
    const scope = (source: string) =>
      `# Scope\n\n## Overview\n\nThe big picture.\n\n\`\`\`biz42\n:::diagram\nid: overview\nnotation: flowchart\n:::\n\`\`\`\n\`\`\`mermaid\n${source}\n\`\`\`\n`;
    const view = buildDiffView(
      workspace({ "01-scope.biz42.md": scope("flowchart LR\n  churn --> a"), [FILE]: risk() }),
      workspace({ "01-scope.biz42.md": scope("flowchart LR\n  churn --> b"), [FILE]: risk() }),
    );
    const [segment] = view.documents[0]!.segments;
    expect(segment!.diagrams).toMatchObject([{ id: "overview", status: "modified" }]);
    expect(segment!.head!.diagrams).toMatchObject([
      { id: "overview", source: "flowchart LR\n  churn --> b" },
    ]);
    expect(segment!.base!.diagrams).toMatchObject([{ source: "flowchart LR\n  churn --> a" }]);
    expect(segment!.head!.elements.map((element) => element.id)).toEqual(["churn"]);
  });
});
