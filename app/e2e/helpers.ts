import { expect, type Page } from "@playwright/test";

/** Dismisses the briefing a campaign mission opens on, so the mission runs. */
export async function deploy(page: Page): Promise<void> {
  await page.getByTestId("deploy").click();
  await expect(page.getByTestId("briefing")).toHaveCount(0);
}
