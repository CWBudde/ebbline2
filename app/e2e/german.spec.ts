import { expect, test } from "@playwright/test";
import { deploy } from "./helpers.ts";

test.use({ locale: "de-DE" });

test("a German browser gets the game in German", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("body[data-ready=true]")).toBeAttached();
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.getByRole("heading", { name: "Ebbline 2" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Spielanleitung" })).toBeVisible();
  await page.getByRole("button", { name: "Kampagne" }).click();
  await expect(page.getByRole("button", { name: /Gewinn die Mission davor/ }).first()).toBeDisabled();
  await page.getByRole("button", { name: /Landung/ }).click();
  const briefing = page.getByTestId("briefing");
  await expect(briefing).toContainText("Mission 1 von 10");
  await expect(briefing.getByTestId("briefing-goal")).toHaveText("Ziel Bau eine Kappe auf den Schlot.");
  await expect(briefing.locator("[data-subject=lance]")).toContainText("Lanze");
  await page.getByRole("button", { name: "Einsatz starten" }).click();
  await expect(briefing).toHaveCount(0);
  await expect(page.getByTestId("goal")).toHaveText("Schlote verschlossen 0 / 1");
  await expect(page.locator(".slot[data-kind=pylon] .name")).toHaveText("Pylon");
  await expect(page.locator(".slot[data-kind=tap]")).toHaveCount(0);
  await expect(page.locator(".info h3")).toHaveText("Landung");
  await expect(page.locator(".hints li").first()).toContainText("Pylonen erweitern das Netz");
  await expect(page.locator(".rate")).toHaveText(/^\+\d+,\d −\d+,\d$/);

  // Taps arrive in mission 2. Seal the vent directly to get there.
  await page.evaluate(() => {
    for (const vent of window.ebbline?.runtime.value?.game.vents ?? []) vent.capped = true;
  });
  await page.getByRole("button", { name: /Weiter: Zwei Fronten/ }).click();
  await expect(briefing).toContainText("Mission 2 von 10");
  await expect(briefing.getByTestId("briefing-goal")).toHaveText("Ziel Bau auf jeden der 2 Schlote eine Kappe.");
  await expect(briefing.locator("[data-subject=tap]")).toContainText("Zapfer");
  await expect(briefing.locator("[data-subject=tap]")).toContainText("0,6 Energie pro Sekunde");
  await deploy(page);
  await expect(page.getByTestId("goal")).toHaveText("Schlote verschlossen 0 / 2");
  await expect(page.locator(".slot[data-kind=tap] .name")).toHaveText("Zapfer");
  await expect(page.locator(".info h3")).toHaveText("Zwei Fronten");
  await expect(page.locator(".hints li").first()).toContainText("Setz Zapfer auf die leuchtenden Adern");
});

test("the language setting changes the text at once and survives a reload", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Einstellungen" }).click();
  await expect(page.getByLabel("Sprache")).toHaveValue("auto");
  await page.getByLabel("Sprache").selectOption("en");
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByLabel("Language")).toHaveValue("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.reload();
  await expect(page.getByRole("button", { name: "How to play" })).toBeVisible();
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByLabel("Language").selectOption({ label: "Deutsch" });
  await expect(page.getByRole("button", { name: "Zurück" })).toBeVisible();
  await page.getByLabel("Sprache").selectOption("auto");
  await expect(page.getByRole("heading", { name: "Einstellungen" })).toBeVisible();
});

test("a saved game is named in the language of the title screen", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Kampagne" }).click();
  await page.getByRole("button", { name: /Landung/ }).click();
  await deploy(page);
  await page.getByRole("button", { name: "Menü" }).click();
  await page.getByRole("button", { name: "Speichern", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Spiel gespeichert.");
  await page.getByRole("button", { name: "Speichern und beenden" }).click();
  await expect(page.getByRole("button", { name: /Fortsetzen/ })).toContainText("Landung");
  await page.evaluate(() => {
    const c = window.ebbline;
    c?.setSettings({ ...c.settings.value, language: "en" });
  });
  await expect(page.getByRole("button", { name: /Continue/ })).toContainText("Landfall");
});
