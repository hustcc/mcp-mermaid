import { describe, expect, it } from "vitest";

describe("Utils Index", () => {
  it("should export all utility functions", async () => {
    const utils = await import("../../src/utils/index");

    expect(utils.zodToJsonSchema).toBeDefined();
    expect(utils.renderMermaid).toBeDefined();
    expect(utils.Logger).toBeDefined();
    expect(utils.createMermaidInkUrl).toBeDefined();

    expect(typeof utils.zodToJsonSchema).toBe("function");
    expect(typeof utils.renderMermaid).toBe("function");
    expect(typeof utils.Logger).toBe("object");
    expect(typeof utils.createMermaidInkUrl).toBe("function");
  });

  it("should have Logger object with all methods", async () => {
    const utils = await import("../../src/utils/index");

    expect(utils.Logger.info).toBeDefined();
    expect(utils.Logger.warn).toBeDefined();
    expect(utils.Logger.error).toBeDefined();
    expect(utils.Logger.success).toBeDefined();
    expect(utils.Logger.serverStartup).toBeDefined();
    expect(utils.Logger.cleanup).toBeDefined();

    expect(typeof utils.Logger.info).toBe("function");
    expect(typeof utils.Logger.warn).toBe("function");
    expect(typeof utils.Logger.error).toBe("function");
    expect(typeof utils.Logger.success).toBe("function");
    expect(typeof utils.Logger.serverStartup).toBe("function");
    expect(typeof utils.Logger.cleanup).toBe("function");
  });
});
