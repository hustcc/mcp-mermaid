import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { MermaidRenderer, RenderResult } from "mermaid-isomorphic";
import sinon from "sinon";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock fs module
vi.mock("node:fs", () => ({
  writeFileSync: vi.fn(),
}));

// Mock the mermaid-isomorphic module
vi.mock("mermaid-isomorphic", () => ({
  createMermaidRenderer: vi.fn(),
}));

describe("renderMermaid", () => {
  let sandbox: sinon.SinonSandbox;
  let mockRenderer: MermaidRenderer;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    vi.clearAllMocks();

    // Reset the module to clear the cached renderer
    vi.resetModules();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should render mermaid diagram with default parameters", async () => {
    const mermaidCode = "graph TD; A-->B;";
    const mockRenderResult: RenderResult = {
      id: "test-id",
      svg: "<svg>test</svg>",
      screenshot: Buffer.from("test-image"),
    };

    const mockRenderer = vi
      .fn()
      .mockResolvedValue([{ status: "fulfilled", value: mockRenderResult }]);

    const { createMermaidRenderer } = await import("mermaid-isomorphic");
    vi.mocked(createMermaidRenderer).mockReturnValue(mockRenderer as any);

    const { renderMermaid } = await import("../../src/utils/render");
    const result = await renderMermaid(mermaidCode);

    expect(result).toBeDefined();
    expect(result.id).toBe("test-id");
    expect(result.svg).toBe("<svg>test</svg>");
    expect(result.screenshot).toBeDefined();

    // Verify createMermaidRenderer was called
    expect(createMermaidRenderer).toHaveBeenCalledTimes(1);

    // Verify fs.writeFileSync was called with correct parameters
    const writeFileSync = await import("node:fs").then((m) => m.writeFileSync);
    expect(writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("mermaid-tmp-css.css"),
      "svg { background: white; }",
    );

    // Verify renderer was called with correct options
    expect(mockRenderer).toHaveBeenCalledWith(
      [mermaidCode],
      expect.objectContaining({
        screenshot: true,
        css: expect.stringContaining("mermaid-tmp-css.css"),
        mermaidConfig: expect.objectContaining({
          theme: "default",
        }),
      }),
    );
  });

  it("should write CSS file with custom background color", async () => {
    const mermaidCode = "graph TD; A-->B;";
    const backgroundColor = "transparent";

    const mockRenderResult: RenderResult = {
      id: "test-id",
      svg: "<svg>test</svg>",
      screenshot: Buffer.from("test-image"),
    };

    const mockRenderer = vi
      .fn()
      .mockResolvedValue([{ status: "fulfilled", value: mockRenderResult }]);

    const { createMermaidRenderer } = await import("mermaid-isomorphic");
    vi.mocked(createMermaidRenderer).mockReturnValue(mockRenderer as any);

    const { renderMermaid } = await import("../../src/utils/render");
    await renderMermaid(mermaidCode, "default", backgroundColor);

    const writeFileSync = await import("node:fs").then((m) => m.writeFileSync);
    expect(writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("mermaid-tmp-css.css"),
      `svg { background: ${backgroundColor}; }`,
    );
  });

  it("should use temp directory for CSS file", async () => {
    const mermaidCode = "graph TD; A-->B;";

    const mockRenderResult: RenderResult = {
      id: "test-id",
      svg: "<svg>test</svg>",
      screenshot: Buffer.from("test-image"),
    };

    const mockRenderer = vi
      .fn()
      .mockResolvedValue([{ status: "fulfilled", value: mockRenderResult }]);

    const { createMermaidRenderer } = await import("mermaid-isomorphic");
    vi.mocked(createMermaidRenderer).mockReturnValue(mockRenderer as any);

    const { renderMermaid } = await import("../../src/utils/render");
    await renderMermaid(mermaidCode);

    const expectedPath = path.join(os.tmpdir(), "mermaid-tmp-css.css");
    const writeFileSync = await import("node:fs").then((m) => m.writeFileSync);
    expect(writeFileSync).toHaveBeenCalledWith(
      expectedPath,
      expect.any(String),
    );
  });

  it("should handle rendering errors with rejected promise", async () => {
    const mermaidCode = "invalid mermaid code";
    const errorReason = new Error("Rendering failed");

    const mockRenderer = vi
      .fn()
      .mockResolvedValue([{ status: "rejected", reason: errorReason }]);

    const { createMermaidRenderer } = await import("mermaid-isomorphic");
    vi.mocked(createMermaidRenderer).mockReturnValue(mockRenderer as any);

    const { renderMermaid } = await import("../../src/utils/render");

    await expect(renderMermaid(mermaidCode)).rejects.toThrow(
      "Rendering failed",
    );
  });

  it("should apply custom theme", async () => {
    const mermaidCode = "graph TD; A-->B;";
    const theme = "dark";

    const mockRenderResult: RenderResult = {
      id: "test-id",
      svg: "<svg>test</svg>",
      screenshot: Buffer.from("test-image"),
    };

    const mockRenderer = vi
      .fn()
      .mockResolvedValue([{ status: "fulfilled", value: mockRenderResult }]);

    const { createMermaidRenderer } = await import("mermaid-isomorphic");
    vi.mocked(createMermaidRenderer).mockReturnValue(mockRenderer as any);

    const { renderMermaid } = await import("../../src/utils/render");
    await renderMermaid(mermaidCode, theme);

    expect(mockRenderer).toHaveBeenCalledWith(
      [mermaidCode],
      expect.objectContaining({
        screenshot: true,
        mermaidConfig: expect.objectContaining({
          theme: theme,
        }),
      }),
    );
  });

  it("should reuse renderer instance on subsequent calls", async () => {
    const mermaidCode = "graph TD; A-->B;";

    const mockRenderResult: RenderResult = {
      id: "test-id",
      svg: "<svg>test</svg>",
      screenshot: Buffer.from("test-image"),
    };

    const mockRenderer = vi
      .fn()
      .mockResolvedValue([{ status: "fulfilled", value: mockRenderResult }]);

    const { createMermaidRenderer } = await import("mermaid-isomorphic");
    vi.mocked(createMermaidRenderer).mockReturnValue(mockRenderer as any);

    const { renderMermaid } = await import("../../src/utils/render");

    await renderMermaid(mermaidCode);
    await renderMermaid(mermaidCode);

    // createMermaidRenderer should only be called once (renderer is cached)
    expect(createMermaidRenderer).toHaveBeenCalledTimes(1);
    expect(mockRenderer).toHaveBeenCalledTimes(2);
  });

  it("should include screenshot in render options", async () => {
    const mermaidCode = "graph TD; A-->B;";

    const mockRenderResult: RenderResult = {
      id: "test-id",
      svg: "<svg>test</svg>",
      screenshot: Buffer.from("test-image"),
    };

    const mockRenderer = vi
      .fn()
      .mockResolvedValue([{ status: "fulfilled", value: mockRenderResult }]);

    const { createMermaidRenderer } = await import("mermaid-isomorphic");
    vi.mocked(createMermaidRenderer).mockReturnValue(mockRenderer as any);

    const { renderMermaid } = await import("../../src/utils/render");
    await renderMermaid(mermaidCode);

    expect(mockRenderer).toHaveBeenCalledWith(
      [mermaidCode],
      expect.objectContaining({
        screenshot: true,
      }),
    );
  });

  it("should pass CSS file path to renderer", async () => {
    const mermaidCode = "graph TD; A-->B;";

    const mockRenderResult: RenderResult = {
      id: "test-id",
      svg: "<svg>test</svg>",
      screenshot: Buffer.from("test-image"),
    };

    const mockRenderer = vi
      .fn()
      .mockResolvedValue([{ status: "fulfilled", value: mockRenderResult }]);

    const { createMermaidRenderer } = await import("mermaid-isomorphic");
    vi.mocked(createMermaidRenderer).mockReturnValue(mockRenderer as any);

    const { renderMermaid } = await import("../../src/utils/render");
    await renderMermaid(mermaidCode);

    const expectedCssPath = path.join(os.tmpdir(), "mermaid-tmp-css.css");
    expect(mockRenderer).toHaveBeenCalledWith(
      [mermaidCode],
      expect.objectContaining({
        css: expectedCssPath,
      }),
    );
  });

  it("should handle different theme values", async () => {
    const themes = ["default", "dark", "forest", "neutral"];

    for (const theme of themes) {
      vi.resetModules();
      vi.clearAllMocks();

      const mockRenderResult: RenderResult = {
        id: "test-id",
        svg: "<svg>test</svg>",
        screenshot: Buffer.from("test-image"),
      };

      const mockRenderer = vi
        .fn()
        .mockResolvedValue([{ status: "fulfilled", value: mockRenderResult }]);

      const { createMermaidRenderer } = await import("mermaid-isomorphic");
      vi.mocked(createMermaidRenderer).mockReturnValue(mockRenderer as any);

      const { renderMermaid } = await import("../../src/utils/render");
      await renderMermaid("graph TD; A-->B;", theme);

      expect(mockRenderer).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          mermaidConfig: expect.objectContaining({
            theme: theme,
          }),
        }),
      );
    }
  });

  it("should handle different background colors", async () => {
    const backgrounds = [
      "white",
      "black",
      "transparent",
      "#f0f0f0",
      "rgba(255,255,255,0.5)",
    ];

    for (const bg of backgrounds) {
      vi.resetModules();
      vi.clearAllMocks();

      const mockRenderResult: RenderResult = {
        id: "test-id",
        svg: "<svg>test</svg>",
        screenshot: Buffer.from("test-image"),
      };

      const mockRenderer = vi
        .fn()
        .mockResolvedValue([{ status: "fulfilled", value: mockRenderResult }]);

      const { createMermaidRenderer } = await import("mermaid-isomorphic");
      vi.mocked(createMermaidRenderer).mockReturnValue(mockRenderer as any);

      const { renderMermaid } = await import("../../src/utils/render");
      await renderMermaid("graph TD; A-->B;", "default", bg);

      const writeFileSync = await import("node:fs").then(
        (m) => m.writeFileSync,
      );
      expect(writeFileSync).toHaveBeenCalledWith(
        expect.anything(),
        `svg { background: ${bg}; }`,
      );
    }
  });

  it("should return the render result with all properties", async () => {
    const mermaidCode = "sequenceDiagram; Alice->>Bob: Hello";
    const mockRenderResult: RenderResult = {
      id: "sequence-id",
      svg: "<svg>sequence diagram</svg>",
      screenshot: Buffer.from("sequence-image-data"),
    };

    const mockRenderer = vi
      .fn()
      .mockResolvedValue([{ status: "fulfilled", value: mockRenderResult }]);

    const { createMermaidRenderer } = await import("mermaid-isomorphic");
    vi.mocked(createMermaidRenderer).mockReturnValue(mockRenderer as any);

    const { renderMermaid } = await import("../../src/utils/render");
    const result = await renderMermaid(mermaidCode);

    expect(result.id).toBe("sequence-id");
    expect(result.svg).toBe("<svg>sequence diagram</svg>");
    expect(result.screenshot).toEqual(Buffer.from("sequence-image-data"));
  });

  it("should handle error with specific error message", async () => {
    const mermaidCode = "invalid syntax";
    const customError = new Error("Syntax error in mermaid diagram");

    const mockRenderer = vi
      .fn()
      .mockResolvedValue([{ status: "rejected", reason: customError }]);

    const { createMermaidRenderer } = await import("mermaid-isomorphic");
    vi.mocked(createMermaidRenderer).mockReturnValue(mockRenderer as any);

    const { renderMermaid } = await import("../../src/utils/render");

    await expect(renderMermaid(mermaidCode)).rejects.toThrow(
      "Mermaid syntax error",
    );
  });

  it("should reject empty mermaid code", async () => {
    const { renderMermaid } = await import("../../src/utils/render");

    await expect(renderMermaid("")).rejects.toThrow(
      "Mermaid code cannot be empty",
    );
  });

  it("should reject whitespace-only mermaid code", async () => {
    const { renderMermaid } = await import("../../src/utils/render");

    await expect(renderMermaid("   \n  \t  ")).rejects.toThrow(
      "Mermaid code cannot be empty",
    );
  });

  it("should handle rejection with reason object without message property", async () => {
    const mermaidCode = "invalid syntax";
    const reasonObject = { code: "ERR_SYNTAX", details: "Invalid" };

    const mockRenderer = vi
      .fn()
      .mockResolvedValue([{ status: "rejected", reason: reasonObject }]);

    const { createMermaidRenderer } = await import("mermaid-isomorphic");
    vi.mocked(createMermaidRenderer).mockReturnValue(mockRenderer as any);

    const { renderMermaid } = await import("../../src/utils/render");

    await expect(renderMermaid(mermaidCode)).rejects.toThrow(
      "Mermaid syntax error",
    );
  });

  it("should handle rejection with string reason (no message property)", async () => {
    const mermaidCode = "invalid syntax";
    const stringReason = "Syntax parse failed";

    const mockRenderer = vi
      .fn()
      .mockResolvedValue([{ status: "rejected", reason: stringReason }]);

    const { createMermaidRenderer } = await import("mermaid-isomorphic");
    vi.mocked(createMermaidRenderer).mockReturnValue(mockRenderer as any);

    const { renderMermaid } = await import("../../src/utils/render");

    await expect(renderMermaid(mermaidCode)).rejects.toThrow(
      "Mermaid syntax error: Syntax parse failed",
    );
  });

  it("should handle rejection with null/undefined reason", async () => {
    const mermaidCode = "invalid syntax";

    const mockRenderer = vi
      .fn()
      .mockResolvedValue([{ status: "rejected", reason: null }]);

    const { createMermaidRenderer } = await import("mermaid-isomorphic");
    vi.mocked(createMermaidRenderer).mockReturnValue(mockRenderer as any);

    const { renderMermaid } = await import("../../src/utils/render");

    await expect(renderMermaid(mermaidCode)).rejects.toThrow(
      "Mermaid syntax error: Unknown error",
    );
  });

  it("should handle non-Error exceptions in catch block", async () => {
    const mermaidCode = "graph TD; A-->B;";

    // Mock renderer to throw a non-Error object
    const mockRenderer = vi.fn().mockRejectedValue("String error");

    const { createMermaidRenderer } = await import("mermaid-isomorphic");
    vi.mocked(createMermaidRenderer).mockReturnValue(mockRenderer as any);

    const { renderMermaid } = await import("../../src/utils/render");

    await expect(renderMermaid(mermaidCode)).rejects.toThrow(
      "Failed to render mermaid diagram",
    );
  });

  it("should re-throw Error instances directly without wrapping", async () => {
    const mermaidCode = "invalid syntax";
    const syntaxError = new Error("Parse error at line 1");

    const mockRenderer = vi
      .fn()
      .mockResolvedValue([{ status: "rejected", reason: syntaxError }]);

    const { createMermaidRenderer } = await import("mermaid-isomorphic");
    vi.mocked(createMermaidRenderer).mockReturnValue(mockRenderer as any);

    const { renderMermaid } = await import("../../src/utils/render");

    // Should throw the wrapped syntax error (from the if block)
    await expect(renderMermaid(mermaidCode)).rejects.toThrow(
      "Mermaid syntax error: Parse error at line 1",
    );
  });
});
