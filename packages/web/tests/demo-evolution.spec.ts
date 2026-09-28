import { mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createStoryRepository, expect, startServer, test } from "./diff-fixtures.ts";

// Screenshots of the ACME business development story for the site's evolution
// page (packages/site/src/assets/evolution/). Run with: pnpm demo:evolution

const out = resolve(dirname(fileURLToPath(import.meta.url)), "../../site/src/assets/evolution");

test("screenshots of the business development plan", async ({ page }) => {
  mkdirSync(out, { recursive: true });
  const root = createStoryRepository();
  const server = await startServer(root, 3450, "--diff", "v1.0");
  const shot = (name: string) => join(out, `${name}.png`);
  try {
    await page.setViewportSize({ width: 1280, height: 860 });
    await page.emulateMedia({ colorScheme: "light" });

    // The whole plan against v1.0: what needs attention, then what changed.
    await page.goto(`${server.url}/`);
    await expect(page.getByTestId("diff-index-item")).toHaveCount(12);
    await page.screenshot({ path: shot("01-plan-summary") });

    // The new objective and the extended one, with the strategy map's new lines.
    await page.goto(`${server.url}/#06-objectives.biz42.md`);
    const rollout = page.getByRole("region", { name: /modified: Time to Deployment/ });
    await expect(rollout).toBeVisible();
    await rollout.screenshot({ path: shot("02-existing-objective") });
    const pilots = page.getByRole("region", { name: "added: Operator Pilots" });
    await expect(pilots).toBeVisible();
    await pilots.screenshot({ path: shot("03-new-objective") });

    // The organisation changes: a new role.
    await page.goto(`${server.url}/#08-owners.biz42.md`);
    const owner = page.getByRole("region", { name: "added: Head of Business Development" });
    await expect(owner).toBeVisible();
    await owner.screenshot({ path: shot("04-new-role") });

    // A decision without its reasoning.
    await page.goto(`${server.url}/#04-risks.biz42.md`);
    const incumbent = page.getByRole("region", { name: "modified: Incumbent Response" });
    await expect(incumbent.getByTestId("value-added")).toHaveText("high");
    await incumbent.screenshot({ path: shot("05-missing-reasoning") });

    // The plan as a history: each decision a commit, with its message.
    await page.goto(`${server.url}/#history`);
    await page
      .getByTestId("history-pearl")
      .filter({ hasText: "objective: win three operator pilots" })
      .getByTestId("pearl-select")
      .click();
    await page.getByTestId("commit-message-toggle").click();
    await expect(page.getByTestId("commit-message")).toBeVisible();
    await page.screenshot({ path: shot("06-history") });
  } finally {
    await server.stop();
    rmSync(dirname(root), { recursive: true, force: true });
  }
});
