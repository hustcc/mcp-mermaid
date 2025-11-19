import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  runHTTPStreamableServer,
  runSSEServer,
  runStdioServer,
} from "../../src/server";

// Mock the services
vi.mock("../../src/services", () => ({
  startStdioMcpServer: vi.fn().mockResolvedValue(undefined),
  startSSEMcpServer: vi.fn().mockResolvedValue(undefined),
  startHTTPStreamableServer: vi.fn().mockResolvedValue(undefined),
}));

describe("Server Runners", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("runStdioServer", () => {
    it("should create and start STDIO server", async () => {
      const { startStdioMcpServer } = await import("../../src/services");

      // We can't truly await this as it doesn't return, so we'll just call it
      const promise = runStdioServer();

      // Give it a moment to execute
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(startStdioMcpServer).toHaveBeenCalled();
    });
  });

  describe("runSSEServer", () => {
    it("should create and start SSE server with default parameters", async () => {
      const { startSSEMcpServer } = await import("../../src/services");

      const promise = runSSEServer();

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(startSSEMcpServer).toHaveBeenCalled();
    });

    it("should create and start SSE server with custom parameters", async () => {
      const { startSSEMcpServer } = await import("../../src/services");

      const promise = runSSEServer("/custom-sse", 8080, "0.0.0.0");

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(startSSEMcpServer).toHaveBeenCalledWith(
        expect.any(Server),
        "/custom-sse",
        8080,
        "0.0.0.0",
      );
    });
  });

  describe("runHTTPStreamableServer", () => {
    it("should create and start HTTP Streamable server with default parameters", async () => {
      const { startHTTPStreamableServer } = await import("../../src/services");

      const promise = runHTTPStreamableServer();

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(startHTTPStreamableServer).toHaveBeenCalled();
    });

    it("should create and start HTTP Streamable server with custom parameters", async () => {
      const { startHTTPStreamableServer } = await import("../../src/services");

      const promise = runHTTPStreamableServer("/custom-mcp", 9090, "127.0.0.1");

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(startHTTPStreamableServer).toHaveBeenCalled();
    });
  });
});
