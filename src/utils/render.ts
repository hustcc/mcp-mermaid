import * as path from "path";
import * as fs from "fs";
import * as os from "os";
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
  const cssContent = `svg { background: ${backgroundColor}; }`;
  const cssTmpPath = path.join(os.tmpdir(), 'mermaid-tmp-css.css');
  fs.writeFileSync(cssTmpPath, cssContent);

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
  return r0.status === "fulfilled" ? r0.value : Promise.reject(r0.reason);
}
