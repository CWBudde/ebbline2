import { expect, test, type Page } from "@playwright/test";
import { game, startFirstMission } from "./helpers.ts";

/** Screen position of the centre of the tile `dx` to the right of the lander. */
async function besideLander(page: Page, dx: number): Promise<{ x: number; y: number }> {
  return page.evaluate((offset) => {
    const c = window.ebbline;
    const g = c?.runtime.value?.game;
    const lander = g?.structures.find((s) => s.kind === "lander");
    if (!c || !lander) throw new Error("no game");
    // The app's own tile-to-screen mapping, so the test follows the map's geometry.
    return c.tileOnScreen(lander.x + offset, lander.y);
  }, dx);
}

test("the title offers the campaign, and only the first mission is open", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Ebbline 2" })).toBeVisible();
  await page.getByRole("button", { name: "Campaign" }).click();
  await expect(page.getByRole("button", { name: /Landfall/ })).toBeEnabled();
  await expect(page.getByRole("button", { name: /Win the mission before/ }).first()).toBeDisabled();
});

test("a pylon placed by the lander gets built from the bank", async ({ page }) => {
  await startFirstMission(page);
  const spot = await besideLander(page, 4);
  await page.locator(".slot[data-kind=pylon]").click();
  await page.mouse.click(spot.x, spot.y);
  expect(await game<number>(page, "g.structures.length")).toBe(2);
  await expect.poll(() => game<boolean>(page, "g.structures[1].built")).toBe(true);
  expect(await game<number>(page, "g.stats.spent")).toBe(3);
  // With no tool in hand, a click selects what stands there.
  await page.mouse.click(spot.x, spot.y, { button: "right" });
  await page.mouse.click(spot.x, spot.y);
  await expect(page.locator(".info h3")).toHaveText("Pylon");
});

test("a description can be closed, and a phone shows it only once", async ({ page, isMobile }) => {
  await startFirstMission(page);
  const pylon = page.locator(".slot[data-kind=pylon]");
  await pylon.click();
  await expect(page.locator(".info .dim")).toBeVisible();
  await page.getByRole("button", { name: "Hide" }).click();
  await expect(page.locator(".info.closed h3")).toHaveText("Pylon");
  await page.getByRole("button", { name: "Details" }).click();
  await expect(page.locator(".info .dim")).toBeVisible();
  // Putting the tool away and taking it up again: the phone has shown it once and keeps it folded.
  await pylon.click();
  await pylon.click();
  await expect(page.locator(".info.closed")).toHaveCount(isMobile ? 1 : 0);
  // The panel of a selected structure closes by dropping the selection.
  await pylon.click();
  const spot = await besideLander(page, 0);
  await page.mouse.click(spot.x, spot.y);
  await expect(page.locator(".info h3")).toHaveText("Lander");
  await page.getByRole("button", { name: "Hide" }).click();
  expect(await game<number>(page, "rt.selected.value")).toBe(0);
});

test("pausing holds the clock and the speed buttons change the pace", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard only");
  await startFirstMission(page);
  await page.keyboard.press("Space");
  const tick = await game<number>(page, "g.tick");
  await page.waitForTimeout(500);
  expect(await game<number>(page, "g.tick")).toBe(tick);
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "4×" }).click();
  expect(await game<number>(page, "rt.speed.value")).toBe(4);
  await expect.poll(() => game<number>(page, "g.tick")).toBeGreaterThan(tick + 60);
});

test("a saved game continues from the title after a reload", async ({ page }) => {
  await startFirstMission(page);
  await expect.poll(() => game<number>(page, "g.tick")).toBeGreaterThan(20);
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Game saved.");
  const saved = await page.evaluate(() => window.ebbline?.store.saved()?.seconds ?? -1);
  await page.reload();
  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByTestId("goal")).toHaveText("Vents capped 0 / 1");
  expect(await game<number>(page, "Math.floor(g.tick / 30)")).toBeGreaterThanOrEqual(saved);
  expect(await game<string>(page, "g.level.id")).toBe("c1");
});

test("winning shows the result, records it and opens the next mission", async ({ page }) => {
  await startFirstMission(page);
  // Playing a mission through takes minutes; the test seals the vents directly instead.
  await page.evaluate(() => {
    for (const vent of window.ebbline?.runtime.value?.game.vents ?? []) vent.capped = true;
  });
  await expect(page.getByTestId("end")).toContainText("Vents sealed");
  await expect(page.getByTestId("end")).toContainText("new best");
  await page.getByRole("button", { name: "Main menu" }).click();
  await page.getByRole("button", { name: "Campaign" }).click();
  await expect(page.getByRole("button", { name: /Landfall/ })).toContainText("Best");
  await expect(page.getByRole("button", { name: /Two Fronts/ })).toBeEnabled();
});

test("a skirmish link opens the same map again", async ({ page }) => {
  await page.goto("./?seed=4242&size=small&difficulty=easy");
  await expect(page.getByTestId("goal")).toHaveText("Vents capped 0 / 2");
  const first = await game<string>(page, "Array.from(g.height).join('')");
  await page.goto("./");
  await page.getByRole("button", { name: "Skirmish", exact: true }).click();
  await page.getByLabel("Seed").fill("4242");
  await page.getByLabel("Map size").selectOption("small");
  await page.getByLabel("Difficulty").selectOption("easy");
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByTestId("goal")).toHaveText("Vents capped 0 / 2");
  expect(await game<string>(page, "Array.from(g.height).join('')")).toBe(first);
  expect(page.url()).toContain("seed=4242");
});
