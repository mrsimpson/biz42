import { TextGetRenderer } from "./text.ts";
import { JsonGetRenderer } from "./json.ts";
import { MarkdownGetRenderer } from "./markdown.ts";
import type { GetRenderer } from "./json.ts";

const textRenderer = new TextGetRenderer();
const jsonRenderer = new JsonGetRenderer();
const markdownRenderer = new MarkdownGetRenderer();

export { type GetRenderer };

export const builtinGetRenderers: readonly GetRenderer[] = [
  textRenderer,
  jsonRenderer,
  markdownRenderer,
];

export const rendererById: ReadonlyMap<string, GetRenderer> = new Map(
  builtinGetRenderers.map((r) => [r.meta.id, r]),
);
