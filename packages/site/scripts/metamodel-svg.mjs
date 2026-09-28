// Renders the meta-model diagram of the site into a standalone SVG for the
// Markdown docs (docs/metamodel.svg), so both show the same picture.
//   pnpm --filter @biz42/site run metamodel:svg
import { writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "vite-plus";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const root = resolve(import.meta.dirname, "..");
const out = resolve(root, "../../docs/metamodel.svg");

const server = await createServer({
  root,
  configFile: false,
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

try {
  const { MetamodelDiagram } = await server.ssrLoadModule("/src/components/MetamodelDiagram.tsx");

  const html = renderToStaticMarkup(
    createElement(MetamodelDiagram, { hrefBase: "https://mrsimpson.github.io/biz42/model/" }),
  );
  const svg = html.match(/<svg[\s\S]*<\/svg>/)?.[0];
  if (!svg) throw new Error("MetamodelDiagram rendered no <svg>");

  writeFileSync(out, standalone(svg));
  console.log(`wrote ${out}`);
} finally {
  await server.close();
}

/** Adds the site's colour tokens and diagram rules, light and dark, to the SVG. */
function standalone(svg) {
  const css = readFileSync(resolve(root, "src/styles.css"), "utf8");
  const light = block(css, ":root {");
  const dark = block(css, '[data-theme="dark"] {');
  const start = css.indexOf("/* ─── Meta-model diagram");
  const end = css.indexOf("/* ───", start + 10);
  const rules = css
    .slice(start, end === -1 ? undefined : end)
    .replace(/\.container--wide\s*{[^}]*}/, "")
    .replace(/\.metamodel\s*{[^}]*}/, "")
    .replace(/\.metamodel__scroll\s*{[^}]*}/, "")
    .replace(/\.metamodel__svg\s*{[^}]*}/, "")
    .replace(/\.metamodel__caption\s*{[^}]*}/, "")
    .replace(/\/\*[^*]*\*\//g, "")
    .replace(/\n{2,}/g, "\n");
  const style = `svg { ${light} font-family: var(--font-sans); background: var(--bg); }
@media (prefers-color-scheme: dark) { svg { ${dark} } }
${rules}`;
  return (
    svg.replace(
      /^<svg([^>]*)>/,
      `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="480"$1><style>${style}</style><rect width="960" height="480" style="fill:var(--bg)"/>`,
    ) + "\n"
  );
}

function block(css, opener) {
  const i = css.indexOf(opener);
  return css.slice(i + opener.length, css.indexOf("}", i)).trim();
}
