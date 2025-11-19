import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { startStdioMcpServer } from "../../src/services/stdio";

// Mock the SDK
vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: vi.fn(),
}));

describe("STDIO Service", () => {
  let mockServer: Server;
  let mockTransport: StdioServerTransport;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock server
    mockServer = {
      connect: vi.fn().mockResolvedValue(undefined),
    } as unknown as Server;

    // Mock transport
    mockTransport = {} as StdioServerTransport;

    // Mock StdioServerTransport constructor
    vi.mocked(StdioServerTransport).mockImplementation(() => mockTransport);

    // Mock console.log
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("startStdioMcpServer", () => {
    it("should create StdioServerTransport", async () => {
      await startStdioMcpServer(mockServer);

      expect(StdioServerTransport).toHaveBeenCalledTimes(1);
    });

    it("should connect server to transport", async () => {
      await startStdioMcpServer(mockServer);

      expect(mockServer.connect).toHaveBeenCalledWith(mockTransport);
    });

    it("should log startup message", async () => {
      const consoleSpy = vi.spyOn(console, "log");

      await startStdioMcpServer(mockServer);

      expect(consoleSpy).toHaveBeenCalledWith("STDIO MCP Server started");
    });

    it("should handle connection errors", async () => {
      const error = new Error("Connection failed");
      vi.mocked(mockServer.connect).mockRejectedValue(error);

      await expect(startStdioMcpServer(mockServer)).rejects.toThrow(
        "Connection failed",
      );
    });
  });
});
