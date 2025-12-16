import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/",
        "build/",
        "coverage/",
        "**/*.spec.ts",
        "**/*.test.ts",
        "**/__tests__/**",
        "**/dist/**",
        "vitest.config.ts",
        "tsconfig.json",
        "biome.json",
        "smithery.config.js",
        "src/index.ts", // Entry point file, minimal logic
      ],
      include: ["src/**/*.ts"],
      all: true,
      lines: 90,
      functions: 90,
      branches: 90,
      statements: 90,
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
        autoUpdate: false,
      },
    },
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
    // Run suites serially to avoid multiple Playwright renditions starting in parallel on CI.
    sequence: {
      concurrent: false,
    },
  },
});
