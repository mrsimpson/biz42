import { parseMermaid } from "@biz42/mermaid";
import type { Workspace } from "../model/types.ts";
import type { Diagnostic } from "./types.ts";

/** Run Mermaid's production syntax parser for all typed diagram nodes. */
export async function validateMermaidSyntax(workspace: Workspace): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];

  for (const diagram of workspace.diagrams) {
    // Empty source is caught by W008 / other structural rules
    if (!diagram.source.trim()) continue;

    const result = await parseMermaid({ notation: diagram.notation, source: diagram.source });
    if (!result.ok) {
      diagnostics.push({
        code: "E010",
        severity: "error",
        message: `Mermaid syntax error: ${result.message}`,
        file: diagram.loc.file,
        line: diagram.loc.line,
      });
    }
  }

  // Also validate bare mermaid fences (W009 fires for structure; E010 for syntax)
  for (const document of workspace.documents) {
    for (const node of document.nodes) {
      if (node.kind !== "bare-mermaid") continue;
      if (!node.source.trim()) continue;
      const result = await parseMermaid({ notation: "auto", source: node.source });
      if (!result.ok) {
        diagnostics.push({
          code: "E010",
          severity: "error",
          message: `Mermaid syntax error: ${result.message}`,
          file: document.filePath,
          line: node.startLine,
        });
      }
    }
  }

  return diagnostics;
}

/** Remove diagram-specific findings for diagrams whose syntax is invalid. */
export function suppressInvalidMermaidDiagnostics(
  workspace: Workspace,
  diagnostics: Diagnostic[],
  syntaxDiagnostics: readonly Diagnostic[],
): Diagnostic[] {
  const invalidRanges = workspace.diagrams.flatMap((diagram) => {
    if (!diagram.source.trim()) return [];
    const failed = syntaxDiagnostics.some(
      (d) => d.code === "E010" && d.file === diagram.loc.file && d.line === diagram.loc.line,
    );
    if (!failed) return [];
    return [
      {
        file: diagram.loc.file,
        start: diagram.loc.line,
        end: diagram.loc.line + diagram.source.split("\n").length,
      },
    ];
  });

  return diagnostics.filter(
    (d) =>
      !invalidRanges.some(
        (range) => range.file === d.file && d.line >= range.start && d.line <= range.end,
      ),
  );
}
