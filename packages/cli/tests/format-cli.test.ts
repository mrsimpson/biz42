import { describe, expect, test } from "vite-plus/test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cliPath = fileURLToPath(new URL("../src/cli.ts", import.meta.url));
const example = fileURLToPath(new URL("../../../examples/acme-emergency", import.meta.url));

function run(...args: string[]) {
  return spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      "--no-warnings",
      "--conditions=development",
      cliPath,
      "--dir",
      example,
      ...args,
    ],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  );
}

// An unknown --format is a usage error on every command (docToolchain/arc42-language#89): a typo such as
// `--format jsno` must not fall back to text output with exit code 0.
describe("--format", () => {
  test.each([
    [["validate"], "biz42 validate: unknown format 'xml'. Use text or json."],
    [["rules"], "biz42 rules: unknown format 'xml'. Use text or json."],
    [["explain"], "biz42 explain: unknown format 'xml'. Use text or json."],
    [["explain", "ignore"], "biz42 explain: unknown format 'xml'. Use text or json."],
    [["explain", "diagram"], "biz42 explain: unknown format 'xml'. Use text or json."],
    [["get"], "biz42 get: unknown format 'xml'. Use text, json, or markdown."],
    [
      ["get", "--type", "ignore"],
      "biz42 get --type ignore: unknown format 'xml'. Use text or json.",
    ],
  ])("biz42 %j --format xml exits 2 and names the accepted formats", (command, message) => {
    const result = run(...command, "--format", "xml");
    expect(result.stderr.trim()).toBe(message);
    expect(result.stdout).toBe("");
    expect(result.status).toBe(2);
  });

  test.each([["validate"], ["rules"], ["explain"], ["get"]])(
    "biz42 %s --format json still prints JSON",
    (command) => {
      const result = run(command, "--format", "json");
      expect(() => JSON.parse(result.stdout)).not.toThrow();
    },
  );
});
