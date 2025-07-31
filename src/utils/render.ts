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
 * Get font family for Mermaid diagrams
 */
function getFontFamily(): string {
  // Allow custom font family override
  const customFont = process.env.MERMAID_FONT_FAMILY;
  if (customFont) {
    return customFont;
  }

  // Simple, reliable font stack with Chinese support
  return '"Noto Sans CJK SC", "Arial", "Helvetica", sans-serif';
}

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
  if (!renderer) {
    // Configure Playwright to use system Chromium in Docker
    const launchOptions: any = {};
    if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
    }
    
    renderer = createMermaidRenderer({
      launchOptions,
    });
  }
  const cssContent = `svg { background: ${backgroundColor}; }`;
  const cssTmpPath = path.join(os.tmpdir(), "mermaid-tmp-css.css");
  fs.writeFileSync(cssTmpPath, cssContent);

  const r = await renderer([mermaid], {
    // Image is needed.
    screenshot: true,
    css: cssTmpPath,
    mermaidConfig: {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      theme: theme as any,
      fontFamily: getFontFamily(),
    },
  });
  const r0 = r[0] as PromiseSettledResult<RenderResult>;
  return r0.status === "fulfilled" ? r0.value : Promise.reject(r0.reason);
}
