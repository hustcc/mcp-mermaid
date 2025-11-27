import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  type MermaidRenderer,
  type RenderResult,
  createMermaidRenderer,
} from "mermaid-isomorphic";

// Cache the renderer to avoid creating a new one every time.
let renderer: MermaidRenderer;

/**
 * Ref:
 * - https://github.com/mermaid-js/mermaid-cli/blob/master/src/index.js
 * - https://github.com/remcohaszing/mermaid-isomorphic
 * @returns
 */
export async function renderMermaid(
  mermaid: string,
  theme = "default",
  backgroundColor = "white",
): Promise<RenderResult> {
  if (!renderer) renderer = createMermaidRenderer();

  // Validate mermaid syntax is not empty
  if (!mermaid || mermaid.trim().length === 0) {
    throw new Error("Mermaid code cannot be empty");
  }

  const cssContent = `svg { background: ${backgroundColor}; }`;
  const cssTmpPath = path.join(os.tmpdir(), "mermaid-tmp-css.css");
  fs.writeFileSync(cssTmpPath, cssContent);

  try {
    const r = await renderer([mermaid], {
      // Image is needed.
      screenshot: true,
      css: cssTmpPath,
      mermaidConfig: {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        theme: theme as any,
      },
    });
    const r0 = r[0] as PromiseSettledResult<RenderResult>;

    if (r0.status === "rejected") {
      // Check if it's a syntax error or other type of error
      const reason = r0.reason;
      const errorMessage =
        reason?.message || (reason ? String(reason) : "Unknown error");

      // Determine if it's likely a syntax error based on error message
      const isSyntaxError =
        errorMessage.toLowerCase().includes("syntax") ||
        errorMessage.toLowerCase().includes("parse") ||
        errorMessage.toLowerCase().includes("invalid");

      if (isSyntaxError) {
        throw new Error(
          `Mermaid syntax error: ${errorMessage}.\nTip: For flowcharts, use 'flowchart TD' instead of 'graph TD' in Mermaid v10+.\nCheck your syntax at https://mermaid.live/`,
        );
      }

      // Other rendering errors (memory, timeout, browser issues, etc.)
      throw new Error(`Failed to render mermaid diagram: ${errorMessage}`);
    }

    return r0.value;
  } catch (error) {
    // Re-throw errors that are already Error instances (including our custom ones)
    if (error instanceof Error) {
      throw error;
    }
    // Handle non-Error exceptions
    throw new Error(`Failed to render mermaid diagram: ${error}`);
  }
}
