import { loadWorkspaceFromDocuments, parseBusinessDocument } from "../src/biz42.ts";

/** Build a workspace from in-memory documents: file path → Markdown source. */
export function workspace(files: Record<string, string>) {
  return loadWorkspaceFromDocuments(
    Object.entries(files).map(([file, content]) => parseBusinessDocument(file, content)),
  );
}

/** A biz42 block wrapped in its fence. */
export function block(type: string, attributes: Record<string, string>): string {
  const lines = Object.entries(attributes).map(([key, value]) => `${key}: ${value}`);
  return ["```biz42", `:::${type}`, ...lines, ":::", "```"].join("\n");
}

export const FILE = "04-risks.biz42.md";

/** Chapter 4 with one risk: a heading, its prose, and the block. */
export function risk(
  prose = "Key customers may leave for cheaper competitors.",
  attributes: Record<string, string> = { id: "churn", title: "Churn", severity: "high" },
): string {
  return `# Risks\n\n## Churn\n\n${prose}\n\n${block("risk", attributes)}\n`;
}
