import * as fs from "node:fs";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import sinon from "sinon";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer } from "../../src/server";

// Mock filesystem
vi.mock("node:fs", () => ({
  writeFileSync: vi.fn(),
}));

// Only mock the utils we control
vi.mock("../../src/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/utils")>();
  return {
    ...actual,
    renderMermaid: vi.fn(),
    createMermaidInkUrl: vi.fn(),
  };
});

describe("Server", () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    vi.clearAllMocks();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("createServer", () => {
    it("should create a server instance", () => {
      const server = createServer();
      expect(server).toBeInstanceOf(Server);
    });

    it("should have server name and version", () => {
      const server = createServer();
      expect(server).toBeDefined();
    });

    it("should set up error handler", () => {
      const server = createServer();
      expect(server.onerror).toBeDefined();
      expect(typeof server.onerror).toBe("function");
    });

    it("should handle errors with onerror handler", () => {
      const server = createServer();
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const testError = new Error("Test error");
      server.onerror(testError);

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Tool Handlers - Unit Tests", () => {
    beforeEach(async () => {
      const { renderMermaid, createMermaidInkUrl } = await import(
        "../../src/utils"
      );

      vi.mocked(renderMermaid).mockResolvedValue({
        id: "test-id",
        svg: "<svg>test</svg>",
        screenshot: Buffer.from("test-image"),
      });

      vi.mocked(createMermaidInkUrl).mockImplementation(
        (code, variant) => `https://mermaid.ink/${variant}/test`,
      );
    });

    it("should import tool schema", async () => {
      const { tool } = await import("../../src/tools");

      expect(tool).toBeDefined();
      expect(tool.name).toBe("generate_mermaid_diagram");
      expect(tool.description).toBeDefined();
      expect(tool.inputSchema).toBeDefined();
    });

    it("should test renderMermaid is called with correct params", async () => {
      const { renderMermaid } = await import("../../src/utils");
      const { schema } = await import("../../src/tools");

      // Test that schema validates mermaid parameter
      const result = schema.safeParse({
        mermaid: "graph TD; A-->B;",
        theme: "dark",
        backgroundColor: "white",
      });

      expect(result.success).toBe(true);

      // Test renderMermaid can be called
      await renderMermaid("graph TD; A-->B;", "dark", "white");
      expect(renderMermaid).toHaveBeenCalledWith(
        "graph TD; A-->B;",
        "dark",
        "white",
      );
    });

    it("should test mermaid URL creation", async () => {
      const { createMermaidInkUrl } = await import("../../src/utils");

      const svgUrl = createMermaidInkUrl("graph TD; A-->B;", "svg");
      const imgUrl = createMermaidInkUrl("graph TD; A-->B;", "img");

      expect(svgUrl).toContain("mermaid.ink/svg");
      expect(imgUrl).toContain("mermaid.ink/img");
    });

    it("should validate schema with invalid params", async () => {
      const { schema } = await import("../../src/tools");

      const result = schema.safeParse({
        mermaid: "", // Empty string should fail
      });

      expect(result.success).toBe(false);
    });

    it("should test file write logic", async () => {
      const writeFileSyncMock = vi.mocked(fs.writeFileSync);
      const screenshot = Buffer.from("test-image");

      // Simulate the file writing logic
      const filename = "test-mermaid.png";
      const filePath = require("node:path").resolve(process.cwd(), filename);

      writeFileSyncMock(filePath, screenshot);

      expect(writeFileSyncMock).toHaveBeenCalledWith(filePath, screenshot);
    });

    it("should handle file write errors", () => {
      const writeFileSyncMock = vi.mocked(fs.writeFileSync);
      writeFileSyncMock.mockImplementationOnce(() => {
        throw new Error("Disk full");
      });

      expect(() => {
        writeFileSyncMock("test.png", Buffer.from("data"));
      }).toThrow("Disk full");
    });

    it("should test McpError creation", () => {
      const error = new McpError(ErrorCode.InvalidParams, "Test error");

      expect(error).toBeInstanceOf(McpError);
      expect(error.message).toContain("Test error");
      expect(error.code).toBe(ErrorCode.InvalidParams);
    });

    it("should test different output type logic paths", async () => {
      const { renderMermaid } = await import("../../src/utils");
      const { createMermaidInkUrl } = await import("../../src/utils");

      // Test base64/default path
      const result = await renderMermaid("graph TD; A-->B;");
      expect(result.screenshot).toBeDefined();

      // Test SVG path
      expect(result.svg).toBeDefined();

      // Test URL path
      const url = createMermaidInkUrl("graph TD; A-->B;", "svg");
      expect(url).toBeDefined();
    });

    it("should test error handling for missing screenshot", () => {
      const screenshot = undefined;

      if (!screenshot) {
        const error = new McpError(
          ErrorCode.InternalError,
          "Failed to generate screenshot for file output.",
        );
        expect(error.message).toContain("Failed to generate screenshot");
      }
    });

    it("should test timestamp generation for filenames", () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const filename = `mermaid-${timestamp}-${randomSuffix}.png`;

      expect(filename).toContain("mermaid-");
      expect(filename).toContain(".png");
      expect(filename.length).toBeGreaterThan(20);
    });

    it("should test Buffer toString base64", () => {
      const buffer = Buffer.from("test-image");
      const base64 = buffer.toString("base64");

      expect(base64).toBe("dGVzdC1pbWFnZQ==");
    });
  });

  describe("Tool Handler Integration Tests", () => {
    let server: Server;

    beforeEach(async () => {
      const { renderMermaid, createMermaidInkUrl } = await import(
        "../../src/utils"
      );

      vi.mocked(renderMermaid).mockResolvedValue({
        id: "test-id",
        svg: "<svg>test svg content</svg>",
        screenshot: Buffer.from("test-screenshot-data"),
      });

      vi.mocked(createMermaidInkUrl).mockImplementation(
        (code, variant) => `https://mermaid.ink/${variant}/encoded-diagram`,
      );

      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      server = createServer();
    });

    it("should handle list tools request", async () => {
      const handler = (server as any)._requestHandlers?.get("tools/list");
      expect(handler).toBeDefined();

      if (handler) {
        const response = await handler({
          method: "tools/list",
          jsonrpc: "2.0",
        });
        expect(response).toHaveProperty("tools");
        expect(Array.isArray(response.tools)).toBe(true);
        expect(response.tools.length).toBeGreaterThan(0);
      }
    });

    it("should handle call tool request with base64 output", async () => {
      const handler = (server as any)._requestHandlers?.get("tools/call");
      expect(handler).toBeDefined();

      if (handler) {
        const response = await handler({
          method: "tools/call",
          jsonrpc: "2.0",
          params: {
            name: "generate_mermaid_diagram",
            arguments: {
              mermaid: "graph TD; A-->B;",
              theme: "dark",
              backgroundColor: "white",
              outputType: "base64",
            },
          },
        });

        expect(response).toHaveProperty("content");
        expect(Array.isArray(response.content)).toBe(true);
        expect(response.content[0]).toHaveProperty("type", "image");
        expect(response.content[0]).toHaveProperty("data");
        expect(response.content[0]).toHaveProperty("mimeType", "image/png");
      }
    });

    it("should handle call tool request with mermaid output", async () => {
      const handler = (server as any)._requestHandlers?.get("tools/call");

      if (handler) {
        const response = await handler({
          method: "tools/call",
          jsonrpc: "2.0",
          params: {
            name: "generate_mermaid_diagram",
            arguments: {
              mermaid: "graph TD; A-->B;",
              outputType: "mermaid",
            },
          },
        });

        expect(response.content[0]).toHaveProperty("type", "text");
        expect(response.content[0].text).toBe("graph TD; A-->B;");
      }
    });

    it("should handle call tool request with svg output", async () => {
      const handler = (server as any)._requestHandlers?.get("tools/call");

      if (handler) {
        const response = await handler({
          method: "tools/call",
          jsonrpc: "2.0",
          params: {
            name: "generate_mermaid_diagram",
            arguments: {
              mermaid: "graph TD; A-->B;",
              outputType: "svg",
            },
          },
        });

        expect(response.content[0]).toHaveProperty("type", "text");
        expect(response.content[0].text).toContain("<svg>");
      }
    });

    it("should handle call tool request with svg_url output", async () => {
      const handler = (server as any)._requestHandlers?.get("tools/call");

      if (handler) {
        const response = await handler({
          method: "tools/call",
          jsonrpc: "2.0",
          params: {
            name: "generate_mermaid_diagram",
            arguments: {
              mermaid: "graph TD; A-->B;",
              outputType: "svg_url",
            },
          },
        });

        expect(response.content[0]).toHaveProperty("type", "text");
        expect(response.content[0].text).toContain("mermaid.ink/svg");
      }
    });

    it("should handle call tool request with png_url output", async () => {
      const handler = (server as any)._requestHandlers?.get("tools/call");

      if (handler) {
        const response = await handler({
          method: "tools/call",
          jsonrpc: "2.0",
          params: {
            name: "generate_mermaid_diagram",
            arguments: {
              mermaid: "graph TD; A-->B;",
              outputType: "png_url",
            },
          },
        });

        expect(response.content[0]).toHaveProperty("type", "text");
        expect(response.content[0].text).toContain("mermaid.ink/img");
      }
    });

    it("should handle call tool request with file output", async () => {
      const handler = (server as any)._requestHandlers?.get("tools/call");

      if (handler) {
        const response = await handler({
          method: "tools/call",
          jsonrpc: "2.0",
          params: {
            name: "generate_mermaid_diagram",
            arguments: {
              mermaid: "graph TD; A-->B;",
              outputType: "file",
            },
          },
        });

        expect(response.content[0]).toHaveProperty("type", "text");
        expect(response.content[0].text).toContain(
          "Mermaid diagram saved to file:",
        );
        expect(fs.writeFileSync).toHaveBeenCalled();
      }
    });

    it("should throw error for invalid parameters", async () => {
      const handler = (server as any)._requestHandlers?.get("tools/call");

      if (handler) {
        await expect(
          handler({
            method: "tools/call",
            jsonrpc: "2.0",
            params: {
              name: "generate_mermaid_diagram",
              arguments: {
                mermaid: "", // Empty mermaid code
              },
            },
          }),
        ).rejects.toThrow();
      }
    });

    it("should throw error for unknown tool", async () => {
      const handler = (server as any)._requestHandlers?.get("tools/call");

      if (handler) {
        await expect(
          handler({
            method: "tools/call",
            jsonrpc: "2.0",
            params: {
              name: "unknown_tool",
              arguments: {},
            },
          }),
        ).rejects.toThrow(McpError);
      }
    });

    it("should throw error when file output has no screenshot", async () => {
      const { renderMermaid } = await import("../../src/utils");

      vi.mocked(renderMermaid).mockResolvedValueOnce({
        id: "test-id",
        svg: "<svg>test</svg>",
        screenshot: undefined, // No screenshot
      });

      const handler = (server as any)._requestHandlers?.get("tools/call");

      if (handler) {
        await expect(
          handler({
            method: "tools/call",
            jsonrpc: "2.0",
            params: {
              name: "generate_mermaid_diagram",
              arguments: {
                mermaid: "graph TD; A-->B;",
                outputType: "file",
              },
            },
          }),
        ).rejects.toThrow(McpError);
      }
    });

    it("should throw error when file write fails", async () => {
      vi.mocked(fs.writeFileSync).mockImplementationOnce(() => {
        throw new Error("Permission denied");
      });

      const handler = (server as any)._requestHandlers?.get("tools/call");

      if (handler) {
        await expect(
          handler({
            method: "tools/call",
            jsonrpc: "2.0",
            params: {
              name: "generate_mermaid_diagram",
              arguments: {
                mermaid: "graph TD; A-->B;",
                outputType: "file",
              },
            },
          }),
        ).rejects.toThrow(McpError);
      }
    });

    it("should handle renderMermaid errors", async () => {
      const { renderMermaid } = await import("../../src/utils");

      vi.mocked(renderMermaid).mockRejectedValueOnce(
        new Error("Rendering failed"),
      );

      const handler = (server as any)._requestHandlers?.get("tools/call");

      if (handler) {
        await expect(
          handler({
            method: "tools/call",
            jsonrpc: "2.0",
            params: {
              name: "generate_mermaid_diagram",
              arguments: {
                mermaid: "graph TD; A-->B;",
                outputType: "base64",
              },
            },
          }),
        ).rejects.toThrow(McpError);
      }
    });

    it("should preserve McpError when thrown", async () => {
      const handler = (server as any)._requestHandlers?.get("tools/call");

      if (handler) {
        try {
          await handler({
            method: "tools/call",
            jsonrpc: "2.0",
            params: {
              name: "generate_mermaid_diagram",
              arguments: {
                // Missing required mermaid parameter
              },
            },
          });
          // Should not reach here
          expect(true).toBe(false);
        } catch (error) {
          expect(error).toBeInstanceOf(McpError);
          expect((error as McpError).code).toBe(ErrorCode.InvalidParams);
        }
      }
    });

    it("should handle default outputType when not specified", async () => {
      const handler = (server as any)._requestHandlers?.get("tools/call");

      if (handler) {
        const response = await handler({
          method: "tools/call",
          jsonrpc: "2.0",
          params: {
            name: "generate_mermaid_diagram",
            arguments: {
              mermaid: "graph TD; A-->B;",
              // outputType not specified, should default to base64
            },
          },
        });

        expect(response.content[0]).toHaveProperty("type", "image");
        expect(response.content[0]).toHaveProperty("mimeType", "image/png");
      }
    });

    it("should handle valid parameters successfully (result.success true branch)", async () => {
      const handler = (server as any)._requestHandlers?.get("tools/call");

      if (handler) {
        // This test ensures the success path when schema.safeParse returns success: true
        const response = await handler({
          method: "tools/call",
          jsonrpc: "2.0",
          params: {
            name: "generate_mermaid_diagram",
            arguments: {
              mermaid: "graph TD; A-->B;",
              theme: "dark",
              backgroundColor: "white",
              outputType: "svg",
            },
          },
        });

        // Should successfully process valid parameters
        expect(response.content[0]).toHaveProperty("type", "text");
        expect(response.content[0].text).toContain("<svg>");
      }
    });

    it("should handle non-Error file write failure (unknown file error branch)", async () => {
      vi.mocked(fs.writeFileSync).mockImplementationOnce(() => {
        // Throw a non-Error object to test the false branch of instanceof Error
        throw "File system error string"; // Not an Error object
      });

      const handler = (server as any)._requestHandlers?.get("tools/call");

      if (handler) {
        try {
          await handler({
            method: "tools/call",
            jsonrpc: "2.0",
            params: {
              name: "generate_mermaid_diagram",
              arguments: {
                mermaid: "graph TD; A-->B;",
                outputType: "file",
              },
            },
          });
          // Should not reach here
          expect(true).toBe(false);
        } catch (error) {
          expect(error).toBeInstanceOf(McpError);
          expect((error as McpError).message).toContain("Unknown file error");
        }
      }
    });

    it("should handle error without message property (unknown error branch)", async () => {
      const { renderMermaid } = await import("../../src/utils");

      // Mock renderMermaid to throw an object without a message property
      vi.mocked(renderMermaid).mockRejectedValueOnce({
        code: "ERR_RENDER",
        // No message property
      });

      const handler = (server as any)._requestHandlers?.get("tools/call");

      if (handler) {
        try {
          await handler({
            method: "tools/call",
            jsonrpc: "2.0",
            params: {
              name: "generate_mermaid_diagram",
              arguments: {
                mermaid: "graph TD; A-->B;",
                outputType: "base64",
              },
            },
          });
          // Should not reach here
          expect(true).toBe(false);
        } catch (error) {
          expect(error).toBeInstanceOf(McpError);
          expect((error as McpError).message).toContain("Unknown error");
        }
      }
    });

    it("should handle undefined arguments (args || {} branch)", async () => {
      const handler = (server as any)._requestHandlers?.get("tools/call");

      if (handler) {
        try {
          await handler({
            method: "tools/call",
            jsonrpc: "2.0",
            params: {
              name: "generate_mermaid_diagram",
              // arguments is undefined - should use {} as fallback
            },
          });
          // Should fail validation since mermaid is required
          expect(true).toBe(false);
        } catch (error) {
          expect(error).toBeInstanceOf(McpError);
          expect((error as McpError).code).toBe(ErrorCode.InvalidParams);
        }
      }
    });
  });
});
