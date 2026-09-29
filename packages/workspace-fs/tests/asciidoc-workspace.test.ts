// Black-box tests: an AsciiDoc workspace behaves like its Markdown original.
import { afterEach, describe, expect, test } from "vite-plus/test";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { discoverFiles, loadWorkspace, validateWorkspace } from "../src/index.ts";

const EXAMPLE = resolve(import.meta.dirname, "../../../examples/acme-emergency/docs/biz42");
const createdDirs: string[] = [];

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "biz42-adoc-"));
  createdDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of createdDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** Mechanical Markdown → AsciiDoc: headings and fences; prose stays as is. */
function toAsciidoc(markdown: string): string {
  return markdown
    .split("\n")
    .map((line) => {
      const heading = /^(#{1,6})\s+(.+)$/.exec(line);
      if (heading) return `${"=".repeat(heading[1]!.length)} ${heading[2]}`;
      const open = /^```([a-zA-Z0-9_-]+)\s*$/.exec(line);
      if (open) return `[source,${open[1]}]\n----`;
      if (/^```\s*$/.test(line)) return "----";
      return line;
    })
    .join("\n");
}

function asciidocExample(): string {
  const dir = tempDir();
  for (const name of readdirSync(EXAMPLE)) {
    const content = readFileSync(join(EXAMPLE, name), "utf8");
    writeFileSync(join(dir, name.replace(/\.md$/, ".adoc")), toAsciidoc(content));
  }
  return dir;
}

const withoutLocation = <T extends { loc: { file: string; line: number } }>(items: T[]) =>
  items.map(({ loc: _loc, ...rest }) => rest);

describe("AsciiDoc workspace (.biz42.adoc)", () => {
  test("yields the elements, edges and diagrams of its Markdown original", async () => {
    const markdown = await loadWorkspace(EXAMPLE);
    const asciidoc = await loadWorkspace(asciidocExample());
    expect(asciidoc.elements.length).toBeGreaterThan(0);
    expect(withoutLocation(asciidoc.elements)).toEqual(withoutLocation(markdown.elements));
    expect(asciidoc.edges).toEqual(markdown.edges);
    expect(asciidoc.diagrams.map((d) => [d.id, d.source])).toEqual(
      markdown.diagrams.map((d) => [d.id, d.source]),
    );
  });

  test("validates like its Markdown original", async () => {
    const codes = (result: Awaited<ReturnType<typeof validateWorkspace>>) =>
      result.diagnostics.map((d) => d.code).sort();
    const markdown = await validateWorkspace(EXAMPLE);
    const asciidoc = await validateWorkspace(asciidocExample());
    expect(codes(asciidoc)).toEqual(codes(markdown));
  });

  test("renders prose with Asciidoctor", async () => {
    const dir = tempDir();
    writeFileSync(join(dir, "01-scope.biz42.adoc"), "= Scope\n\nWe do *one* job.\n");
    const { documents } = await loadWorkspace(dir);
    const prose = documents[0]!.nodes.find((node) => node.kind === "prose");
    expect(prose).toMatchObject({ renderedHtml: expect.stringContaining("<strong>one</strong>") });
  });

  test("names the AsciiDoc fence when a block is outside it (WG05)", async () => {
    const dir = tempDir();
    writeFileSync(
      join(dir, "01-scope.biz42.adoc"),
      ["= Scope", "", "Our scope.", "", ":::scope", "id: scope-x", "title: X", ":::", ""].join(
        "\n",
      ),
    );
    const { diagnostics } = await validateWorkspace(dir);
    expect(diagnostics.find((d) => d.code === "WG05")?.message).toContain(
      "[source,biz42] / ---- fence",
    );
  });

  test("refuses a workspace mixing Markdown and AsciiDoc", async () => {
    const dir = tempDir();
    writeFileSync(join(dir, "01-scope.biz42.md"), "# Scope\n");
    writeFileSync(join(dir, "02-signals.biz42.adoc"), "= Signals\n");
    await expect(discoverFiles(dir)).rejects.toThrow(/Mixed notation workspace/);
  });
});
