import { defineConfig, devices } from "@playwright/test";

const port = 4391;

export default defineConfig({
  testDir: ".",
  outputDir: "../../build/e2e",
  workers: 1,
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${port}/ebbline2/`,
    trace: "retain-on-failure",
    // The game follows the browser language; specs that read English text rely on this.
    locale: "en-US",
  },
  webServer: {
    command: "node e2e/server.ts",
    cwd: "..",
    url: `http://localhost:${port}/ebbline2/`,
    reuseExistingServer: process.env["CI"] === undefined,
  },
  projects: [
    { name: "chromium", use: devices["Desktop Chrome"] },
    { name: "phone", use: devices["Pixel 7"] },
  ],
});
