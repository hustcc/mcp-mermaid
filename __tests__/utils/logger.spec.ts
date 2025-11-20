import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  Logger,
  cleanup,
  error,
  info,
  serverStartup,
  success,
  warn,
} from "../../src/utils/logger";

describe("Logger", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe("info", () => {
    it("should log info message with prefix and emoji", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      info("Test message");
      expect(consoleSpy).toHaveBeenCalledWith("[MCP-Mermaid] ℹ️  Test message");
      consoleSpy.mockRestore();
    });

    it("should log info message with additional arguments", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      info("Test message", { key: "value" }, 123);
      expect(consoleSpy).toHaveBeenCalledWith(
        "[MCP-Mermaid] ℹ️  Test message",
        { key: "value" },
        123,
      );
      consoleSpy.mockRestore();
    });
  });

  describe("warn", () => {
    it("should log warning message with prefix and emoji", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      warn("Warning message");
      expect(consoleSpy).toHaveBeenCalledWith(
        "[MCP-Mermaid] ⚠️  Warning message",
      );
      consoleSpy.mockRestore();
    });

    it("should log warning message with additional arguments", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      warn("Warning message", "extra", "data");
      expect(consoleSpy).toHaveBeenCalledWith(
        "[MCP-Mermaid] ⚠️  Warning message",
        "extra",
        "data",
      );
      consoleSpy.mockRestore();
    });
  });

  describe("error", () => {
    it("should log error message with prefix and emoji", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      error("Error message");
      expect(consoleSpy).toHaveBeenCalledWith(
        "[MCP-Mermaid] ❌ Error message",
        "",
      );
      consoleSpy.mockRestore();
    });

    it("should log error message with error object", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const errorObj = new Error("Test error");
      error("Error message", errorObj);
      expect(consoleSpy).toHaveBeenCalledWith(
        "[MCP-Mermaid] ❌ Error message",
        errorObj,
      );
      consoleSpy.mockRestore();
    });

    it("should log error message with string error", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      error("Error message", "string error");
      expect(consoleSpy).toHaveBeenCalledWith(
        "[MCP-Mermaid] ❌ Error message",
        "string error",
      );
      consoleSpy.mockRestore();
    });
  });

  describe("success", () => {
    it("should log success message with prefix and emoji", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      success("Success message");
      expect(consoleSpy).toHaveBeenCalledWith(
        "[MCP-Mermaid] ✅ Success message",
      );
      consoleSpy.mockRestore();
    });

    it("should log success message with additional arguments", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      success("Success message", { result: "ok" });
      expect(consoleSpy).toHaveBeenCalledWith(
        "[MCP-Mermaid] ✅ Success message",
        { result: "ok" },
      );
      consoleSpy.mockRestore();
    });
  });

  describe("serverStartup", () => {
    it("should log server startup information with URLs", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      serverStartup("SSE Server", 3033, "/sse");

      expect(consoleSpy).toHaveBeenCalledTimes(4);
      expect(consoleSpy).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("SSE Server running on"),
      );
      expect(consoleSpy).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("http://localhost:3033/sse"),
      );
      expect(consoleSpy).toHaveBeenNthCalledWith(2, "\nTest endpoints:");
      expect(consoleSpy).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining("http://localhost:3033/health"),
      );
      expect(consoleSpy).toHaveBeenNthCalledWith(
        4,
        expect.stringContaining("http://localhost:3033/ping"),
      );
      consoleSpy.mockRestore();
    });

    it("should handle different ports and endpoints", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      serverStartup("HTTP Server", 8080, "/api");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("http://localhost:8080/api"),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("http://localhost:8080/health"),
      );
      consoleSpy.mockRestore();
    });
  });

  describe("cleanup", () => {
    it("should log cleanup message with prefix and emoji", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      cleanup("Cleaning up resources");
      expect(consoleSpy).toHaveBeenCalledWith(
        "[MCP-Mermaid] 🧹 Cleaning up resources",
      );
      consoleSpy.mockRestore();
    });
  });

  describe("Logger object", () => {
    it("should export all functions in Logger object", () => {
      expect(Logger.info).toBe(info);
      expect(Logger.warn).toBe(warn);
      expect(Logger.error).toBe(error);
      expect(Logger.success).toBe(success);
      expect(Logger.serverStartup).toBe(serverStartup);
      expect(Logger.cleanup).toBe(cleanup);
    });

    it("should have all expected methods", () => {
      expect(Logger).toHaveProperty("info");
      expect(Logger).toHaveProperty("warn");
      expect(Logger).toHaveProperty("error");
      expect(Logger).toHaveProperty("success");
      expect(Logger).toHaveProperty("serverStartup");
      expect(Logger).toHaveProperty("cleanup");
    });
  });
});
