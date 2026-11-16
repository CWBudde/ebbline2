import { expect, test, type Page } from "@playwright/test";
import { game, startFirstMission } from "./helpers.ts";

/** Every chart is an SVG image with drawn lines; none of them may hold a broken coordinate. */
async function expectCharts(page: Page, lines: boolean): Promise<void> {
  const stats = page.getByTestId("stats");
  await expect(stats).toBeVisible();
  const charts = stats.locator("svg[role=img]");
  expect(await charts.count()).toBeGreaterThanOrEqual(9);
  for (const label of await charts.evaluateAll((svgs) => svgs.map((s) => s.getAttribute("aria-label") ?? ""))) {
    expect(label).not.toBe("");
  }
  const paths = await stats.locator("svg[role=img] path").evaluateAll((ps) => ps.map((p) => p.getAttribute("d") ?? ""));
  for (const d of paths) expect(d).not.toContain("NaN");
  if (lines) {
    const drawn = await stats.locator("svg[role=img] path.line").evaluateAll((ps) => ps.map((p) => p.getAttribute("d") ?? ""));
    expect(drawn.length).toBeGreaterThanOrEqual(9);
    for (const d of drawn) expect(d).toMatch(/^M[\d.]+ [\d.]+[LHV]/);
  }
}

test("the statistics open from the menu, show the graphs, and the game goes on after", async ({ page }) => {
  await startFirstMission(page);
  await page.getByRole("button", { name: "4×" }).click();
  await expect.poll(() => game<number>(page, "g.history.tick.length")).toBeGreaterThan(6);
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("button", { name: "Statistics" }).click();
  await expectCharts(page, true);
  await expect(page.getByTestId("stats").getByRole("heading", { name: "Silt", exact: true })).toBeVisible();
  // The game is held while the screen is open.
  const held = await game<number>(page, "g.tick");
  await page.waitForTimeout(300);
  expect(await game<number>(page, "g.tick")).toBe(held);
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByTestId("stats")).toHaveCount(0);
  await page.getByRole("button", { name: "Resume" }).click();
  await expect.poll(() => game<number>(page, "g.tick")).toBeGreaterThan(held + 10);
});

test("the energy readout opens the statistics at the energy breakdown", async ({ page }) => {
  await startFirstMission(page);
  await expect.poll(() => game<number>(page, "g.history.tick.length")).toBeGreaterThan(2);
  await page.getByTestId("energy").click();
  const energy = page.getByTestId("stats-energy");
  await expect(energy).toBeInViewport();
  await expect(energy.getByRole("img", { name: "Income by source" })).toBeVisible();
  // The lander's own output is the one source from the start: 1 a second, all of the income.
  const lander = energy.getByRole("row", { name: /Lander/ });
  await expect(lander).toBeVisible();
  await expect(lander).toContainText("/s");
  await expect(energy.getByRole("row", { name: /Pylon/ })).toBeVisible();
  await expect(energy.getByRole("row", { name: /Construction/ })).toBeVisible();
  await expectCharts(page, false);
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByTestId("stats")).toHaveCount(0);
  const tick = await game<number>(page, "g.tick");
  await expect.poll(() => game<number>(page, "g.tick")).toBeGreaterThan(tick + 10);
});

test("opened at once, the statistics draw nothing broken", async ({ page }) => {
  await startFirstMission(page);
  await page.getByRole("button", { name: "Pause" }).click();
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("button", { name: "Statistics" }).click();
  await expectCharts(page, false);
});

test("the key T opens and closes the statistics, and Escape closes them", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard only");
  await startFirstMission(page);
  await page.keyboard.press("t");
  await expect(page.getByTestId("stats")).toBeVisible();
  await page.keyboard.press("t");
  await expect(page.getByTestId("stats")).toHaveCount(0);
  await page.keyboard.press("t");
  await expect(page.getByTestId("stats")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("stats")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Resume" })).toHaveCount(0);
});

test("the result screen offers the statistics and returns to the result", async ({ page }) => {
  await startFirstMission(page);
  await expect.poll(() => game<number>(page, "g.history.tick.length")).toBeGreaterThan(2);
  // Losing the lander ends the mission on the next tick.
  await game(page, "(g.structures = g.structures.filter((s) => s.kind !== 'lander'), 0)");
  await expect(page.getByTestId("end")).toBeVisible();
  await page.getByTestId("end").getByRole("button", { name: "Statistics" }).click();
  await expectCharts(page, true);
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByTestId("end")).toBeVisible();
});
