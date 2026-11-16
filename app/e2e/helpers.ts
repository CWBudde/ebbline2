import { expect, type Page } from "@playwright/test";

/** Dismisses the briefing a campaign mission opens on, so the mission runs. */
export async function deploy(page: Page): Promise<void> {
  await page.getByTestId("deploy").click();
  await expect(page.getByTestId("briefing")).toHaveCount(0);
}

/** Reads from the running game through the handle the app puts on `window`. */
export async function game<T>(page: Page, read: string): Promise<T> {
  return page.evaluate<T>(
    `(() => { const rt = window.ebbline.runtime.value; const g = rt.game; return ${read}; })()`,
  );
}

export async function startFirstMission(page: Page): Promise<void> {
  await page.goto("./");
  await expect(page.locator("body[data-ready=true]")).toBeAttached();
  await page.getByRole("button", { name: "Campaign" }).click();
  await page.getByRole("button", { name: /Landfall/ }).click();
  await deploy(page);
  await expect(page.getByTestId("goal")).toHaveText("Vents capped 0 / 1");
}
