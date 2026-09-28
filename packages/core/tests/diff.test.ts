import { describe, expect, test } from "vite-plus/test";
import { lintBusinessModelDiff } from "../src/diff.ts";
import { FILE, block, risk, workspace } from "./diff-helpers.ts";

const OTHER = `\n## Key person\n\nOnly one person knows billing.\n\n${block("risk", { id: "key-person", title: "Key person", severity: "medium" })}\n`;

function lint(base: string, head: string) {
  return lintBusinessModelDiff(workspace({ [FILE]: base }), workspace({ [FILE]: head }));
}

describe("business model diff lint", () => {
  test("reports a block-only change and ignores an unrelated section", () => {
    const result = lint(
      risk() + OTHER,
      risk(undefined, { id: "churn", title: "Churn", severity: "low" }) + OTHER,
    );
    expect(result.findings).toEqual([
      {
        kind: "block-without-prose-change",
        severity: "warning",
        file: FILE,
        line: 8,
        elementId: "churn",
        message: "Block 'churn' changed without changing its section prose.",
      },
    ]);
    expect(result.hasBlockingFindings).toBe(true);
  });

  test("accepts a prose and block change in the same section", () => {
    const result = lint(
      risk(),
      risk("Key customers are leaving.", { id: "churn", title: "Churn", severity: "low" }),
    );
    expect(result.findings).toEqual([]);
    expect(result.hasBlockingFindings).toBe(false);
    expect(result.model.elements).toHaveLength(1);
  });

  test("reports prose-only changes", () => {
    const result = lint(risk(), risk("Key customers are leaving."));
    expect(result.findings).toMatchObject([
      {
        kind: "prose-without-block-change",
        elementId: "churn",
        message: "Section prose changed without changing block 'churn'.",
      },
    ]);
  });

  test("accepts deletion of a block together with its prose", () => {
    expect(lint(risk() + OTHER, `# Risks\n${OTHER}`).findings).toEqual([]);
  });

  test("reports deletion of a block when its prose remains", () => {
    const result = lint(
      risk(),
      "# Risks\n\n## Churn\n\nKey customers may leave for cheaper competitors.\n",
    );
    expect(result.findings).toMatchObject([
      {
        kind: "block-without-prose-change",
        message: "Block 'churn' was deleted without deleting its section prose.",
      },
    ]);
  });
});
