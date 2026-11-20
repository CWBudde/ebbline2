import { expect, test, type Page } from "@playwright/test";
import { deploy } from "./helpers.ts";

async function tick(page: Page): Promise<number> {
  return page.evaluate(() => window.ebbline?.runtime.value?.game.tick ?? -1);
}

async function openFirstMission(page: Page): Promise<void> {
  await page.goto("./");
  await expect(page.locator("body[data-ready=true]")).toBeAttached();
  await page.getByRole("button", { name: "Campaign" }).click();
  await page.getByRole("button", { name: /Landfall/ }).click();
}

/** Wins the first mission by sealing its vents directly, then takes "next mission" on the win screen. */
async function openSecondMission(page: Page): Promise<void> {
  await openFirstMission(page);
  await deploy(page);
  await page.evaluate(() => {
    for (const vent of window.ebbline?.runtime.value?.game.vents ?? []) vent.capped = true;
  });
  await page.getByRole("button", { name: /Next: Two Fronts/ }).click();
}

test("the first mission opens on a briefing that explains the whole starting roster", async ({ page }) => {
  await openFirstMission(page);
  const briefing = page.getByTestId("briefing");
  await expect(briefing).toContainText("Mission 1 of 12");
  await expect(briefing.getByRole("heading", { name: "Landfall" })).toBeVisible();
  await expect(briefing.getByTestId("briefing-goal")).toHaveText("Objective Build a Cap on the vent.");
  await expect(briefing.locator("[data-subject]")).toHaveCount(3);
  for (const name of ["Pylon", "Lance", "Cap"]) {
    await expect(briefing.getByRole("heading", { name, exact: true })).toBeAttached();
  }
  await expect(page.getByTestId("deploy")).toBeFocused();
  await expect(page.getByTestId("deploy")).toBeInViewport({ ratio: 1 });
  // Every card has a picture that loaded.
  await expect
    .poll(() =>
      briefing.locator(".briefing-picture img").evaluateAll((images) =>
        images.map((image) => (image as HTMLImageElement).naturalWidth > 0),
      ),
    )
    .toEqual([true, true, true]);
});

test("the briefing of mission 2 names Tap and Cell and holds the game until Deploy", async ({ page }) => {
  await openSecondMission(page);
  const briefing = page.getByTestId("briefing");
  await expect(briefing).toContainText("Mission 2 of 12");
  await expect(briefing.getByRole("heading", { name: "Two Fronts" })).toBeVisible();
  await expect(briefing.getByTestId("briefing-goal")).toContainText("each of the 2 vents");
  await expect(briefing.locator("[data-subject]")).toHaveCount(2);
  await expect(briefing.locator("[data-subject=tap]")).toContainText("Tap");
  await expect(briefing.locator("[data-subject=tap]")).toContainText("8 energy");
  await expect(briefing.locator("[data-subject=cell]")).toContainText("Cell");
  await expect(briefing.locator("[data-subject=cell]")).toContainText("10 energy");
  await expect(briefing.getByRole("heading", { name: "Pylon" })).toHaveCount(0);

  expect(await tick(page)).toBe(0);
  await page.waitForTimeout(600);
  expect(await tick(page)).toBe(0);
  await expect(page.getByTestId("time")).toHaveText("0:00");

  await deploy(page);
  await expect.poll(() => tick(page)).toBeGreaterThan(15);
});

test("a restart shows no briefing, and the pause menu brings it back", async ({ page }) => {
  await openSecondMission(page);
  await deploy(page);
  await expect.poll(() => tick(page)).toBeGreaterThan(15);

  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("button", { name: "Restart mission" }).click();
  await expect(page.getByTestId("briefing")).toHaveCount(0);
  expect(await page.evaluate(() => window.ebbline?.overlay.value)).toBe("none");
  await expect.poll(() => tick(page)).toBeGreaterThan(5);

  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("button", { name: "Briefing" }).click();
  await expect(page.getByTestId("briefing")).toContainText("Tap");
  const held = await tick(page);
  await page.waitForTimeout(400);
  expect(await tick(page)).toBe(held);
  await page.getByRole("button", { name: "Back to the mission" }).click();
  await expect(page.getByTestId("briefing")).toHaveCount(0);
  await expect.poll(() => tick(page)).toBeGreaterThan(held);
});

test("Enter and Space deploy, and Esc leaves the game running, not paused", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard only");
  for (const key of ["Enter", "Space", "Escape"]) {
    await openFirstMission(page);
    await expect(page.getByTestId("deploy")).toBeFocused();
    expect(await tick(page)).toBe(0);
    await page.keyboard.press(key);
    await expect(page.getByTestId("briefing"), key).toHaveCount(0);
    expect(await page.evaluate(() => window.ebbline?.overlay.value), key).toBe("none");
    expect(await page.evaluate(() => window.ebbline?.runtime.value?.paused.value), key).toBe(false);
    await expect.poll(() => tick(page), key).toBeGreaterThan(5);
  }
});

test("a skirmish and a resumed game have no briefing", async ({ page }) => {
  await page.goto("./?seed=4242&size=small&difficulty=easy");
  await expect(page.getByTestId("goal")).toHaveText("Vents capped 0 / 2");
  await expect(page.getByTestId("briefing")).toHaveCount(0);
  await expect.poll(() => tick(page)).toBeGreaterThan(5);
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("button", { name: "Restart mission" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Briefing" })).toHaveCount(0);

  await openFirstMission(page);
  await deploy(page);
  await expect.poll(() => tick(page)).toBeGreaterThan(5);
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("button", { name: "Save and quit" }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByTestId("goal")).toHaveText("Vents capped 0 / 1");
  await expect(page.getByTestId("briefing")).toHaveCount(0);
  const resumed = await tick(page);
  await expect.poll(() => tick(page)).toBeGreaterThan(resumed);
});
