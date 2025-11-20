import { parseArgs } from "node:util";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the server functions
vi.mock("../src/server", () => ({
  runStdioServer: vi.fn(() => Promise.resolve()),
  runSSEServer: vi.fn(() => Promise.resolve()),
  runHTTPStreamableServer: vi.fn(() => Promise.resolve()),
}));

// Mock parseArgs
vi.mock("node:util", () => ({
  parseArgs: vi.fn(),
}));

describe("CLI Entry Point (src/index.ts)", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;
  let originalArgv: string[];

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    processExitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    originalArgv = process.argv;
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
    process.argv = originalArgv;
    vi.resetModules();
  });

  describe("Help flag", () => {
    it("should display help message when --help flag is provided", async () => {
      vi.mocked(parseArgs).mockReturnValue({
        values: {
          help: true,
          transport: "stdio",
          port: "3033",
          host: "",
          endpoint: "",
        },
        positionals: [],
      });

      await import("../src/index");

      expect(consoleLogSpy).toHaveBeenCalled();
      const helpMessage = consoleLogSpy.mock.calls[0][0];
      expect(helpMessage).toContain("MCP Mermaid CLI");
      expect(helpMessage).toContain("--transport");
      expect(helpMessage).toContain("--port");
      expect(helpMessage).toContain("--host");
      expect(helpMessage).toContain("--endpoint");
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });
  });

  describe("STDIO transport (default)", () => {
    it("should run STDIO server by default", async () => {
      vi.mocked(parseArgs).mockReturnValue({
        values: { transport: "stdio", port: "3033", host: "", endpoint: "" },
        positionals: [],
      });

      const { runStdioServer } = await import("../src/server");

      await import("../src/index");

      // Give the import time to execute
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(runStdioServer).toHaveBeenCalled();
    });

    it("should run STDIO server when transport is 'stdio'", async () => {
      vi.mocked(parseArgs).mockReturnValue({
        values: { transport: "stdio", port: "3033", host: "", endpoint: "" },
        positionals: [],
      });

      const { runStdioServer } = await import("../src/server");

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(runStdioServer).toHaveBeenCalled();
    });
  });

  describe("SSE transport", () => {
    it("should run SSE server with default endpoint", async () => {
      vi.mocked(parseArgs).mockReturnValue({
        values: { transport: "sse", port: "3033", host: "", endpoint: "" },
        positionals: [],
      });

      const { runSSEServer } = await import("../src/server");

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(runSSEServer).toHaveBeenCalledWith("/sse", 3033, undefined);
    });

    it("should run SSE server with custom endpoint", async () => {
      vi.mocked(parseArgs).mockReturnValue({
        values: {
          transport: "sse",
          port: "8080",
          host: "",
          endpoint: "/custom-sse",
        },
        positionals: [],
      });

      const { runSSEServer } = await import("../src/server");

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(runSSEServer).toHaveBeenCalledWith("/custom-sse", 8080, undefined);
    });

    it("should run SSE server with custom host", async () => {
      vi.mocked(parseArgs).mockReturnValue({
        values: {
          transport: "sse",
          port: "3033",
          host: "0.0.0.0",
          endpoint: "",
        },
        positionals: [],
      });

      const { runSSEServer } = await import("../src/server");

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(runSSEServer).toHaveBeenCalledWith("/sse", 3033, "0.0.0.0");
    });

    it("should run SSE server with all custom parameters", async () => {
      vi.mocked(parseArgs).mockReturnValue({
        values: {
          transport: "sse",
          port: "9000",
          host: "127.0.0.1",
          endpoint: "/api/sse",
        },
        positionals: [],
      });

      const { runSSEServer } = await import("../src/server");

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(runSSEServer).toHaveBeenCalledWith("/api/sse", 9000, "127.0.0.1");
    });
  });

  describe("Streamable transport", () => {
    it("should run Streamable server with default endpoint", async () => {
      vi.mocked(parseArgs).mockReturnValue({
        values: {
          transport: "streamable",
          port: "3033",
          host: "",
          endpoint: "",
        },
        positionals: [],
      });

      const { runHTTPStreamableServer } = await import("../src/server");

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(runHTTPStreamableServer).toHaveBeenCalledWith(
        "/mcp",
        3033,
        undefined,
      );
    });

    it("should run Streamable server with custom endpoint", async () => {
      vi.mocked(parseArgs).mockReturnValue({
        values: {
          transport: "streamable",
          port: "4000",
          host: "",
          endpoint: "/custom-mcp",
        },
        positionals: [],
      });

      const { runHTTPStreamableServer } = await import("../src/server");

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(runHTTPStreamableServer).toHaveBeenCalledWith(
        "/custom-mcp",
        4000,
        undefined,
      );
    });

    it("should run Streamable server with custom host", async () => {
      vi.mocked(parseArgs).mockReturnValue({
        values: {
          transport: "streamable",
          port: "3033",
          host: "0.0.0.0",
          endpoint: "",
        },
        positionals: [],
      });

      const { runHTTPStreamableServer } = await import("../src/server");

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(runHTTPStreamableServer).toHaveBeenCalledWith(
        "/mcp",
        3033,
        "0.0.0.0",
      );
    });

    it("should run Streamable server with all custom parameters", async () => {
      vi.mocked(parseArgs).mockReturnValue({
        values: {
          transport: "streamable",
          port: "5000",
          host: "localhost",
          endpoint: "/stream",
        },
        positionals: [],
      });

      const { runHTTPStreamableServer } = await import("../src/server");

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(runHTTPStreamableServer).toHaveBeenCalledWith(
        "/stream",
        5000,
        "localhost",
      );
    });
  });

  describe("Transport case insensitivity", () => {
    it("should handle uppercase SSE transport", async () => {
      vi.mocked(parseArgs).mockReturnValue({
        values: { transport: "SSE", port: "3033", host: "", endpoint: "" },
        positionals: [],
      });

      const { runSSEServer } = await import("../src/server");

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(runSSEServer).toHaveBeenCalled();
    });

    it("should handle mixed case streamable transport", async () => {
      vi.mocked(parseArgs).mockReturnValue({
        values: {
          transport: "Streamable",
          port: "3033",
          host: "",
          endpoint: "",
        },
        positionals: [],
      });

      const { runHTTPStreamableServer } = await import("../src/server");

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(runHTTPStreamableServer).toHaveBeenCalled();
    });
  });

  describe("Error handling", () => {
    it("should handle STDIO server errors", async () => {
      const error = new Error("STDIO failed");
      vi.mocked(parseArgs).mockReturnValue({
        values: { transport: "stdio", port: "3033", host: "", endpoint: "" },
        positionals: [],
      });

      const { runStdioServer } = await import("../src/server");
      vi.mocked(runStdioServer).mockRejectedValueOnce(error);

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });

    it("should handle SSE server errors", async () => {
      const error = new Error("SSE failed");
      vi.mocked(parseArgs).mockReturnValue({
        values: { transport: "sse", port: "3033", host: "", endpoint: "" },
        positionals: [],
      });

      const { runSSEServer } = await import("../src/server");
      vi.mocked(runSSEServer).mockRejectedValueOnce(error);

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });

    it("should handle Streamable server errors", async () => {
      const error = new Error("Streamable failed");
      vi.mocked(parseArgs).mockReturnValue({
        values: {
          transport: "streamable",
          port: "3033",
          host: "",
          endpoint: "",
        },
        positionals: [],
      });

      const { runHTTPStreamableServer } = await import("../src/server");
      vi.mocked(runHTTPStreamableServer).mockRejectedValueOnce(error);

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });
  });

  describe("Port parsing", () => {
    it("should parse port as integer for SSE", async () => {
      vi.mocked(parseArgs).mockReturnValue({
        values: { transport: "sse", port: "8080", host: "", endpoint: "" },
        positionals: [],
      });

      const { runSSEServer } = await import("../src/server");

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(runSSEServer).toHaveBeenCalledWith("/sse", 8080, undefined);
    });

    it("should parse port as integer for streamable", async () => {
      vi.mocked(parseArgs).mockReturnValue({
        values: {
          transport: "streamable",
          port: "9999",
          host: "",
          endpoint: "",
        },
        positionals: [],
      });

      const { runHTTPStreamableServer } = await import("../src/server");

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(runHTTPStreamableServer).toHaveBeenCalledWith(
        "/mcp",
        9999,
        undefined,
      );
    });
  });

  describe("Host parameter handling", () => {
    it("should convert empty string host to undefined for SSE", async () => {
      vi.mocked(parseArgs).mockReturnValue({
        values: { transport: "sse", port: "3033", host: "", endpoint: "" },
        positionals: [],
      });

      const { runSSEServer } = await import("../src/server");

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(runSSEServer).toHaveBeenCalledWith("/sse", 3033, undefined);
    });

    it("should convert empty string host to undefined for streamable", async () => {
      vi.mocked(parseArgs).mockReturnValue({
        values: {
          transport: "streamable",
          port: "3033",
          host: "",
          endpoint: "",
        },
        positionals: [],
      });

      const { runHTTPStreamableServer } = await import("../src/server");

      await import("../src/index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(runHTTPStreamableServer).toHaveBeenCalledWith(
        "/mcp",
        3033,
        undefined,
      );
    });
  });
});
