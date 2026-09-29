import { elementWrongChapterRule } from "@cli42/lib/rules";
import type { BlockType } from "../../ast.ts";
import { ELEMENT_CHAPTER } from "../../model/types.ts";
import type { Rule, RuleDocs } from "../types.ts";

/**
 * Expected chapter number derived from the file name convention:
 * 01-scope.biz42.md → chapter 1
 * 06-objectives.biz42.md → chapter 6
 * etc.
 */
function chapterFromFilePath(filePath: string): number | null {
  const base = filePath.split("/").pop() ?? "";
  const match = /^(\d{2})-/.exec(base);
  if (!match) return null;
  return parseInt(match[1]!, 10);
}

export const e004ElementWrongChapter: Rule = elementWrongChapterRule<BlockType, RuleDocs>(
  {
    code: "E004",
    severity: "error",
    type: "problem",
    docs: {
      description: "Element in wrong chapter file — block type does not match the file's chapter",
      rationale:
        "Each biz42 block type belongs to a specific chapter file (e.g. scope belongs in 01-scope.biz42.md). An element in the wrong file is likely a copy-paste error and breaks the one-file-per-chapter convention.",
      biz42Chapter: 0,
      recommended: true,
    },
  },
  { chapters: ELEMENT_CHAPTER, chapterOfFile: chapterFromFilePath },
);
