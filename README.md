# biz42

A plain-text, outside-in model for describing a business — grounded in ISO 9001:2015, readable by humans and agents alike.

## What it is

biz42 makes the chain from business goal to product to feature explicit, traceable, and machine-verifiable. Each model element is a structured block in a Markdown file. The blocks link to each other. The CLI validates those links.

Think of it as linting for your business. You can be in an inconsistent state — a product with no expectation, a risk with no objective — but it's flagged, and an agent can correct it.

→ [Introduction and concept](docs/introduction.md)  
→ [Live site](https://mrsimpson.github.io/biz42/)

## Getting started (as a user)

Install the agent skill and let your agent do the heavy lifting:

```
npx skills add mrsimpson/biz42
```

Or use the CLI directly:

```
npx @biz42/cli --help
```

## Getting started (as a contributor)

```bash
git clone https://github.com/mrsimpson/biz42
cd biz42
pnpm install
pnpm build
pnpm test
```

### Structure

| Package                 | Purpose                                               |
| ----------------------- | ----------------------------------------------------- |
| `packages/core`         | Parser, validator, rule engine                        |
| `packages/cli`          | CLI (`biz42`) — the published artifact (`@biz42/cli`) |
| `packages/web`          | SPA viewer bundled into the CLI                       |
| `packages/workspace-fs` | File system workspace loader                          |
| `packages/mermaid`      | Mermaid diagram utilities                             |
| `packages/skill`        | Agent skill definition                                |
| `packages/site`         | Landing page (deployed to GitHub Pages)               |

### Workflow

- `pnpm build` — build all packages
- `pnpm test` — unit tests
- `pnpm validate:all` — validate the project's own docs and examples
- `pnpm docs:preview` — build and serve the full GitHub Pages site locally

Validation rules live in `packages/core/src/validator/rules/`. Each rule is self-contained with an id, severity, and a `check()` function.

## License

MIT
