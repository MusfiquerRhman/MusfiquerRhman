import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 10000 },
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    browserName: "chromium",
    launchOptions: { channel: "msedge" },
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
  },
});
