import { describe, expect, it } from "vitest";

describe("Services Index", () => {
  it("should export all service functions", async () => {
    const services = await import("../../src/services/index");

    expect(services.startSSEMcpServer).toBeDefined();
    expect(services.startStdioMcpServer).toBeDefined();
    expect(services.startHTTPStreamableServer).toBeDefined();

    expect(typeof services.startSSEMcpServer).toBe("function");
    expect(typeof services.startStdioMcpServer).toBe("function");
    expect(typeof services.startHTTPStreamableServer).toBe("function");
  });

  it("should export functions that are callable", async () => {
    const services = await import("../../src/services/index");

    expect(() => services.startSSEMcpServer.name).not.toThrow();
    expect(() => services.startStdioMcpServer.name).not.toThrow();
    expect(() => services.startHTTPStreamableServer.name).not.toThrow();
  });
});
