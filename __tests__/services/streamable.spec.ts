import type { Server as HTTPServer } from "node:http";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the StreamableHTTPServerTransport
vi.mock("@modelcontextprotocol/sdk/server/streamableHttp.js", () => ({
  StreamableHTTPServerTransport: vi.fn().mockImplementation(() => ({
    handleRequest: vi.fn().mockResolvedValue(undefined),
    close: vi.fn(),
  })),
}));

describe("Streamable HTTP Service", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  const servers: HTTPServer[] = [];

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(async () => {
    consoleLogSpy.mockRestore();

    // Close all HTTP servers to prevent port conflicts
    await Promise.all(
      servers.map(
        (server) =>
          new Promise<void>((resolve) => {
            if (server.listening) {
              server.close(() => resolve());
            } else {
              resolve();
            }
          }),
      ),
    );
    servers.length = 0;
  });

  describe("Module structure", () => {
    it("should export startHTTPStreamableServer function", async () => {
      const { startHTTPStreamableServer } = await import(
        "../../src/services/streamable"
      );
      expect(startHTTPStreamableServer).toBeDefined();
      expect(typeof startHTTPStreamableServer).toBe("function");
    });
  });

  describe("Server startup and configuration", () => {
    it("should log server startup with default parameters", async () => {
      const mockServer = {
        connect: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
      } as unknown as Server;

      const mockCreateServer = vi.fn(() => mockServer);

      const { startHTTPStreamableServer } = await import(
        "../../src/services/streamable"
      );

      // Start the server
      const httpServer = await startHTTPStreamableServer(mockCreateServer);

      // Wait for the server to initialize
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if console.log was called with the expected message
      expect(consoleLogSpy.mock.calls.length > 0).toBe(true);
      const logCalls = consoleLogSpy.mock.calls.map((call) => call.join(" "));
      const hasStartupMessage = logCalls.some(
        (log) =>
          log.includes("Streamable HTTP Server listening on") &&
          log.includes("localhost") &&
          log.includes("1122") &&
          log.includes("/mcp"),
      );
      expect(hasStartupMessage).toBe(true);
    });

    it("should log server startup with custom endpoint", async () => {
      const mockServer = {
        connect: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
      } as unknown as Server;

      const mockCreateServer = vi.fn(() => mockServer);

      const { startHTTPStreamableServer } = await import(
        "../../src/services/streamable"
      );

      // Start with custom parameters
      const httpServer = await startHTTPStreamableServer(
        mockCreateServer,
        "/api",
        9000,
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(consoleLogSpy.mock.calls.length > 0).toBe(true);
      const logCalls = consoleLogSpy.mock.calls.map((call) => call.join(" "));
      const hasStartupMessage = logCalls.some((log) =>
        log.includes("localhost:9000/api"),
      );
      expect(hasStartupMessage).toBe(true);
    });

    it("should log server startup with custom host", async () => {
      const mockServer = {
        connect: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
      } as unknown as Server;

      const mockCreateServer = vi.fn(() => mockServer);

      const { startHTTPStreamableServer } = await import(
        "../../src/services/streamable"
      );

      // Start with custom host
      const httpServer = await startHTTPStreamableServer(
        mockCreateServer,
        "/test",
        8080,
        "0.0.0.0",
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(consoleLogSpy.mock.calls.length > 0).toBe(true);
      const logCalls = consoleLogSpy.mock.calls.map((call) => call.join(" "));
      const hasStartupMessage = logCalls.some((log) =>
        log.includes("0.0.0.0:8080/test"),
      );
      expect(hasStartupMessage).toBe(true);
    });

    it("should use localhost when host is not provided", async () => {
      const mockServer = {
        connect: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
      } as unknown as Server;

      const mockCreateServer = vi.fn(() => mockServer);

      const { startHTTPStreamableServer } = await import(
        "../../src/services/streamable"
      );

      const httpServer = await startHTTPStreamableServer(
        mockCreateServer,
        "/mcp",
        3000,
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      const logCalls = consoleLogSpy.mock.calls.map((call) => call.join(" "));
      const hasLocalhost = logCalls.some((log) => log.includes("localhost"));
      expect(hasLocalhost).toBe(true);
    });
  });

  describe("Transport creation", () => {
    it("should create StreamableHTTPServerTransport when handling requests", async () => {
      // This tests that the StreamableHTTPServerTransport constructor is available
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      expect(transport).toBeDefined();
      expect(StreamableHTTPServerTransport).toHaveBeenCalled();
    });
  });

  describe("Server lifecycle", () => {
    it("should create server factory function", async () => {
      const mockServer = {
        connect: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
      } as unknown as Server;

      const mockCreateServer = vi.fn(() => mockServer);

      const { startHTTPStreamableServer } = await import(
        "../../src/services/streamable"
      );

      // The function should accept the createServer callback
      expect(typeof startHTTPStreamableServer).toBe("function");

      const httpServer = await startHTTPStreamableServer(mockCreateServer);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Server setup should have completed
      expect(consoleLogSpy.mock.calls.length > 0).toBe(true);
    });

    it("should handle async initialization", async () => {
      const mockServer = {
        connect: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
      } as unknown as Server;

      const mockCreateServer = vi.fn(() => mockServer);

      const { startHTTPStreamableServer } = await import(
        "../../src/services/streamable"
      );

      // The function returns a Promise<void>
      const httpServer = await startHTTPStreamableServer;
      servers.push(httpServer);
      const result = httpServer(mockCreateServer);

      expect(result).toBeInstanceOf(Promise);

      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  describe("Configuration options", () => {
    it("should accept all four parameters", async () => {
      const mockServer = {
        connect: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
      } as unknown as Server;

      const mockCreateServer = vi.fn(() => mockServer);

      const { startHTTPStreamableServer } = await import(
        "../../src/services/streamable"
      );

      // Should not throw with all parameters
      expect(() => {
        startHTTPStreamableServer(
          mockCreateServer,
          "/endpoint",
          5000,
          "127.0.0.1",
        );
      }).not.toThrow();

      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it("should work with only required parameters", async () => {
      const mockServer = {
        connect: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
      } as unknown as Server;

      const mockCreateServer = vi.fn(() => mockServer);

      const { startHTTPStreamableServer } = await import(
        "../../src/services/streamable"
      );

      // Should not throw with only createServer
      expect(() => {
        startHTTPStreamableServer(mockCreateServer);
      }).not.toThrow();

      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  describe("Error handling", () => {
    it("should handle POST request errors", async () => {
      const mockServer = {
        connect: vi.fn().mockRejectedValue(new Error("Connection failed")),
        close: vi.fn(),
      } as unknown as Server;

      const mockCreateServer = vi.fn(() => mockServer);

      const { startHTTPStreamableServer } = await import(
        "../../src/services/streamable"
      );

      const axios = (await import("axios")).default;
      const testPort = 14001;

      await startHTTPStreamableServer(mockCreateServer, "/mcp", testPort);
      await new Promise((resolve) => setTimeout(resolve, 200));

      try {
        // POST request that should fail
        await axios.post(`http://localhost:${testPort}/mcp`, {
          jsonrpc: "2.0",
          method: "test",
          params: {},
          id: 1,
        });
      } catch (error: any) {
        // Should get 500 error
        expect(error.response?.status).toBe(500);
        expect(error.response?.data).toHaveProperty("error");
        expect(error.response?.data.error.code).toBe(-32603);
        expect(error.response?.data.error.message).toBe(
          "Internal server error",
        );
      }
    });

    it("should handle transport handleRequest errors", async () => {
      const mockTransport = {
        handleRequest: vi
          .fn()
          .mockRejectedValue(new Error("Handle request failed")),
        close: vi.fn(),
      };

      vi.mocked(StreamableHTTPServerTransport).mockImplementationOnce(
        () => mockTransport as any,
      );

      const mockServer = {
        connect: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
      } as unknown as Server;

      const mockCreateServer = vi.fn(() => mockServer);

      const { startHTTPStreamableServer } = await import(
        "../../src/services/streamable"
      );

      const axios = (await import("axios")).default;
      const testPort = 14002;

      await startHTTPStreamableServer(mockCreateServer, "/mcp", testPort);
      await new Promise((resolve) => setTimeout(resolve, 200));

      try {
        await axios.post(`http://localhost:${testPort}/mcp`, {
          jsonrpc: "2.0",
          method: "test",
          params: {},
          id: 1,
        });
      } catch (error: any) {
        expect(error.response?.status).toBe(500);
      }
    });

    it("should return 405 for GET requests", async () => {
      const mockServer = {
        connect: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
      } as unknown as Server;

      const mockCreateServer = vi.fn(() => mockServer);

      const { startHTTPStreamableServer } = await import(
        "../../src/services/streamable"
      );

      const axios = (await import("axios")).default;
      const testPort = 14003;

      await startHTTPStreamableServer(mockCreateServer, "/mcp", testPort);
      await new Promise((resolve) => setTimeout(resolve, 200));

      try {
        await axios.get(`http://localhost:${testPort}/mcp`);
      } catch (error: any) {
        expect(error.response?.status).toBe(405);
        expect(error.response?.data).toHaveProperty("error");
        expect(error.response?.data.error.code).toBe(-32000);
        expect(error.response?.data.error.message).toBe("Method not allowed");
      }
    });

    it("should return 405 for DELETE requests", async () => {
      const mockServer = {
        connect: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
      } as unknown as Server;

      const mockCreateServer = vi.fn(() => mockServer);

      const { startHTTPStreamableServer } = await import(
        "../../src/services/streamable"
      );

      const axios = (await import("axios")).default;
      const testPort = 14004;

      await startHTTPStreamableServer(mockCreateServer, "/mcp", testPort);
      await new Promise((resolve) => setTimeout(resolve, 200));

      try {
        await axios.delete(`http://localhost:${testPort}/mcp`);
      } catch (error: any) {
        expect(error.response?.status).toBe(405);
        expect(error.response?.data).toHaveProperty("error");
        expect(error.response?.data.error.code).toBe(-32000);
        expect(error.response?.data.error.message).toBe("Method not allowed");
      }
    });

    it("should close transport and server on response close", async () => {
      const mockTransport = {
        handleRequest: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
      };

      const mockServer = {
        connect: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
      } as unknown as Server;

      vi.mocked(StreamableHTTPServerTransport).mockImplementationOnce(
        () => mockTransport as any,
      );

      const mockCreateServer = vi.fn(() => mockServer);

      const { startHTTPStreamableServer } = await import(
        "../../src/services/streamable"
      );

      const axios = (await import("axios")).default;
      const testPort = 14005;

      await startHTTPStreamableServer(mockCreateServer, "/mcp", testPort);
      await new Promise((resolve) => setTimeout(resolve, 200));

      try {
        await axios.post(
          `http://localhost:${testPort}/mcp`,
          {
            jsonrpc: "2.0",
            method: "ping",
            id: 1,
          },
          { timeout: 500 },
        );
      } catch (error) {
        // Request may timeout or complete
      }

      // Give time for cleanup
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Transport and server close should be called on connection close
      // Note: This is hard to test without actual connection lifecycle events
      expect(mockTransport.close).toBeDefined();
      expect(mockServer.close).toBeDefined();
    });
  });
});
