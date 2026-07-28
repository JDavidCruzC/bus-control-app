import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/test/e2e",

  timeout: 60000,

  fullyParallel: false,
  workers: 1,

  use: {
    baseURL: "http://localhost:8080",
    headless: true,
    navigationTimeout: 60000,
    actionTimeout: 15000,
  },

  webServer: {
    command: "npm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: true,
    timeout: 120000,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});